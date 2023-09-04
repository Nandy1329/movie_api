const express = require("express");
    morgan = require("morgan");
    fs = require("fs");
    path = require("path");
    const app = express();

let topMovies = [
    {
        title: "Inglorious Basterds",
        director: "Quentin Tarantino",
        year: "2009"
    },
    {
        title: "The Dark Knight",
        director: "Christopher Nolan",
        year: "2008"
    },
    {
        title: "The Lord of the Rings: The Return of the King",
        director: "Peter Jackson",
        year: "2003"
    },
    {
        title: "The Silence of the Lambs",
        director: "Jonathan Demme",
        year: "1991"
    },
    {
        title: "Halloween",
        director: "John Carpenter",
        year: "1978"
    },
    {
        title: "Star Wars: Episode VVI - Return of the Jedi",
        director: "Richard Marquand",
        year: "1983"
    },
    { 
        title: "Jurassic Park",
        director: "Steven Spielberg",
        year: "1993"
    },
    {
        title: "Guardians of the Galaxy",
        director: "James Gunn",
        year: "2014"
    },
    {
        title: "Saving Private Ryan",
        director: "Steven Spielberg",
        year: "1998"
    },
    {
        title: "No Country for Old Men",
        director: "Ethan Coen, Joel Coen",
        year: "2007"
    },
];

// setup logging
const accessLogStream = fs.createWriteStream( // creates a write stream (a path to a file) and passes it to morgan
    path.join(__dirname, "log.txt"), { flags: "a" }, // creates  a "log.txt" file in the root directory
    { flags: "a" } // a path.join appends it to the "log.txt" file
);
app.use(morgan("combined", { stream: accessLogStream })); // morgan middleware function


app.use(
    express.static("public")); // serves static files from the "public" folder

// GET requests
app.get("/", (req, res) => {
    res.send("Welcome to myFlix!");
});

app.get("/documentation", (req, res) => {
    res.sendFile("public/documentation.html", { root: __dirname });
});

app.get("/movies", (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!'); // 500 is the HTTP status code for "Internal server error"
  });

// listen for requests
app.listen(8080, () => {
    console.log("Your app is listening on port 8080.");
});