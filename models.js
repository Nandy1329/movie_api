const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let genreSchema = mongoose.Schema({
    Name: { type: String, required: true },
    Description: { type: String, required: true },
});

let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre' },
    Director: { type: mongoose.Schema.Types.ObjectId, ref: 'Director' },
    Featured: Boolean,
    ImagePath: String,
    Year: String
});


let userSchema = mongoose.Schema({
    Username: { type: String, required: true, lowercase: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

userSchema.statics.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.Password);
};

let directorSchema = mongoose.Schema({
    Name: { type: String, required: true },
    Bio: { type: String, required: true },
    Birth: { type: Date,},
    Death: { type: Date, required: false },
});


let Genre = mongoose.model('Genre', genreSchema);
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Director = mongoose.model('Director', directorSchema);

module.exports = { Genre, Movie, Director, User };