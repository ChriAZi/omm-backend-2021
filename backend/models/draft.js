const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose Model for saving Drafts.
 */
const DraftSchema = Schema({
    isDraft: {
        type: Boolean,
        required: true
    },
    content: {
        type: String
    }
}, {timestamps: true});

const Draft = module.exports = mongoose.model('Draft', DraftSchema);
