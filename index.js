// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    Models = require('./models.js');

const { check, validationResult } = require('express-validator');

const Genres = Models.Genre;
const Directors = Models.Director;
const Movies = Models.Movie;
const Users = Models.User;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS access 
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://myflixapp.herokuapp.com/'];

import cors from 'cors';

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

require('/auth.js') //import the auth.js file from the same directory as index.js
    const passport = require('passport');
require('./passport.js');

// Connect to local database
// mongoose.connect('mongodb://localhost:27017/myFlixDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// Connect to database on MonoDB Atlas
mongoose.connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// setup Logging
const accessLogStream = fs.createWriteStream( // create a write stream
    path.join(__dirname, 'log.text'), //a 'log.txt' file is created in the root directory
    { flags: 'a' } // path.join appends it to 'log.text'
);

app.use(
    morgan('combined', { stream: accessLogStream }) // enable morgan logging to 'log.txt'
);

// setup Static Files
app.use(
    express.static('public')); // routes all requests for static files to the 'public' folder

app.get('/', (_, res) => {
    res.send('Welcome to myFlix!');
});

app.get('/movies', (_, res) => {
    Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/movies/:Title',  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/genres', (req, res) => {
    Genres.find()
      .then(genres => { res.status(200).json(genres) })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  });
  
app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName })
        .then((movie) => {
            res.status(200).json(movie.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/directors', (req, res) => {
    Directors.find()
      .then(directors => { res.status(200).json(directors) })
      .catch(error => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  });

app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
        .then((directors) => {
            res.json(directors);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
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

    let hashedPassword = Users.hashPassword(req.body.Password);
    let user = await Users.findOne({ Username: req.body.Username });

    if (user) {
        return res.status(400).send(req.body.Username + ' already exists');
    } else {
        Users.create({
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

app.put('/users/:Username',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        let updatedUserData = {};
        if (req.body.Username) updatedUserData.Username = req.body.Username;
        if (req.body.Password) updatedUserData.Password = Users.hashPassword(req.body.Password);
        if (req.body.Email) updatedUserData.Email = req.body.Email;
        if (req.body.Birthday) updatedUserData.Birthday = req.body.Birthday;

        Users.findOneAndUpdate({ Username: req.params.Username },
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

app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $push: { FavoriteMovies: req.params.MovieID } },
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

app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
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
    Users.findOneAndRemove({ Username: req.params.Username })
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

app.use((err, _, res) => {
    console.error(err.stack);
    res.status(500).send('something is not working!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
}
);