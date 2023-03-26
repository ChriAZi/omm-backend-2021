const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose Model for saving Templates.
 */
const TemplateSchema = Schema({
    title: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
});

const Template = module.exports = mongoose.model('Template', TemplateSchema);