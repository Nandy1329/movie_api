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
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error) {
                console.log(error);
                return res.status(400).json(JSON.stringify({
                  message: 'Error. Something is not right.',
                  user: user
              }));
                   
            }
            if (!user) {
                return res.status(400).json({
                    message: 'Error. No user.',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
};
