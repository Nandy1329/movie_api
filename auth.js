/* eslint-disable no-unused-vars */
const jwtSecret = process.env.JWT_SECRET; // Use environment variable for JWT secret

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport.js'); // Your local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, // This is the username you're encoding in the JWT
        expiresIn: '7d', // This specifies that the token will expire in 7 days
        algorithm: 'HS256' // This is the algorithm used to "sign" or encode the values of the JWT
    });
};

/* POST login */
module.exports = (router) => {
    router.post('/login', (req, res, next) => { // Add next here
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error) {
                console.error('Authentication error:', error);
                return next(error);
            }
            if (!user) {
                console.error('No user found');
                return res.status(400).json({
                    message: 'No user found',
                    user: null
                });
            }
            req.login(user, { session: false }, (loginError) => {
                if (loginError) {
                    console.error('Login error:', loginError);
                    return next(loginError);
                }
                const token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res, next);
    });
};
