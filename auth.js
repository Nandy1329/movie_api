const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable for security

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // Ensure the passport configuration is imported

// Function to generate JWT token
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}

module.exports = function(app) {
  app.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Login failed. ' + (info ? info.message : '') + (error ? error.message : ''),
          user: user
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(500).json({ message: 'Error during login process', error: error.message });
        }

        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
