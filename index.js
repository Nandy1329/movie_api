/* eslint-disable no-unused-vars */
const dotenv = require('dotenv');
dotenv.config();
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// setup requirements and constants
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const { Movie, User } = require('./models.js');
const app = express();
const bcrypt = require('bcrypt');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS access 
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://myflixapp.herokuapp.com/'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}))


require('./auth.js')(app);
require('./passport.js');

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })

  .then(() => console.log('Database connection successful'))
  .catch(err => console.error('Database connection error', err));

app.use(express.json());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'log.txt'),
  { flags: 'a' }
);

app.use(
  morgan('combined', { stream: accessLogStream })
);

app.use(
  express.static('public')
);

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

// Add a user
/* We'll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users',
   // Validation logic here for request
   // you can either use a chain of methods like .not() .isEmpty()
   // which means "opposite of isEmpty" in plain english " is not empty"
   // or use .isLength({min: 5}) which means
   // minimum value of 5 characters are allowed
   [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
   ], (req, res) => {

  // check the validation object for errors
  let errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = User.hashPassword(req.body.Password);
  User.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
   .then((user) => {
     if (user) {
      // If the user is found, send a response that it already exists
      return res.status(400).send(req.body.Username + 'already exists');
     } else {
      User
        .create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        });
     }
   })
   .catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
   });
});

// UPDATE a user's info, by username
/* We'll expect JSON in this format
[
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
]*/
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findOneAndUpdate({ Username: req.params.Username},
     { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
     },
     { new: true }, // This line makes sure that the updated document is returned
     )
     .then(updatedUser => {
      res.json(updatedUser);
     })
     .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.updateOne({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
   )
   .then(updatedUser => {
    res.json(updatedUser);
   })
   .catch(err => {
    console.error(err);
    res.status(500).send('Error: ' + err);
   });
});


// Delete a movie from user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findOneAndDelete({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
  { new: true }, // This line makes sure that the updated document is returned
  )
  .then(updatedUser => {
    res.json(updatedUser);
   })
   .catch(err => {
    console.error(err);
    res.status(500).send('Error: ' + err);
   });
});

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted. ');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get all movies
app.get('/movies',passport.authenticate('jwt', {session: false}), (req, res) => {
  Movie.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get movie info by specific title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movie.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// GET movie by genre
app.get('/movies/genre/:genreName',  passport.authenticate('jwt', {session: false}), (req, res) => {
  Movie.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// GET movie by director
app.get('/movies/directors/:directorName', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movie.findOne({ 'Director.Name': req.params.directorName })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get all users
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/user/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});