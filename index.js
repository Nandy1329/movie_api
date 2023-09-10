const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
    
const app = express();

app.use(bodyParser.json());

// setup logging
const accessLogStream = fs.createWriteStream( // creates a write stream (a path to a file) and passes it to morgan
    path.join(__dirname, 'log.txt'), { flags: 'a' }, // creates  a 'log.txt' file in the root directory
    { flags: 'a' } // a path.join appends it to the 'log.txt' file
);

app.use(
    express.static('public')); // serves static files from the 'public' folder


app.use(morgan('combined', { stream: accessLogStream })); // morgan middleware function

let users = [
    {
        id: 1,
        username: 'nicholas',
        favoriteMovies : []
    },
    {
        id: 2,
        name: 'Heather',
        favoriteMovies : ["Jurassic Park"]
    }
];
let Movies = [
    {
       "Title": "Jurassic Park',
        "Description": "A theme park showcasing genetically-engineered dinosaurs turns into a nightmare for its tourists when one of the dinosaurs escapes its enclosure.",
        "Genre": {
            "Name": "Science Fiction",
            "Description": "Science fiction (sometimes called sci-fi or simply SF) is a genre of speculative fiction that typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life."
        },
        "Director": {
            "Name": "Steven Spielberg",
            "Bio": "Steven Allan Spielberg (born December 18, 1946) is an American film director, producer, and screenwriter. He began his career in the New Hollywood era, and is one of the most commercially successful directors in history. Spielberg is the recipient of various accolades, including two Academy Awards for Best Director, a Kennedy Center honor, and a Cecil B. DeMille Award.",
            "Birth": "1946-12-18",
        },
        "ImageURL": "https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg",  
        "Featured": true  
    }
];

// CREATE- add a user
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Error: Name is required.');
    }
});

// UPDATE- update a user's info, by ID
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUserInfo = req.body;
    
    let user

    if (user) {
        user.name = updatedUserInfo.name;
        res.status(200).json(user);
    } else {
        rest.status(404).send(`Error: User ID ${id} not found.`);
    }
});

//CREATE- add a movie to a user's list of favorites
app.post('/users/:id/movies/:movieTitle', (req, res) => {
    const { id, moveTitle} = req.params;

    let user = users.find(user => users.id ==id);

    if (users) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).json('${movieTitle) has been added to ${user.name} list of favorite movies.');
    } else {
        res.status(404).send(`Error: User ID ${id} not found.`);


// DELETE- remove a movie from a user's list of favorites
app.delete('/users/:id/movieTitle', (req, res) => {
    const { id, movieTitle} = req.params;

let users = users.find(user => users.id ==id);

if(users) {
    users.favoriteMovies = user.favoriteMovies.filter((title) => title !== movieTitle);
    res.status(200).send('${movieTitle} has been removed from ${user.name} list of favorite movies.');
} else {
    res.status(404).send(`Error: User ID ${id} not found.`);
}
});

// DELETE- remove a user by ID
app.delete('/users/id', (req, res) => {
    const { id } = req.params;

     let user = users.find(user => users.id ==id);
     
     if (users) {
        users = users.filter(users => users.id !== id);
         rest.status(200).send('${user.name} has been removed from the list of users.');
     } else {
        res.status(400).send(`Error: User ID ${id} not found.`)
     }
});

// READ- return a list of all movies
app.get('/movies', (req, res) => {
    res.json(movies);
});

// READ- return data about a single movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movies = movies.find(movie => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send(`Error: Movie title ${title} not found.`);
    }
});

// READ- return data about a genre by name/title
app.get('/movies/genres/:name', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        rest.statues(200).json(genre);
    } else {
        res.status(404).send(`Error: Genre ${genreName} not found.`)
    }
 });

 // READ- return data about a director by name
 app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;

    if (director) {
        res.status(200).json(director); 
    } else {
        res.status(404).send(`Error: Director ${directorName} not found.`)
    }
    });


// //GET requests
// app.get('/', (req, res) => {
    // res.send('Welcome to myFlix!');
// });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!'); // 500 is the HTTP status code for 'Internal server error'
  });

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});