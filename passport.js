const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

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

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret'
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