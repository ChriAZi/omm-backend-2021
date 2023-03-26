const path = require('path');
const stackTrace = require('stack-trace');
/**
 * Capture Website
 * @source https://www.npmjs.com/package/capture-website
 * @license MIT License
 * @description Library to headlessly access websites and screenshot them
 */
const captureWebsite = require('capture-website');

const {TemplateService} = require('../services/templateService');

class TemplatesController {

    /**
     * Returns all templates from the database
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the requested templates
     */
    static getTemplates = async (req, res) => {
        try {
            const templates = await TemplateService.getTemplates();
            return res.status(200).json(templates);
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
     * Returns a template identified by its id
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the meme identified by its id if found
     */
    static getTemplate = async (req, res) => {
        try {
            const template = await TemplateService.getTemplate(req.params.id);
            return res.status(200).json(template);
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
     * Headlessly navigates to the requested url, takes a screenshot and returns a new Template Object holding the path to the image
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the newly created template with its path pointing to the screenshot location
     */
    static getScreenshotFromURL = async (req, res) => {
        try {
            if (req.query.url && isValidURL(req.query.url)) {
                if (req.query.title) {
                    const screenshotPath = path.resolve('public')
                        + path.sep + 'uploads' + path.sep + 'templates' + path.sep;
                    const templateName = 'templates-' + Date.now() + '.png';
                    await captureWebsite.file(req.query.url, screenshotPath + templateName, {
                        launchOptions: {
                            args: [
                                '--no-sandbox',
                                '--disable-setuid-sandbox'
                            ]
                        }
                    });
                    const normalizedPath = (screenshotPath + templateName).split(path.sep).join(path.posix.sep);
                    const template = await TemplateService.saveTemplate(req.query, path.relative(process.cwd(), normalizedPath));
                    return res.status(200).send({
                        template: template,
                        success: 'screenshot saved'
                    });
                } else {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('Title needed to save template. Did you forget &title=title in the URL?');
                }
            } else {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Invalid query string or URL format.');
            }
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }

        /**
         * Checks if the given string is a valid URL
         * SOURCE: https://www.w3resource.com/javascript-exercises/javascript-regexp-exercise-9.php
         * @param fullURL - the url to be tested
         * @returns {boolean} - true if the input was a valid URl, false if not
         */
        function isValidURL(fullURL) {
            /* Don't test for query strings **/
            const url = fullURL.split('?')[0];
            const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
            return regexp.test(url);
        }
    }

    /**
     * Creates a new template in the database and stores the provided image on the server
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the created Template Object
     */
    static postTemplate = async (req, res) => {
        try {
            const normalizedPath = req.file.path.split(path.sep).join(path.posix.sep);
            const template = await TemplateService.saveTemplate(req.body, normalizedPath);
            return res.status(200).send({
                template: template,
                success: 'template saved'
            });
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
    };
}

module.exports.TemplatesController = TemplatesController;

