const express = require('express');
const morgan = require('morgan');
bodyParser = require('body-parser'),
    uuid = require('uuid');
morgan = require('morgan')
const app = express();


// setup logging
// creates a write stream (a path to a file) and passes it to morgan
const accessLogStream = fs.createWriteStream(
  path.join('log.txt'),
  {flags: 'a'},
 // creates  a 'log.txt' file in the root directory

app.use(express.static('public', // serves static files from 'public' folder

app.use(morgan('common',// morgan middleware function

let 
,users = [
    {
        id: 1,
        username: 'nicholas',
        favoriteMovies : []
    },
    {
        id: 2,
        name: 'Heather',
        favoriteMovies : ['Jurassic Park']
    },

let movies = [
    {
        'Title': 'Inglourious Basterds',
        'Description': 'In Nazi-occupied France during World War II, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner's vengeful plans for the same
        'Genre': {
            'Name': 'Action',
            'Description': 'Action film is a film genre in which the protagonist or protagonists are thrust into a series of events that typically include violence, extended fighting, physical feats, rescues and frantic chases.'
        },
        'Director': {
            'Name': 'Quentin Tarantino',
            'Bio': 'Quentin Jerome Tarantino (born March 27, 1963) is an American film director, screenwriter, producer, and actor. His films are characterized by nonlinear storylines, dark humor, aestheticization of violence, extended scenes of dialogue, ensemble casts, references to popular culture and a wide variety of other films, eclectic soundtracks primarily containing songs and score pieces from the 1960s to the 1980s, alternate history, and features of neo-noir film.',
            'Birth': '03-27-1963',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/c/c3/Inglourious_Basterds_poster.jpg',
        'Featured': true
    },
    {
        'Title': "The Dark Knight",
        'Description': 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        'Genre': {
            'Name': 'Action',
            'Description': 'Action film is a film genre in which the protagonist or protagonists are thrust into a series of events that typically include violence, extended fighting, physical feats, rescues and frantic chases.'
        },
        'Director': {
            'Name': 'Christopher Nolan',
            'Bio': 'Christopher Edward Nolan CBE (/ˈnoʊlən/; born 30 July 1970) is a British-American film director, producer, and screenwriter. His directorial efforts have grossed more than US$5 billion worldwide, garnered 36 Oscar nominations and ten wins. Born and raised in London, Nolan developed an interest in filmmaking from a young age. After studying English literature at University College London, he made his feature debut with Following (1998).',
            'Birth': '07-30-1970', 
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/8/8a/Dark_Knight.jpg',
        'Featured': true
    },
    {
        'Title': 'The Lord of the Rings: Return of the King',
        'Description': 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.',
        'Genre': {
            'Name': 'Fantasy',
            'Description': 'Fantasy is a genre of speculative fiction set in a fictional universe, often inspired by real world myth and folklore. Its roots are in oral traditions, which then became fantasy literature and drama. From the twentieth century it has expanded further into various media, including film, television, graphic novels, manga, animated movies and video games.'
        },
        'Director': {
            'Name': 'Peter Jackson',
            'Bio': 'Sir Peter Robert Jackson ONZ KNZM (born 31 October 1961) is a New Zealand film director, screenwriter, and film producer. He is best known as the director, writer, and producer of the Lord of the Rings trilogy (2001–03) and the Hobbit trilogy (2012–14), both of which are adapted from the novels of the same name by J. R. R. Tolkien. He is the third-highest-grossing film director of all time, his films having made over $6.5 billion worldwide.',
            'Birth': '10-31-1961',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/9/9d/Lord_of_the_Rings_-_The_Return_of_the_King.jpg',
        'Featured': true
    },
    {
        'Title': 'The Silence of the Lambs',
        'Description': 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.',
        'Genre': {
            'Name': 'Thriller',
            'Description': 'Thriller film, also known as suspense film or suspense thriller, is a broad film genre that evokes excitement and suspense in the audience. The suspense element found in most films\' plots is particularly exploited by the filmmaker in this genre. Tension is created by delaying what the audience sees as inevitable, and is built through situations that are menacing or where escape seems impossible.'
        },
        'Director': {
            'Name': 'Jonathan Demme',
            'Bio': 'Robert Jonathan Demme (/ˈdɛmi/ DEM-ee; February 22, 1944 – April 26, 2017) was an American director, producer, and screenwriter. He is best known for directing the psychological horror The Silence of the Lambs (1991), for which he won the Academy Award for Best Director. He also directed Melvin and Howard (1980), Swing Shift (1984), Something Wild (1986), Married to the Mob (1988), Philadelphia (1993), Beloved (1998), The Truth About Charlie (2002), The Manchurian Candidate (2004), and Rachel Getting Married (2008).',
            'Birth': '02-22-1944',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/8/86/The_Silence_of_the_Lambs_poster.jpg',
        'Featured': true
    },
    {
        'Title': 'Halloween',
        'Director': 'John Carpenter',
        'Description': 'Fifteen years after murdering his sister on Halloween night 1963, Michael Myers escapes from a mental hospital and returns to the small town of Haddonfield, Illinois to kill again.',
        'Genre': {
            'Name': 'Horror',
            'Description': 'Horror is a genre of speculative fiction which is intended to frighten, scare, or disgust. Literary historian J. A. Cuddon defined the horror story as "a piece of fiction in prose of variable length... which shocks, or even frightens the reader, or perhaps induces a feeling of repulsion or loathing". It creates an eerie and frightening atmosphere. Horror is frequently supernatural, though it can be non-supernatural. Often the central menace of a work of horror fiction can be interpreted as a metaphor for the larger fears of a society.'
        },
        'Director': {
            'Name': 'John Carpenter',
            'Bio': 'John Howard Carpenter (born January 16, 1948) is an American filmmaker, screenwriter, and composer. Although Carpenter has worked with various film genres, he is associated most commonly with horror, action, and science fiction films of the 1970s and 1980s.',
            'Birth': '01-16-1948',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/8/8b/Halloween_%281978%29_theatrical_poster.jpg',
        'Featured': true
    },
    {
        'Title': 'No Country for Old Men',
        'Description': 'Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and more than two million dollars in cash near the Rio Grande.',
        'Genre': {
            'Name': 'Thriller',
            'Description': 'Thriller film, also known as suspense film or suspense thriller, is a broad film genre that evokes excitement and suspense in the audience. The suspense element found in most films\' plots is particularly exploited by the filmmaker in this genre. Tension is created by delaying what the audience sees as inevitable, and is built through situations that are menacing or where escape seems impossible.'
        },
        'Director': {
            'Name': 'Ethan Coen',
            'Bio':  'The younger brother of Joel, Ethan Coen is an Academy Award and Golden Globe winning writer, producer and director coming from small independent films to big profile Hollywood films'
            'Birth': '09-21-1957',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/8/8b/Halloween_%281978%29_theatrical_poster.jpg',
        'Featured': true
    },
    {
        'Title': 'Start Wars: Episode VVI - Return of the Jedi',
        'Description': 'After a daring mission to rescue Han Solo from Jabba the Hutt, the Rebels dispatch to Endor to destroy the second Death Star. Meanwhile, Luke struggles to help Darth Vader back from the dark side without falling into the Emperor\'s trap.',
        'Genre': {
            'Name': 'Science Fiction',
            'Description': 'Science fiction (sometimes called sci-fi or simply SF) is a genre of speculative fiction that typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life.'
        },
        'Director': {
            'Name': 'Richard Marquand',
            'Bio': 'Richard Marquand (22 September 1937 – 4 September 1987) was a Welsh film director, best known for directing the 1983 film Star Wars: Episode VI – Return of the Jedi.',
            'Birth': '09-22-1937',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/b/b2/ReturnOfTheJediPoster1983.jpg',
        'Featured': true
    },
    {

        'Title': 'Jurassic Park',
        'Description': 'A theme park showcasing genetically-engineered dinosaurs turns into a nightmare for its tourists when one of the dinosaurs escapes its enclosure.',
        'Genre': {
            'Name': 'Science Fiction',
            'Description': 'Science fiction (sometimes called sci-fi or simply SF) is a genre of speculative fiction that typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life.'
        },
        'Director': {
            'Name': 'Steven Spielberg',
            'Bio': 'Steven Allan Spielberg (born December 18, 1946) is an American film director, producer, and screenwriter. He began his career in the New Hollywood era, and is one of the most commercially successful directors in history. Spielberg is the recipient of various accolades, including two Academy Awards for Best Director, a Kennedy Center honor, and a Cecil B. DeMille Award.',
            'Birth': '12-18-1946',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/e/e7/Jurassic_Park_poster.jpg',
        'Featured': true
    },
    {
        'Title': 'Guardians of the Galaxy',
        'Description': 'A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.',
        'Genre': {
            'Name': 'Science Fiction',
            'Description': 'Science fiction (sometimes called sci-fi or simply SF) is a genre of speculative fiction that typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life.'
        },
        'Director': {
            'Name': 'James Gunn',
            'Bio': 'James Gunn was born and raised in St. Louis, Missouri, to Leota and James Francis Gunn. He is from a large Catholic family, with Irish and Czech ancestry. His father and his uncles were all lawyers. He has been writing and performing as long as he can remember. He began making 8mm films at the age of twelve. Many of these were comedic splatter films featuring his brothers being disemboweled by zombies'
            'Birth': '08-05-1970',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/8/8f/GOTG-poster.jpg',
        'Featured': true
    },
    {
        'Title': 'Saving Private Ryan',
        'Description': 'Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
        'Genre': {
            'Name': 'Action',
            'Description': 'Action film is a film genre in which the protagonist or protagonists are thrust into a series of events that typically include violence, extended fighting, physical feats, rescues and frantic chases.'
        },
        'Director': {
            'Name': 'Steven Spielberg',
            'Bio': 'Steven Allan Spielberg (born December 18, 1946) is an American film director, producer, and screenwriter. He began his career in the New Hollywood era, and is one of the most commercially successful directors in history. Spielberg is the recipient of various accolades, including two Academy Awards for Best Director, a Kennedy Center honor, and a Cecil B. DeMille Award.',
            'Birth': '12-18-1946',
        },
        'ImageURL': 'https://upload.wikimedia.org/wikipedia/en/a/ac/Saving_Private_Ryan_poster.jpg',
        'Featured': true
    },



// CREATE- add a user account
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).json(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('Error: Name is required.')
    }
});

// UPDATE- Allows users to update their personal info
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = user.find( user => user.id == id);

    if (user) {
        user.name = updated.user.name;
        res.status(200).json(user);
    } else {
        rest.status(400).send(`Error: User ID ${id} not found.`)
    }
})


// READ- return a list of all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
})

// READ- return data about a single movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find(m => m.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send(`Error: Movie title ${title} not found.`)
}


})

//CREATE- add a movie to a user's list of favorites
app.post('users/:id/movieTitle', (req, res) => {
    const { id, moveTitle } = req.params;

    let user = users.find(user => users.id == id);
}
    if(user) {
        user.favoriteMovies.push(movieTitle);
      res.status(200).send('${movieTitle} has been added to ${id}s array');;
    } else {
       res.status(400).send(`Error: no such user.`)
    }
})

// DELETE- remove a movie from a user's list of favorites
app.delete('users/:id/movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

let users = users.find(user => users.id ==id);

if(user) {
    users.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send('${movieTitle} has been removed from ${id}s array');:
} else {

})

// DELETE- remove a user by ID
app.delete('/users/id', (req, res) => {
    const { id } = req.params;

     let user = users.find(user => users.id ==id);
     
     if (users) {
        users = users.filter(users => users.id !== id);
         rest.status(200).send('${id} has been removed from the list of users.');
     } else {
        res.status(400).send(`Error: User ID ${id} not found.`)
     }
})




// READ- return data about a genre by name/title
app.get('/movies/genres/:genreName', (req, res) => {
    const { genreName } = re.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName);

    if (genre) {
        rest.statues(200).json(genre);
    } else {
        res.status(400).send(`Error: Genre ${genreName} not found.`)
    }
 })

 // READ- return data about a director by name
 app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = re.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;
    if (director) {
        res.status(200).json(director); 
    } else {
        res.status(400).send(`Error: Director ${directorName} not found.`)
    }
    })


// //GET requests
// app.get('/', (req, res) => {
    // res.send('Welcome to myFlix!');
// });

// listen for requests

app.listen(8080 () => {
    console.log('Your app is listening on port 8080.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!'); // 500 is the HTTP status code for 'Internal server error'
  });