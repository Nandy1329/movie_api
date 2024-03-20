const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // replace with your User model path
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require('./models.js');
// Local strategy
passport.use(new LocalStrategy({
  usernameField: 'username',    // define the parameter in req.body that passport can use as username and password
  passwordField: 'password'
}, (username, password, done) => {
<<<<<<< Updated upstream
  User.findOne({ username: username }, (err, user) => {
=======
  User.findOne({ Username: username }, (err, user) => {
>>>>>>> Stashed changes
    if (err) { 
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.validatePassword(password)) { 
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
}));

// JWT strategy
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'your_jwt_secret'
  },
  function (jwtPayload, cb) {
    return User.findById(jwtPayload.id)
      .then(user => {
        return cb(null, user);
      })
      .catch(err => {
        return cb(err);
      });
  }
));