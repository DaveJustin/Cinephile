const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary');
const sendToken = require('../utils/jwtToken');

// Get all users
exports.getAllUsers = catchAsyncErrors(async (req,res,next) => {
    const user = await User.find();

    res.status(200).json({
        success:true,
        user
    })
})

// Get user information
exports.getUserDetail = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler('User not found', 404));

    res.status(200).json({
        success:true,
        user
    })
})

// Create and Register User 
exports.createUser = catchAsyncErrors(async (req,res,next) => {
    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder:'userAvatars',
        width:150,
        crop:'scale'
    })

    const user = await User.create({
        name : req.body.name,
        email : req.body.email,
        avatar : [{
            public_id : result.public_id,
            url: result.secure_url
        }]
    })

    sendToken(user, 200, res)

    res.status(200).json({
        success:true,
        message: 'Created successfully.'
    })
})

// Login for user
exports.loginUser = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findOne({ email : req.body.email});

    if(!user) return next(new ErrorHandler('Invalid Credentials',401));

    sendToken(user,200,res)
})

// logout for  user
exports.logoutUser = catchAsyncErrors(async (req,res,next) => {
    res.cookie('token', null, {
        expires : new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        sucess:true,
        message: 'Logged out!'
    })
})

// Update for user
exports.updateUser = catchAsyncErrors(async (req,res,next) => {
    let user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler('User not found'))

    if(req.body.avatar !== undefined) {
       // Delete the images of this person
        for (let i = 0; i < user.avatar.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(user.avatar[i].public_id)
        }
        
        
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder:'userAvatars',
            width:150,
            crop:'scale'
        })

        req.body.avatar = [{ 
            public_id: result.public_id,
            url: result.secure_url
        }]
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success:true,
        user
    })
})

// Delete user profile => /api/v1/users/:id
exports.deleteUser = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler('User not found', 404));

    // Remove avatar from cloudinary
    // const image_id = user.avatar.public_id;
    // await cloudinary.v2.uploader.destroy(image_id);

    await user.remove();

    res.cookie('token', null, {
        expires : new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success:true,
        message: 'User has been deleted'
    })
})


// Google register => /api/v1/google/register
exports.googleAuth = catchAsyncErrors(async (req,res,next) => {
    let user = await User.findOne({email: req.body.email});

    if(!user) {

        const result = await cloudinary.v2.uploader.upload(req.body.imageUrl, {
            folder:'userAvatars',
            width:150,
            crop:'scale'
        })
    
        const user = await User.create({
            name : req.body.name,
            email : req.body.email,
            avatar : [{
                public_id : result.public_id,
                url: result.secure_url
            }]
        })
    
        sendToken(user, 200, res)

    } else {
        sendToken(user, 200, res)
    }
})