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
const { Movies, Users } = require('./models.js');
const app = express();

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

// app landing page
app.get('/', (_, res) => {
  res.send('Welcome to myFlix!');
});

// Returns a list of ALL movies to the user
app.get('/movies',
// passport.authenticate('jwt', {session: false}), 
(req, res) => {
    Movies.find()
    .then((movies) =>
    {res.status(201).json(movies);
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

    // Return data about a genre (description) by name/title (e.g., "Thriller")
    app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), (req, res) => {
      Movies.findOne({ 'Genre.Name': req.params.Genre })
        .then((movie) => {
          if (!movie) {
            res.status(404).send('Error: ' + req.params.Genre + ' was not found');
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
    app.get('/directors', passport.authenticate('jwt', { session: false }), async (_, res) => {
      try {
        const directors = await Movies.find();
        res.json(directors);
      } catch (error) {
        console.error('Error', error);
        res.status(500).json({ error: 'Error' });
      }
    });

    // Return list of movies by directors name
    app.get("/movies/directors/:directorName", passport.authenticate('jwt', { session: false }), async (req, res) => {
      await Movies.find({ "Director.Name": req.params.directorName })
        .then((movies) => {
          res.json(movies);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    });

    // Allows new users to register  
    app.post('/users',[check('Username', 'Username is required').isLength({min: 5}), 
    check( 'Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
let errors = validationResult(req);

if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
}
let hashedPassword = Users.hashPassword(req.body.Password);
Users.findOne({Username: req.body.Username})
.then((user) => {
    if(user) {
        return res.status(400).send(req.body.Username + ' already exists');
    } else {
        Users
            .create({
                Username: req.body.Username,
                Password: hashedPassword, 
                Email: req.body.Email, 
                Birthday: req.body.Birthday
            })
            .then((user) => {res.status(201).json(user)})
            .catch((error) => {console.error(error);
                res.status(500).send('Error: ' + error); 
            })
    }
})
.catch((error) => {
    console.error(error);
    res.status(500).send('Error: ' + error);
});
});

// Update a user's info, by username
app.put('/users/:Username', [check('Username', 'Username is required').isLength({min: 5}), 
check( 'Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
check('Password', 'Password is required').not().isEmpty(),
check('Email', 'Email does not appear to be valid').isEmail()
],(req, res) => {
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

// Allows user to add a movie to their list of favorites
    app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
        Users.findOneAndUpdate({ Username: req.params.Username}, {
        $push: {FavoriteMovies: req.params.MovieID}
      },
      { new: true})
      .then((updatedUser) => {
        if(!updatedUser) {
          return res.send('Error: No user');
        } else {
          res.json(updatedUser);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
});

// Allows user to remove a movie from their list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}),(req, res) =>{
  Users.findOneAndUpdate({ Username: req.params.Username}, {
      $pull: {FavoriteMovies: req.params.MovieID}
  },
  { new: true})
  .then((updatedUser) => {
      if(!updatedUser) {
          return res.send('Error: No user');
      } else {
          res.json(updatedUser);
      }
  } )
});

//Allows a user to deregister
app.delete('/users/:Username',passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
  .then ((user) => {
      if(!user) {
          res.status(400).send(req.params.Username + ' was not found');
      } else {
          res.status(200).send(req.params.Username + ' was deleted forever');
      }
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: '+ err);
  });
});

// Error handling
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port ' + port);
});
  