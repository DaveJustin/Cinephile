const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
    production_name : {
        type: String,
        required: [true, 'Name cannot be empty.']
    },
    production_role : {
        type: String,
        required: [true, 'Please select role for this staff'],
        enum: {
            values: [
                'Actor',
                'Actress',
                'Director',
                'Producer',
            ],
            message: 'Please select correct role for this staff'
        }
    },
    production_bio : {
        type: String,
        default: 'No bio yet.'
    },
    production_avatar : [
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
    production_ratings: {
        type: Number,
        default: 0
    },
    production_reviews : [
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

module.exports = mongoose.model('production', productionSchema);