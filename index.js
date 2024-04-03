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

app.get('/', (_, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/movies', (_, res) => {
  Movie.find()
    .populate('Director') 
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/:Title', (req, res) => {
  Movie.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movie.findOne({ 'Genre.Name': req.params.genreName })
    .then((movie) => {
      if (movie) {
        res.status(200).json(movie.Genre);
      } else {
        res.status(404).send('No movie found with that genre');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err.message);
    });
});

app.get('/directors', passport.authenticate('jwt', { session: false }), async (_, res) => {
  try {
    const directors = await Movie.find();
    res.json(directors);
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ error: 'Error' });
  }
});

app.get("/movies/directors/:directorName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movie.find({ "Director.Name": req.params.directorName })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

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

  let hashedPassword = User.hashPassword(req.body.Password);
  let user = await User.findOne({ Username: req.body.Username });

  if (user) {
    return res.status(400).send(req.body.Username + ' already exists');
  } else {
    User.create({
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    })
      .then((user) => {
        res.status(201).json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
});

const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
}

app.post('/users/login', async (req, res) => {
  try {
    const { Username, Password } = req.body;
    if (!Username || !Password) {
      return res.status(400).json({ message: 'Both Username and Password are required' });
    }
    const user = await User.findOne({ Username });
    if (!user) {
      return res.status(401).json({ message: 'No user found with that username' });
    }
    const passwordIsValid = bcrypt.compareSync(Password, user.Password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate a token
    const token = generateToken(user);

    // Send the user data and token
    res.json({ user: user, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred' });
  }
});

app.put('/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let updatedUserData = {};
    if (req.body.Username) updatedUserData.Username = req.body.Username;
    if (req.body.Password) updatedUserData.Password = User.hashPassword(req.body.Password);
    if (req.body.Email) updatedUserData.Email = req.body.Email;
    if (req.body.Birthday) updatedUserData.Birthday = req.body.Birthday;

    User.findOneAndUpdate({ Username: req.params.Username },
      { $set: updatedUserData },
      { new: true })
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findOne({ Username: req.params.Username })
    .populate('FavoriteMovies') 
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findOneAndUpdate(
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

function isAdmin(req, res, next) {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Forbidden');
  }
}

app.get('/admin', passport.authenticate('jwt', { session: false }), isAdmin, function (req, res) {
  res.send('Welcome, admin!');
});

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke! ' + err.stack);
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});