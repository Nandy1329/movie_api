const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const Users = Models.User;

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, done) => {
    Users.findOne({ Username: username }, (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return done(err);
        }
        if (!user) {
            console.error('Incorrect username');
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validatePassword(password)) {
            console.error('Incorrect password');
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    Users.findById(id, (err, user) => {
        done(err, user);
    });
});
