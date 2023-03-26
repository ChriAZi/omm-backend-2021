const Template = require('../models/template')

class TemplateService {

    /**
     * Fetches all Templates from the database
     * @returns {Promise<Template>} - List of Template Objects
     */
    static getTemplates = async () => {
        try {
            return await Template.find({});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Fetches a Template identified by its id from the database
     * @returns {Promise<Template>} - a Template Object
     */
    static getTemplate = async (id) => {
        try {
            return await Template.findOne({_id: id});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Creates a new Template Object and saves it to the database
     * @param body - the request body
     * @param path - the path of the uploaded image
     * @returns {Promise<Template>} - List of Template Objects
     */
    static saveTemplate = async (body, path) => {
        try {
            let template = this._createTemplate(body, path);
            return await template.save();
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Creates a Template object to be saved in the database
     * @param body - the request body
     * @param path - the path of th uploaded image
     * @returns {Template} - the created Meme object
     * @private
     */
    static _createTemplate = (body, path) => {
        return new Template({
            title: body.title,
            path: path.replace(/(^.?)(\/?)(public)\//, '')
        })
    }
}

module.exports.TemplateService = TemplateService;