/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
require('dotenv').config();

// Setup requirements and constants
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const { check, validationResult } = require('express-validator');
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;
const auth = require('./auth.js');

const app = express();

const passport = require('./passport');

app.use(passport.initialize());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let allowedOrigins = [
  'http://localhost:8080',
  'http://testsite.com',
  'http://localhost:1234',
  'https://myflixapp.herokuapp.com',
  'https://nickis1329-myflixdb.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    console.log('Origin:', origin); // Log the origin for debugging
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const movies = mongoose.connection.db.collection('movies')
    movies.find().toArray((err, m) => { console.log(m) })
    console.log('Database connection successful')
  })
  .catch(err => console.error('Database connection error', err));

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

auth(app);

app.get('/', (req, res) => {
  res.send('Welcome to my movie page!');
});

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .populate('Genre')
    .populate('Director')
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

  Movies.find()
    .populate('Genre')
    .populate('Director')
    .then((movies) => {
      if (movies.length === 0) {
        console.log('No movies found');
        return res.status(200).json([]); // Return empty array if no movies
      }
      console.log('Movies found:', movies.length);
      res.status(200).json(movies); // Return movies directly as array
    })
    .catch((err) => {
      console.error('Error retrieving movies:', err);
      res.status(500).send('Error: ' + err);
    });


// READ a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  const title = req.params.Title.trim();
  console.log(`Searching for movie title: '${title}'`);
  Movies.findOne({ Title: new RegExp('^' + title + '$', 'i') })
    .then((movie) => {
      if (!movie) {
        console.log('Movie not found');
        return res.status(404).send('Movie not found');
      }
      console.log('Movie found:', movie);
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error('Error searching for movie:', err);
      res.status(500).send('Error: ' + err);
    });
});

// Return data about a genre by name
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log('Received request to get genre:', req.params.genreName);
  Genres.findOne({ 'Name': req.params.genreName })
    .then((genre) => {
      if (!genre) {
        return res.status(404).send('Genre not found');
      }
      res.status(200).json(genre);
    })
    .catch((err) => {
      console.error('Error retrieving genre:', err);
      res.status(500).send('Error: ' + err);
    });
});


// return a list of all directors
app.get('/directors', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const directors = await Directors.find();
    res.json(directors);
  } catch (error) {
    console.error('Error retrieving directors:', error);
    res.status(500).json({ error: 'Error retrieving directors' });
  }
});

// Return data about a director by name
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Directors.findOne({ Name: req.params.Name })
    .then((director) => {
      if (!director) {
        return res.status(404).send('Director not found');
      }
      res.json(director);
    })
    .catch((err) => {
      console.error('Error retrieving director:', err);
      res.status(500).send('Error: ' + err);
    });
});

// Register a new user
app.post('/users', [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email is not valid').isEmail()
], async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  try {
    let user = await Users.findOne({ Username: req.body.Username });
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      let newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error: ' + error);
  }
});


// READ all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error('Error retrieving users:', err);
      res.status(500).send('Error: ' + err);
    });
});


// READ a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.json(user);
    })
    .catch((err) => {
      console.error('Error retrieving user:', err);
      res.status(500).send('Error: ' + err);
    });
});


// UPDATE user information by username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    let oldData = await Users.findOne({ Username: req.params.Username });
    if (!oldData) {
      return res.status(404).send('User not found');
    }

    let hashedPassword = req.body.Password ? Users.hashPassword(req.body.Password) : oldData.Password;
    let updatedUser = await Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set: {
        Username: req.body.Username || oldData.Username,
        Password: hashedPassword,
        Email: req.body.Email || oldData.Email,
        Birthday: req.body.Birthday || oldData.Birthday
      }
    }, { new: true });

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).send('Error: ' + err);
  }
});


// Add a movie to user's favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { Favorite_Movies: req.params.MovieID }
  }, { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


// Remove a movie from user's favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  }, { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error('Error removing favorite movie:', err);
      res.status(500).send('Error: ' + err);
    });
});

// DELETE user by Username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error('Error deleting user:', err);
      res.status(500).send('Error: ' + err);
    });
});


// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something broke!");
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log("Your app is listening on port " + port);
});
