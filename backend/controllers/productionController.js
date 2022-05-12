const Production = require('../models/production');
const Movie = require('../models/movie');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');
const swearjar = require('swearjar');

exports.newProduction = catchAsyncErrors(async (req,res,next) => {
    let images = []

    typeof req.body.images === 'string' ? 
    images.push(req.body.images) : 
    images = req.body.images

    let imageLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder : 'avatar'
        })

        imageLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.production_avatar = imageLinks

    const production = await Production.create({
        production_name: req.body.production_name,
        production_role: req.body.production_role,
        production_bio: req.body.production_bio,
        production_avatar: req.body.production_avatar
    })

    res.status(201).json({
        production,
        success:true,
        message:`${production.production_role} has been created`  
    })
})

// Get production details => /api/v1/production/:id
exports.getProductionDetail = catchAsyncErrors(async (req,res,next) => {
    const user = await Production.findById(req.params.id);
    
    const movie = await Movie.find();
    const moviesprod = [];

    movie.map(movies => {
        if (movies.producers === user.production_name){
          
            moviesprod.push(movies.title);
            console.log(movies.title);
        }
    })
    
    
    console.log(user);
    console.log(user.production_reviews);
    console.log(user.production_avatar);


    if(!user) return next(new ErrorHandler(`${req.query.production_role} not found`, 404));

    res.status(200).json({
        success:true,
        production_name:user.production_name,
        production_bio:user.production_bio,
        production_ratings:user.production_ratings,
        production_role:user.production_role,
        production_avatar:user.production_avatar,
        production_reviews:user.production_reviews,
        id:user._id,
        moviesprod:moviesprod
    })
})

// Get all production via role => /api/v1/production?role=<role>
exports.getProductionByRole = catchAsyncErrors(async (req,res,next) => {
    const resPerPage = 4;
    
    const apiFeatures = new APIFeatures(Production.find(), req.query)
        .search()
        .filter()
    
    let productions = await apiFeatures.query;
    let productionsCount = productions.length;
    // apiFeatures.pagination(resPerPage);
    productions = await apiFeatures.query;

    res.status(200).json({
        sucess:true,
        productionsCount,
        // resPerPage,
        productions
    })
})

// Update production profile such as for actors, producers  => /api/v1/productions/:id
exports.updateProduction = catchAsyncErrors(async (req,res,next) => {
    let production = await Production.findById(req.params.id);

    if(!production) return next(new ErrorHandler('Not found', 404));

    let images = []
    typeof req.body.production_avatar === 'string' ?
    images.push(req.body.production_avatar) :
    images = req.body.production_avatar
   
    if(images !== undefined) {
        // Delete the images of this production
        for (let i = 0; i < production.production_avatar.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(production.production_avatar[i].public_id)
        }

        // New images/poster of this production
        let imageLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i],{
                folder : 'avatars'
            });

            imageLinks.push({
                public_id: result.public_id,
                url: result.secure_url
            })
        }

        console.log(imageLinks)
        req.body.production_avatar = imageLinks
    }

    // Update now based on id and the data is the body {} passed on request
    production = await Production.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true,
        production
    })
})

// Delete person 
exports.deleteProduction = catchAsyncErrors(async (req,res,next) => {
    var production = await Production.findById(req.params.id);

    if(!production) return next(new ErrorHandler('Not found', 404));

    // Delete images 
    for(let i = 0; i < production.production_avatar.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(production.production_avatar[i].public_id)
    }

    await production.remove();

    production = await Production.find();

    res.status(200).json({
        success:true,
        production,
        message: 'Deleted successfully.'
        
    })
})

// Create a new review  for producers, actors
exports.createProductionReview = catchAsyncErrors(async (req,res,next) => {
    const { rating, comment,  productionId, user } = req.body;
    
    const review = {
        user : user._id,
        name: user.name,
        rating: Number(rating),
        comment: swearjar.censor(comment)
    }

    const production = await Production.findById(productionId);
    console.log(production);
    // Find will look through the array and check if user id exist
    const isReviewed = production.production_reviews.find(
        r => r.user.toString() === user._id.toString()
    )

    if(isReviewed){
        production.production_reviews.forEach(review => {
            if(review.user.toString() === user._id.toString()) {
                review.comment = swearjar.censor(comment);
                review.rating = rating;
            }
        })
    } else {
        production.production_reviews.push(review);
        production.numOfReviews = production.production_reviews.length
    }

    // get average for actor, producer ratings
    production.production_ratings = production.production_reviews.reduce((acc,item) => item.rating + acc, 0) / production.production_reviews.length

    await production.save({validateBeforeSave : false});

    res.status(200).json({
        success:true,
        production_reviews:production.production_reviews,
        id:production._id,
        message:'Action Succeeded.'
    })
})

// Get production reviews 
exports.getProductionReviews = catchAsyncErrors(async (req,res,next) => {
    const production = await Production.findById(req.query.id);
    
    res.status(200).json({
        success: true,
        production_reviews: production.production_reviews
    })
})

// Delete production 
exports.deleteProductionReview = catchAsyncErrors(async (req,res,next) => {
    const production = await Production.findById(req.query.productionId);
    // New reviews array filtered without the selected id that you want to delete
    const production_reviews = production.production_reviews.filter(production_review => production_review._id.toString() !== req.query.id.toString());
    console.log(production_reviews);
    // Calculate new person ratings
    const ratings = production.production_reviews.reduce((acc,item) => item.rating + acc, 0) / production.production_reviews.length

    await Production.findByIdAndUpdate(req.query.productionId, {
        production_reviews,
        ratings
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message:'Successfully deleted.'
    })
})

//get all production for search function
exports.getAllProductionNames = catchAsyncErrors(async (req,res,next) => {
    // const names = await Member.distinct('name');
    const names = await Production.find().where('production_role', req.query.production_role).distinct('production_name')


    res.status(200).json({
        success:true,
        message:'All members in the Data.',
        names

    })
})

exports.getAdminProduction = catchAsyncErrors(async (req, res, next) => {

    const production = await Production.find();

    res.status(200).json({
        success: true,
        production
    })

})