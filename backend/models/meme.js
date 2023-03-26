const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TextSchema = require('./text').schema;
const CommentSchema = require('./comment').schema;
const VoteSchema = require('./vote').schema;
const DraftSchema = require('./draft').schema;

/**
 * Mongoose Model for saving Memes.
 * References Users through their id.
 * References Templates through their id.
 * Nested Texts, Comments, Votes and Drafts.
 */
const MemeSchema = Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    templates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    }],
    texts: [TextSchema],
    comments: [CommentSchema],
    votes: [VoteSchema],
    views: {
        type: Number,
        required: true
    },
    listingStatus: {
        type: String,
        enum: ['PRIVATE', 'UNLISTED', 'PUBLIC'],
        default: 'PUBLIC'
    },
    draft: DraftSchema
}, {timestamps: true});

const Meme = module.exports = mongoose.model('Meme', MemeSchema);
