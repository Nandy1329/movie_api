const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');
const { jwtSecret } = require('./auth.js'); // import jwtSecret from auth.js
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
  
let Users = Models.User;
console.log(Users);



console.log(jwtSecret);

    passport.use(
    new LocalStrategy(
        {
            usernameField: 'Username',
            passwordField: 'Password',
        },
        async (username, password, callback) => {
            console.log(`${username} ${password}`);
            await Users.findOne({ Username: username })
                .then((user) => {
                    if (!user) {
                        console.log('Incorrect username.');
                        return callback(null, false, {
                            message: 'Incorrect username or password.'
                        });
                    }
                    if (!user.validatePassword(password)) {
                        console.log('Incorrect password.');
                        return callback(null, false, {
                            message: 'Incorrect username or password.'
                        });
                    }
                    console.log('finished');
                    return callback(null, user);
                })
                .catch((error) => {
                    if (error) {
                        console.log(error);
                        return callback(error);
                    }
                });
        }
    )
);

passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'your_jwt_secret' // use jwtSecret as the secret key
        }, async (jwtPayload, callback) => {
            return await Users.findById(jwtPayload._id)
                .then((user) => {
                    return callback(null, user);
                })
                .catch((error) => {
                    return callback(error);
                });
        }));