const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const Models = require('./models.js');

const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, async (username, password, callback) => {
    try {
        const user = await Users.findOne({ Username: username });
        if (!user || !user.validatePassword(password)) {
            return callback(null, false, { message: 'Incorrect username or password.' });
        }
        return callback(null, user);
    } catch (error) {
        return callback(error);
    }
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}, async (jwtPayload, callback) => {
    try {
        const user = await Users.findById(jwtPayload._id);
        if (!user) {
            return callback(null, false);
        }
        return callback(null, user);
    } catch (error) {
        return callback(error);
    }
}));

module.exports = passport;
