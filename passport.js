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
  Users.findOne({ Username: username })
    .then(user => {
      if (!user || !user.validatePassword(password)) {
        return callback(null, false, { message: 'Incorrect username or password.' });
      }
      return callback(null, user);
    })
    .catch(error => callback(error));
}));

// JWT Strategy for verifying JWT tokens
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret' // Use environment variable for security
}, (jwtPayload, callback) => {
  Users.findById(jwtPayload._id)
    .then(user => {
      if (!user) {
        return callback(null, false);
      }
      return callback(null, user);
    })
    .catch(error => callback(error));
}));

module.exports = passport;