const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let JWTStrategy = passportJWT.Strategy;
let ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log('Attempting to authenticate user:', username);
    Users.findOne({ Username: username })
        .then(user => {
            if (!user) {
                console.log('User not found:', username);
                return callback(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validatePassword(password)) {
                console.log('Incorrect password for user:', username);
                return callback(null, false, { message: 'Incorrect password.' });
            }
            console.log('User authenticated successfully:', username);
            return callback(null, user);
        })
        .catch(err => {
            console.error('Error during authentication:', err);
            return callback(err);
        });
}));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
        .then((user) => {
            if (!user) {
                console.log('User not found for JWT:', jwtPayload._id);
                return callback(null, false);
            }
            console.log('User found for JWT:', jwtPayload._id);
            return callback(null, user);
        })
        .catch((error) => {
            console.error('Error during JWT authentication:', error);
            return callback(error);
        });
}));
