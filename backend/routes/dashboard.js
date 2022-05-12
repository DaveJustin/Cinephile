const express = require('express');
const router = express.Router();

const {
    getTopRatedMovies,
    getTopRatedTvShow,
    getTopRatedActors,
    getPopularMovies,
    getPopularGenre,
    getTopGrossingFilm,
    getTopGrossingTvShow
} = require('../controllers/dashboardController');


router.route('/top/rated/movies').get(getTopRatedMovies);
router.route('/top/rated/tvshow').get(getTopRatedTvShow);
router.route('/top/rated/actors').get(getTopRatedActors);

router.route('/popular/movies').get(getPopularMovies);
router.route('/popular/genre').get(getPopularGenre);

router.route('/grossing/film').get(getTopGrossingFilm);
router.route('/grossing/tvshow').get(getTopGrossingTvShow);

module.exports = router;
