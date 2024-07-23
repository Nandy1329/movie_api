const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const genreSchema = new Schema({
  Name: { type: String, required: true },
  Description: { type: String }
});

const directorSchema = new Schema({
  Name: { type: String, required: true },
  Bio: { type: String },
  Birth: { type: Date },
  Death: { type: Date }
});

const movieSchema = new Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
  Director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director' },
  Featured: Boolean,
  Year: Number,
  ImagePath: String
});

const Genre = mongoose.model('Genre', genreSchema);
const Director = mongoose.model('Director', directorSchema);
const Movie = mongoose.model('Movie', movieSchema);

module.exports = { Genre, Director, Movie };
