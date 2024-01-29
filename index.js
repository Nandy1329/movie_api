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
    { check, validationResult } = require('express-validator'),
    cors = require('cors');

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS access 
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connection successful'))

// middleware for parsing requests
app.use(express.json());

// setup morgan logging
    const accessLogStream = fs.createWriteStream(
      path.join(__dirname, 'log.txt'), 
      { flags: 'a' } // append to the file 'log.txt'
   
);

app.use(
    morgan('combined', { stream: accessLogStream }) // enable morgan logging to 'log.txt'
);

// setup Static Files
app.use(
    express.static('public') // routes all requests for static files to the 'public' folder
);

// setup Routes
app.get('/', (req, res) => {
    res.send('Welcome to myFlix!');
});



// #1 Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } );
});


// #2 Return data about a single movie by title 
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// # 3 Return data about a genre (description) by name
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

// #4 Return data about a director (bio, birth year, death year) by name

app.get('/directors', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const directors = await Directors.find();
    res.json(directors);
  } catch (error){
    console.error('Error',error);
    res.status(500).json({error: 'Error'});
  }
});
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res)=>{
  Directors.findOne({Name: req.params.Name})
    .then((directors) =>{
      res.json(directors);
    })
    .catch((err) =>{
      console.error(err);
      res.status(500).send('Error: '+ err);
    });
});


// #5 Allow new users to register
app.post('/users', [ 
  check('Username', 'Username is required').isLength({min: 5}),
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
      // Add additional operations here
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  }
});
 // This is where the closing parenthesis and bracket should be

// #6 Allow users to update their user info 
/* We’ll expect JSON in this format
{
  Username: String, (required)
  Password: String, (required)
  Email: String, (required)
  Birthday: Date
}*/
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
      { new: true }) // this makes sure that the updated document is returned
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// #7 Allow users to add a movie to their list of favorites
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

// #8 Allow users to remove a movie from their list of favorites
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

// #9 Allow existing users to deregister (Delete a user by name)
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


// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

// Create error-handling
app.use((req, res, next) => {
  // your code here
  next();
});