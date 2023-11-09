const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));


mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true});




app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use*(morgan('common'));

// 1 Return a list of ALL movies
app.get('movies', async (req, res) => {
  await Movies.find()
    .then((movies) =>  {
        res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



// #2 Return data about a single movie by Title
app.get('/movies/:Title', async (req, res) =>{
  await Movies.findOne({Title: req.params.Title})
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
    });

  // #3  Return data about a genre (description) by name 
app.get('/movies/genre/:genreName', async (req, res) => {
  await Movies.findOne({'Genre.Name':req.params.genreName})
    .then((movie) => {
      res.status(200).json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
        
  // #4 Return data about a director (bio, birth year, death year) by name 
  app.get('movies/director/:directorName', async (req, res) => {
    await Movies.findOne({'Director.Name':req.params.directorName})
      .then((movie) => {
        res.status(200).json(movie.Director);
      })
      .catch((err)=> {
        console.error(err);
        res.status(500).send('Errors: ' + err);
      });
    });

   // #5 Allow new users to register 
  app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
     .then((user) => {
        if (user) {
          return  res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
              .then((user) =>{res.status(201).json(user) })
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


    });

     // #6 Allows users to update their user info (username, password, email, date of birth)
     app.put('/users/:Username', async (req, res) => {
        await Users.findOneAndUpdate({Username: req.params.Username }, { $sets:
          {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          }
     },
{ new: true }) // Line confirms that the updated document is returned
   .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  // #7 Allow users to add a movie to their list of favorites
  app.post('/users/:Username/movies/:MovieID', (req, res) => {
      Users.findOneAndUpdate(

        { Username: req.params.Username },
        { $push: { favoriteMovies: req.params.MovieID} },
        { new: true }
      )
        .then(updatedUser => {
           res.json(updatedUser);
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Error: ' +err);
        });
      });
   
  // #8 Allow users to remove a movie from their list of favorites
  app.delete('users/:Username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { new: true }  
    )
      .then(updateUser => {
          console.error(err);
          res.status.apply(500).send('Error: ' + err);
      });
  });

  // #9 Allow existing users to deregister (Delete a user by name)
  app.delete('/users/:Username', (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username})
     .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + 'was not found');
      } else {

          res.status(200).send(req.params.Username + ' was deleted.');
      }
     })
     .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
       });
      });

      // Create error-handling 
      app.use((err, req, res, next) => {
              console.error(err.stack);
              res.status(500).send('something is not working!');
      });

      //listen for requests
      app.listen(8080, () => {
          console.log('Your app is listening on port 8080');
      
      })