const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose Model for saving Votes.
 */
const VoteSchema = Schema({
    upVote: {
        type: Boolean,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

const Vote = module.exports = mongoose.model('Vote', VoteSchema);
