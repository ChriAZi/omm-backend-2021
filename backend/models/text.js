const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/** Regex matching Hex Color formats in both upper & lowercase **/
const colorValidator = (color) => (/^#([0-9a-f]{3}){1,2}$/i).test(color)

/**
 * Mongoose Text for saving Templates.
 */
const TextSchema = Schema({
    isTopCaption: {
        type: Boolean,
        validator: [() => {
            return !this.bottomCaption;
        }, 'Text is already marked as Bottom Caption.']
    },
    isBottomCaption: {
        type: Boolean,
        validator: [() => {
            return !this.topCaption;
        }, 'Text is already marked as Top Caption.']
    },
    content: {
        type: String,
        required: true
    },
    color: {
        type: String,
        validator: [colorValidator, 'Color is not valid.'],
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    rotation: {
        type: Number,
        required: true
    },
    bold: Boolean,
    italic: Boolean,
    xCoord: {
        type: Number
    },
    yCoord: {
        type: Number
    }
});

const Text = module.exports = mongoose.model('Text', TextSchema);