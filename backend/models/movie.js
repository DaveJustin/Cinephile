const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true, 'Title cannot be empty'],
        trim : true,
        maxlength :[80, 'Title characters exceeds maximum limit of 80']
    },
    classification : {
        type: String,
        required: [true, 'Please select type for this show'],
        enum: {
            values: [
                'Movie',
                'TV Show'
            ],
            message: 'Please select correct type for the show'
        }
    },
    year : {
        type : Number,
        default : new Date().getFullYear()
    },
    date_released : {
        type : Date,
        default : Date.now
    },
    runtime : {
        type : Number,
        require : [true, 'Runtime is required'],
    },
    posters : [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    plot : {
        type : String,
        required : [true, 'Atleast give it a plot']
    },
    actors : [
        {
            name: {
                type:String,
                required : [true,'Stage/character name?']
            }
        }
    ],
    producers :
        {
             type:String
    
        },
    directors : [
        {
            user : {
                type : mongoose.Schema.ObjectId,
                ref : 'Production'
            },
            name : {
                type:String,
                required : [true, 'Director name?']
            }
        }
    ],
    genre : {
        type: String,
        required: [true, 'Please select genre for this movie'],
        enum: {
            values: [
                'Horror',
                'Sci-Fi',
                'Drama',
                'Comedy',
                'War',
                'Sports',
                'Crime',
                'Action',
                'Musicals',
                'Romance',
            ],
            message: 'Please select correct genre for movie'
        }
    },
    ratings: {
        type: Number,
        default: 0
    },
    gross: {
        type: Number,
        default: 0
    },
    reviews : [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    created_at : {
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model('Movie', movieSchema);


