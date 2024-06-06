const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the schema for movies
const movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: [{
    Name: String,
    Bio: String,
  }],
  ImagePath: String,
  Featured: Boolean,
  Year: Number
});

// Define the schema for users
const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

// Define static methods for the user schema
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Define instance methods for the user schema
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

// Define the schema for genres
const genreSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: String
});

// Define models for movies, users, and genres
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);
const Genre = mongoose.model('Genre', genreSchema);

// Export the models
module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Genre = Genre;
