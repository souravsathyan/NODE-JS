const express = require('express')
const router = express.Router()
const moviesController = require('./../controllers/movies.Controllers.js')



router.route('/highest-rated').get(moviesController.getHighestRated,moviesController.getAllMovies)
router.route('/movie-stats').get(moviesController.getMovieStats)
router.route('/movie-by-genre/:genre').get(moviesController.getMovieByGenre)

router.route('/:id')
    .get(moviesController.getMovie)
    .patch(moviesController.updateMovie)
    .delete(moviesController.deleteMovie)

router.route('')
    .post(moviesController.addMovie)
    .get(moviesController.getAllMovies)
    
    module.exports = router