/**
 * Multer
 * @source https://www.npmjs.com/package/multer
 * @license MIT License
 * @description Library for uploading images using multipart/formdata
 */
const multer = require('multer');

/**
 * Setups a multer fileStorage
 * @param name - the name to be given to uploaded files
 * @returns {*|DiskStorage}
 */
let fileStorage = (name) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/uploads/' + name);
        },
        filename: (req, file, cb) => {
            cb(null, name + '-' + Date.now() + '.png')
        }
    });
}

/**
 * Sets up a multer fileFilter
 * @param req - the incoming request object
 * @param file - the file to be uploaded
 * @param cb - the callback function to be invoked after handling the file
 */
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb('File must be an image.', false);
    }
};

/**
 * Setups a new multer instance
 * @param name - the name to be given to uploaded files
 * @returns {Multer|*}
 */
module.exports = (name) => {
    return multer({
        storage: fileStorage(name),
        limits: {fieldSize: 25 * 1024 * 1024},
        fileFilter: fileFilter
    });
}