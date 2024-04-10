const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // Import the LocalStrategy module
const JWTStrategy = require('passport-jwt').Strategy; // Import the JWTStrategy module
const ExtractJWT = require('passport-jwt').ExtractJwt; // Import the ExtractJWT module
const Models = require('./models'); // Import the models

let Users = Models.User; // Get the User model

passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',       
        },
        async (username, password, callback) => {
            try {
                const user = await Users.findOne({ username: username });
                if (!user) {
                    console.log('incorrect username');
                    return callback(null, false, { message: 'Incorrect username or password.' });
                }
                if (!user.validatePassword(password)) {
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
                const user = await Users.findById(jwtPayload._id);
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