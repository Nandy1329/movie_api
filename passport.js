const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// Local Strategy for username and password authentication
passport.use(new LocalStrategy({
  usernameField: 'Username',
  passwordField: 'Password'
}, (username, password, callback) => {
  console.log('Attempting to authenticate user:', username); // Log username

  Users.findOne({ Username: username })
    .then(user => {
      if (!user) {
        console.log('User not found:', username);
        return callback(null, false, { message: 'Incorrect username or password.' });
      }

      if (!user.validatePassword(password)) {
        console.log('Invalid password for user:', username);
        return callback(null, false, { message: 'Incorrect username or password.' });
      }

      console.log('User authenticated successfully:', username);
      return callback(null, user);
    })
    .catch(error => {
      console.error('Error during local authentication:', error);
      return callback(error);
    });
}));


// JWT Strategy for verifying JWT tokens
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret' // Use environment variable for security
}, (jwtPayload, callback) => {
  console.log('JWT Payload:', jwtPayload); // Log JWT payload

  Users.findById(jwtPayload._id)
    .then(user => {
      if (!user) {
        console.log('User not found for JWT payload:', jwtPayload);
        return callback(null, false);
      }

      console.log('User authenticated with JWT:', user.Username);
      return callback(null, user);
    })
    .catch(error => {
      console.error('Error during JWT authentication:', error);
      return callback(error);
    });
}));