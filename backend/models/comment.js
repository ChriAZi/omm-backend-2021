/**
 * Mongoose
 * @source https://www.npmjs.com/package/mongoose
 * @license MIT License
 * @description ORM Library for MongoDB
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose Model for saving Comments.
 * References Users through their id.
 */
const CommentSchema = Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

const Comment = module.exports = mongoose.model('Comment', CommentSchema);
