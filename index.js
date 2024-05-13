/* eslint-disable no-undef */
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const passport = require('passport');
const bcrypt = require('bcrypt');
const generateJWTToken = require('./auth');

const Movies = Models.Movie;
const Users = Models.User;

const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
    'http://localhost:8080',
    'http://testsite.com',
    'http://localhost:1234',
    'https://myflixapp.herokuapp.com/'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connection successful'))
    .catch(err => console.error('Database connection error', err));

require('./passport');
app.use(morgan('common'));
app.use(express.static('public'));

// Routes
// Landing page
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});

// Retrieve all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const movies = await Movies.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Retrieve a single movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const movie = await Movies.findOne({ Title: req.params.title });
        res.json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Retrieve movies by genre
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const movies = await Movies.find({ Genre: req.params.genre });
        if (movies.length === 0) {
            res.status(404).send(`${req.params.genre} movies not found.`);
        } else {
            res.json(movies);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Retrieve director information by name
app.get('/movies/director_description/:Director', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const movie = await Movies.findOne({ 'Director.Name': req.params.Director });
        if (!movie) {
            res.status(404).send(`${req.params.Director} not found.`);
        } else {
            res.status(200).json(movie.Director);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// User registration
app.post('/users', [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const hashedPassword = await bcrypt.hash(req.body.Password, 10);
        const existingUser = await Users.findOne({ Username: req.body.Username });
        if (existingUser) {
            return res.status(400).send(`${req.body.Username} already exists`);
        } else {
            const user = await Users.create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            });
            res.status(201).json(user);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// User login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right' + info + " " + error,
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

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = await Users.findOne({ Username: req.params.Username });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Update user information
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const updatedUserData = {};
        if (req.body.Username) updatedUserData.Username = req.body.Username;
        if (req.body.Password) updatedUserData.Password = await bcrypt.hash(req.body.Password, 10);
        if (req.body.Email) updatedUserData.Email = req.body.Email;
        if (req.body.Birthday) updatedUserData.Birthday = req.body.Birthday;

        const updatedUser = await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $set: updatedUserData },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Add a movie to user's favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const updatedUser = await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $push: { FavoriteMovies: req.params.MovieID } },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Remove a movie from user's favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const updatedUser = await Users.findOneAndUpdate(
            { Username: req.params.Username },
            { $pull: { FavoriteMovies: req.params.MovieID } },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Deregister a user
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const user = await Users.findOneAndRemove({ Username: req.params.Username });
        if (!user) {
            res.status(404).send(`${req.params.Username} not found`);
        } else {
            res.status(200).send(`${req.params.Username} was deleted.`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// Admin route
function isAdmin(req, res, next) {
    if (req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
}

app.get('/admin', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
    res.send('Welcome, admin!');
});

// Error handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error: ' + err.message);
});

// Server listening
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Server is listening on port ' + port);
});
