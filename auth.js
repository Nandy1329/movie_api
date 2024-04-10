const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken'),
passport = require('passport');
require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user) => {
            if(error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user : user
                });
            }
            req.login(user, {session: false}, (error) => {
                if(error){
                    console.error(error);
                    return res.status(500).json({message: 'An error occurred during login'});
                }
                let token = generateJWTToken(user);
                return res.json({user, token });
            });
        }) (req, res);
    });
}