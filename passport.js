/* eslint-disable no-unused-vars */
const jwtSecret = process.env.JWT_SECRET; // Use environment variable for JWT secret

const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;

require('./passport.js'); // Your local passport file

let Users = Models.User;

// Local Strategy
passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        },
        async (jwtPayload, callback) => {
            console.log(`Verifying token for user ID: ${jwtPayload._id}`); // Add this line
            return await Users.findById(jwtPayload._id)
                .then((user) => {
                    if (!user) {
                        console.log('User not found.');
                        return callback(null, false);
                    }
                    console.log('Token verification successful.');
                    return callback(null, user);
                })
                .catch((error) => {
                    console.error('Error during token verification:', error);
                    return callback(error);
                });
        }
    )
);


// JWT Strategy
passport.use(
    new passportJWT.Strategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
        },
        async (jwtPayload, callback) => {
            console.log(`Verifying token for user ID: ${jwtPayload._id}`);
            try {
                const user = await Users.findById(jwtPayload._id);
                if (!user) {
                    console.log('User not found.');
                    return callback(null, false);
                }
                console.log('Token verification successful.');
                return callback(null, user);
            } catch (error) {
                console.error('Error during token verification:', error);
                return callback(error);
            }
        }
    )
);

// Function to generate JWT token
let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
};

// Export login route handler
module.exports = (router) => {
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error) {
                console.log(error);
                return res.status(400).json({
                    message: 'Error. Something is not right.',
                    user: user
                });
            }
            if (!user) {
                return res.status(400).json({
                    message: 'Error. No user.',
                    user: user
                });
            }
            req.login(user, { session: false }, async (error) => {
                if (error) {
                    return next(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res, next);
    });
};
