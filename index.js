/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
require('dotenv').config();

// Setup requirements and constants
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const passport = require('./passport');
const auth = require('./auth.js');
const bcrypt = require('bcrypt');
const { Movies, Genres, Directors, Users } = require('./models.js');
const app = express();

app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
}));

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connection successful');
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

// Schema Definitions
const genreSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true }
});

const directorSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  Birth: { type: String, required: true },
  Year: { type: String, required: true }
});

const movieSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre', required: true },
  Director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director', required: true },
  Featured: { type: Boolean, required: true },
  Year: { type: Number, required: true },
  ImagePath: { type: String, required: true }
}, { collection: 'movies' });

const userSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birth_Date: Date,
  Favorite_Movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }]
});

// Hash & Validate user passwords
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};


// Routes
app.get('/', (req, res) => {
  res.send('Welcome to my movie page!');
});

// READ all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      if (movies.length === 0) {
        return res.status(200).json([]);
      }
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

// READ a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  const title = req.params.Title.trim();
  Movies.findOne({ Title: new RegExp('^' + title + '$', 'i') })
    .then((movie) => {
      if (!movie) {
        return res.status(404).send('Movie not found');
      }
      res.status(200).json(movie);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

// Return data about a genre by name
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Genres.findOne({ 'Name': req.params.genreName })
    .then((genre) => {
      if (!genre) {
        return res.status(404).send('Genre not found');
      }
      res.status(200).json(genre);
    })
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

// Return data about a director by name
app.get('/directors', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const directors = await Directors.find();
    res.json(directors);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving directors' });
  }
});

app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Directors.findOne({ Name: req.params.Name })
    .then((director) => {
      if (!director) {
        return res.status(404).send('Director not found');
      }
      res.json(director);
    })
    .catch((err) => {
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
    .catch((err) => {
      res.status(500).send('Error: ' + err);
    });
});

// Remove a movie from user's favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { Favorite_Movies: req.params.MovieID }
  }, { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
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
      res.status(500).send('Error: ' + err);
    });
});

// Error handling
app.use((err, req, res, next) => {
  res.status(500).send("Something broke!");
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log("Your app is listening on port " + port);
});
