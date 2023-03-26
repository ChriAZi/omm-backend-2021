const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mongoose Model for saving Users.
 */
const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = module.exports = mongoose.model('User', UserSchema);
