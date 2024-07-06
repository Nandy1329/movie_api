const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Defining the Schemas
const genreSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true }
});

const directorSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Bio: { type: String, required: true },
  Birth: { type: String, required: true },
  Year: { type: String, required: true }
});

const movieSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre', required: true },
  Director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director', required: true },
  Featured: { type: Boolean, required: true },
  Year: { type: Number, required: true },
  ImagePath: { type: String, required: true }
}, { collection: 'movies' });

const userSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birth_Date: Date,
  Favorite_Movies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }]
});

// Hash & Validate user passwords
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// The Creation of the Models
const Genre = mongoose.model('Genre', genreSchema);
const Director = mongoose.model('Director', directorSchema);
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

// Exporting the Models
module.exports = { Genre, Director, Movie, User };
