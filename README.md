# Movie API

This is a RESTful API built with Node.js and Express, which provides information about movies, genres, and directors.

## Link to project 
  Website: https://myflixdb1329-efa9ef3dfc08.herokuapp.com/
  GitHub: https://github.com/Nandy1329/movie_api

## Features

- Get all movies
- Get a single movie by title
- Get a genre by name
- Get all directors
- Get a director by name

## Installation

1. Clone this repository: `git clone https://github.com/yourusername/movie-api.git`
2. Navigate into the project directory: `cd movie-api`
3. Install dependencies: `npm install`
4. Start the server: `npm start`

## Dependencies

This project uses the following dependencies:

- bcrypt: ^5.1.1
- body-parser: ^1.20.2
- cors: ^2.8.5
- dotenv: ^16.3.1
- express: ^4.18.2
- express-jwt: ^8.4.1
- express-validator: ^7.0.1
- jsonwebtoken: ^9.0.2
- mongodb: ^6.3.0
- mongoose: ^7.6.4
- morgan: ^1.10.0
- passport: ^0.6.0
- passport-jwt: ^4.0.1
- passport-local: ^1.0.0
- save: ^2.9.0
- uuid: ^9.0.0

## API Endpoints

- `GET /movies`: Returns all movies
- `GET /movies/:Title`: Returns a single movie by title
- `GET /movies/genre/:genreName`: Returns a genre by name
- `GET /directors`: Returns all directors
- `GET /directors/:Name`: Returns a director by name

## Authentication

This API uses JWT for authentication. All endpoints require a valid JWT token in the `Authorization` header.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
