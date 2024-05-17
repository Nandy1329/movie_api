/* eslint-disable no-undef */
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const Models = require('./models.js'); 
const { check, validationResult} = require('express-validator');


const Movies = Models.Movie;
const Users = Models.User;

const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true}); 

//allow all CORS access
const cors = require('cors'); 
app.use(cors());


// eslint-disable-next-line no-unused-vars
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport'); 

app.use(morgan('common'));
app.use(express.static('public'));

//importing auth.js
app.use('/', authRouter);



//movie app landing page
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});


// Return a list of all movies to the user
app.get('/movies',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Movies.find()
            .then((movies) => {
                res.status(201).json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            })
    });

// Return data about a single movie by title to the user
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Return data about a movie genre (description) by name/title (e.g., "Thriller")
app.get('/movies/genre_description/:Genre', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Genre })
        .then((movie) => {
            if (!movie) {
                return res.status(404).send('Error: ' + req.params.Genre + ' was not found');
            } else {
                res.status(200).json(movie.Genre.Description);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Return data about a director (bio, birth year, death year) by name
app.get('/movies/director_description/:Director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Director })
        .then((movie) => {
            if (!movie) {
                return res.status(404).send('Error: ' + req.params.Director + ' was not found');
            } else {
                res.status(200).json(movie.Director);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow new users to register
app.post('/users', [check('Username', 'Username is required').isLength({ min: 5 }),
check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + ' already exists');
            } else {
                Users
                    .create({
                        Username: req.body.Username,
                        Password: hashedPassword,
                        Email: req.body.Email,
                        Birthday: req.body.Birthday,
                        FavoriteMovies: req.body.FavoriteMovies
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
})
// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow users to update their user info (username)
app.put('/users/:Username', [check('Username', 'Username is required').isLength({ min: 5 }),
check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
            $set: {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday,
            },
        },
        { new: true }
    )
        .then((user) => {
            if (!user) {
                return res.status(404).send('Error: No user was found');
            } else {
                res.json(user);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow users to add a movie to their list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.send('Error: No user');
            } else {
                res.json(updatedUser);
            }
        })
        // eslint-disable-next-line no-unused-vars
        .catch((error) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Allow users to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
        { new: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.send('Error: No user');
            } else {
                res.json(updatedUser);
            }
        })
        // eslint-disable-next-line no-unused-vars
        .catch((error) => {
            console.error(err);
            // eslint-disable-next-line no-undef
            res.status(500).send('Error: ' + err);
        });
});

// Allow existing users to deregister
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted forever');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//error handling
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Send help, I broke');
})

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('listening on port ' + port);
});