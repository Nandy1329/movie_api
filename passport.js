const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const { User } = require('./models/models');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',       
        },
        async (username, password, callback) => {
            try {
                const user = await User.findOne({ Username: username.toLowerCase() });
                if (!user) {
                    console.log('incorrect username');
                    return callback(null, false, { message: 'Incorrect username or password.' });
                }
                if (!await user.validatePassword(password)) {
                    console.log('incorrect password');
                    return callback(null, false, { message: 'Incorrect password.' });
                }
                console.log('finished');
                return callback(null, user);
            } catch (error) {
                console.log(error);
                return callback(error);
            }
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwtPayload, callback) => {
            try {
                const user = await User.findById(jwtPayload._id);
                if (!user) {
                    return callback(null, false);
                }
                return callback(null, user);
            } catch (error) {
                return callback(error);
            }
        }
    )
);