const stackTrace = require('stack-trace');
const path = require('path');
const fs = require('fs');

const {ZipGenerator} = require('../generators/zipGenerator');
const {MemeService} = require('../services/memeService');
const {UserService} = require('../services/userService');
const {MemeGenerator} = require('../generators/memeGenerator');

class UserController {

    /**
     * Returns a user identified by its id
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the user identified by its id if found
     */
    static getUser = async (req, res) => {
        try {
            let name = await UserService.getUser(req.params.id);
            return res.status(200).json({name: name});
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
    };

    /**
     * Returns a list of memes identified the id of their owning user
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the list of memes
     */
    static getMemes = async (req, res) => {
        try {
            let memes = await MemeService.getMemesForUser(req.params.id, req.query);
            return res.status(200).send(memes);
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
    }

    /**
     * Creates a new meme in the database and stores the provided image on the server
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the created Meme Object
     */
    static postMeme = async (req, res) => {
        try {
            const imagePath = await this._handleServerSideGeneration(req);
            let meme = await MemeService.saveMeme(req.body, imagePath);
            return res.status(200).send(meme);
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
    }

    /**
     * Creates a number of memes with the same image but different texts
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning a zip file containing the requested memes
     */
    static postMemes = async (req, res) => {
        try {
            let paths = [];
            for (let i = 0; i < JSON.parse(req.body.memeData).length; i++) {
                let filePath = await MemeGenerator.generate(
                    JSON.parse(req.body.memeData)[i].texts, req.file.path,
                    req.body.maxFileSize,
                    true, i === JSON.parse(req.body.memeData).length - 1);
                paths.push(filePath);
            }
            paths.map(filePath => filePath.split(path.sep).join(path.posix.sep));
            const memes = await MemeService.saveMemes(req.body, paths);
            const zipPath = await ZipGenerator.generate(memes);
            return res.status(200).contentType('zip').download(
                zipPath,
                'meme-collection.zip',
                () => {
                    fs.unlinkSync(zipPath);
                });
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
    }

    /**
     * Updates an already existing meme with the given parameters
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning message indicating if the update was successful
     */
    static putMeme = async (req, res) => {
        try {
            const imagePath = await this._handleServerSideGeneration(req);
            let [meme, oldPath] = await MemeService.updateMeme(req.body, imagePath);
            fs.unlinkSync(path.resolve('public') + path.sep + oldPath);
            return res.status(200).send({
                meme: meme,
                success: 'meme updated'
            });
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
    }

    /**
     * Creates a Meme locally. The Generation method is chosen depending on the given parameters, isFabric if Frontend is requesting,
     * else if its an API only request
     * @param req - the incoming request object
     * @returns {Promise<string>} - the file path to the created meme
     * @private
     */
    static _handleServerSideGeneration = async (req) => {
        let filePath;
        if (req.isFabric) {
            filePath = await MemeGenerator.generateFromJSON(req.body.fabricJSON, req.body.canvasWidth, req.body.canvasHeight, req.body.maxFileSize);
        } else {
            filePath = req.file.path;
            if (req.body.renderOnServer && req.body.renderOnServer === 'true') {
                filePath = await MemeGenerator.generate(JSON.parse(req.body.texts), filePath, req.body.maxFileSize);
            }
        }
        return filePath.split(path.sep).join(path.posix.sep);
    }
}

module.exports.UserController = UserController;
