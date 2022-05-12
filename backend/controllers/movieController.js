const Movie = require('../models/movie');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');
const swearjar = require('swearjar');
const { query } = require('express');

// Create new Movies and TV SHOW => /api/v1/movies/new
exports.newMovie = catchAsyncErrors(async (req,res,next) => {


    console.log(req.body);
    console.log(req.body.actors);

    const { title, classification, genre, plot, gross, producers, actors, runtime} = req.body

    let images = []

    if(typeof req.body.images ==='string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }
    let imageLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder : 'posters'
        })

        imageLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.posters = imageLinks
    console.log(imageLinks);
    const posters = imageLinks

    const movies = await Movie.create({
        title,
        classification,
        genre,
        plot,
        gross,
        producers,
        runtime,
        posters,
        actors:[{name:actors}]

    });

    console.log(movies);
    res.status(200).json({
        success:true,
        movies
    })
})





// Get all moovies => /api/v1/movies?date_released
exports.getMovies = catchAsyncErrors(async (req,res,next) => {
    
    const resPerPage = 20; 
    const moviesCount = await Movie.countDocuments();
    
    const apiFeatures = new APIFeatures(Movie.find(), req.query).search().filter()

    let movies = await apiFeatures.query;
    let filteredMoviesCount = movies.length;

    apiFeatures.pagination(resPerPage);
    movies = await apiFeatures.query;

    res.status(200).json({
        success:true,
        moviesCount,
        resPerPage,
        filteredMoviesCount,
        movies
    })
})


exports.getAllMovies = catchAsyncErrors(async (req,res,next) => {
    const resPerPage = 12;
    const moviesCount = await Movie.countDocuments();

    const apiFeatures = new APIFeatures(Movie.find(), req.query).search().filter()

    let movies = await apiFeatures.query;
    let filteredMoviesCount = movies.length;

    // apiFeatures.pagination(resPerPage);
    movies = await apiFeatures.query;

    res.status(200).json({
        success:true,
        moviesCount,
        // resPerPage,
        filteredMoviesCount,
        movies
    })
})

/*
 * Get specific movie information = > /api/v1/movies/:id
 */
exports.getMovie = catchAsyncErrors(async (req,res,next) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie) return next(new ErrorHandler('Movies not found', 404));
    
    res.status(200).json({
        success:true,
        movie
    })
})

// Update a specifc movie => /api/v1/movies/:id
exports.updateMovie = catchAsyncErrors(async (req,res,next) => {
    let movie = await Movie.findById(req.params.id);

    if(!movie) return next(new ErrorHandler('Movies not found', 404));

    let images = []
    typeof req.body.posters === 'string' ?
    images.push(req.body.posters) :
    images = req.body.posters

    if(images !== undefined) {
        // Delete the images of this movie
        for (let i = 0; i < movie.posters.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(movie.posters[i].public_id)
        }

        // New images/poster of this movie
        let imageLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i],{
                folder : 'posters'
            });

            imageLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }

        // Don't be confused images are just temp array inside this function
        // posters is the body name/ key that will be used
        req.body.posters = imageLinks
    }

    // Update now based on id and the data is the body {} passed on request
    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true,
        movie
    })
})

// Delete movie => /api/v1/movies/:id
exports.deleteMovie = catchAsyncErrors(async (req,res,next) => {
    const movie = await Movie.findById(req.params.id);

    if(!movie) return next(new ErrorHandler('Movie not found',404));

    // Delete images on cloudinary
    for(let i = 0; i < movie.posters.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(movie.posters[i].public_id);
    }

    await movie.remove();

    res.status(200).json({
        success: true,
        message: 'Movie successfully removed.'
    })
})

// Create a new review for users => /api/v1/review
exports.createMovieReview = catchAsyncErrors(async (req,res,next) => {
    const { rating, comment, movieId, user } = req.body;
    
    const review = {
        user : user._id,
        name: user.name,
        rating: Number(rating),
        comment: swearjar.censor(comment)
    }

    const movie = await Movie.findById(movieId);
    console.log(movie);
    // Find will look through the array and check if user id exist
    const isReviewed = movie.reviews.find(
        r => r.user.toString() === user._id.toString()
    )

    if(isReviewed){
        movie.reviews.forEach(review => {
            if(review.user.toString() === user._id.toString()) {
                review.comment = swearjar.censor(comment);
                review.rating = rating;
            }
        })
    } else {
        movie.reviews.push(review);
        movie.numOfReviews = movie.reviews.length
    }

    // get average for ratings of movies
    movie.ratings = movie.reviews.reduce((acc,item) => item.rating + acc, 0) / movie.reviews.length

    await movie.save({validateBeforeSave : false});

    res.status(200).json({
        success:true,
        reviews: movie.reviews,
        message:'On movie review succeeded.'
    })
})

// Get reviews of movies 
exports.getMovieReviews = catchAsyncErrors(async (req,res,next) => {
    const movie = await Movie.findById(req.query.id);
    
    res.status(200).json({
        success: true,
        reviews: movie.reviews
    })
})

// Delete review a movie 
exports.deleteMovieReview = catchAsyncErrors(async (req,res,next) => {
    const movie = await Movie.findById(req.query.movieId);
    // New reviews array filtered without the selected id that you want to delete
    const reviews = movie.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    console.log(reviews);
    // Calculate new movie ratings
    const ratings = movie.reviews.reduce((acc,item) => item.rating + acc, 0) / movie.reviews.length

    await Movie.findByIdAndUpdate(req.query.movieId, {
        reviews,
        ratings
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message:'Review deleted.'
    })
})

//get all the movie title for search 
exports.getMovieTitles = catchAsyncErrors(async (req,res,next) => {
    const titles = await Movie.distinct('title');


    res.status(200).json({
        success:true,
        message:'Review Data.',
        titles
    })
})

