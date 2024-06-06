/* eslint-disable no-unused-vars */
// Load environment variables from .env file
require('dotenv').config();

// setup requirements and constants
const express = require('express'),
  morgan = require('morgan'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  path = require('path'),
  jwt = require('jsonwebtoken'),
  expressJwt = require('express-jwt'),
  { check, validationResult } = require('express-validator'),
  cors = require('cors');

const Movies = Models.Movie;
const Users = Models.User;
const { Director } = Models;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS access
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://myflixapp.herokuapp.com/'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

// Preflight request handling
app.options('*', cors());

// Authentication setup
let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

// Connect to MongoDB
const connectionString = process.env.CONNECTION_URI;
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connection successful'))
  .catch(err => console.error('Database connection error', err));

// Middleware for parsing requests
app.use(express.json());

// Setup morgan logging
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'log.txt'), 
  { flags: 'a' } // append to the file 'log.txt'
);

app.use(morgan('combined', { stream: accessLogStream })); // enable morgan logging to 'log.txt'

// Setup Static Files
app.use(express.static('public')); // routes all requests for static files to the 'public' folder

// Setup Routes
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

// Route for returning a list of ALL movies to the user
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Other routes...

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
