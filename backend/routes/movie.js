const express = require('express');
const router = express.Router();

const {
    newMovie,
    getAllMovies,
    getMovie,
    updateMovie,
    deleteMovie,
    createMovieReview,
    getMovieReviews,
    deleteMovieReview,
    getMovieTitles
} = require('../controllers/movieController');

router.route('/movies/new').post(newMovie);
router.route('/movies').get(getAllMovies);
router.route('/movies/:id').get(getMovie);
router.route('/movies/:id').put(updateMovie);
router.route('/movies/:id').delete(deleteMovie);
router.route('/review').put(createMovieReview);
router.route('/reviews').get(getMovieReviews);
router.route('/reviews').delete(deleteMovieReview);


router.route('/movies/all/titles').get(getMovieTitles);
module.exports = router