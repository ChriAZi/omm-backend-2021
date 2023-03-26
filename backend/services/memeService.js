const Meme = require('../models/meme')
const Comment = require('../models/comment')
const Vote = require('../models/vote')

class MemeService {

    /**
     * Fetches all public Memes from the database
     * @returns {Promise<Meme>} - List of Meme Objects
     */
    static getPublicMemes = async () => {
        try {
            const filter = {
                listingStatus: 'PUBLIC',
                'draft.isDraft': false
            }
            return await Meme.find(filter);
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Fetches a Meme identified by its id from the database
     * @returns {Promise<Meme>} - a Meme Object
     */
    static getMeme = async (id) => {
        try {
            return await Meme.findOne({_id: id});
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Fetches all memes for a user from the database
     * @param userId - the owning user
     * @param queryParams - the filterOptions details in the API documentation
     * @returns {Promise<Meme>} - List of Meme Objects
     */
    static getMemesForUser = async (userId, queryParams) => {
        try {
            let filter = {
                user: userId,
                'draft.isDraft': false
            }
            if (queryParams.draft && queryParams.draft === 'true') {
                filter['draft.isDraft'] = true;
            }
            return await Meme.find(filter);
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Creates a new Meme Object and saves it to the database
     * @param body - the request body
     * @param path - the path of the uploaded image
     * @returns {Promise<Meme>} - List of Meme Objects
     */
    static saveMeme = async (body, path) => {
        try {
            const texts = isJSONString(body.texts) ? JSON.parse(body.texts) : body.texts;
            body.templates = isJSONString(body.templates) ? JSON.parse(body.templates) : body.templates
            let meme = this._createMeme(body, texts, path);
            return await meme.save();
        } catch (err) {
            throw new Error(err);
        }

        /**
         * Checks if a string is a valid JSON
         * SOURCE: https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
         * @param str - the string to be tested
         * @returns {boolean} - true if str is JSON, false if not
         */
        function isJSONString(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }
    }

    /**
     * Saves a new comment on an existing meme
     * @param body - the request body
     * @returns {Promise<Meme>} - a Meme Object
     */
    static saveComment = async (body) => {
        try {
            let meme = await Meme.findOne({_id: body.meme});
            meme.comments.push(new Comment({
                content: body.content,
                user: body.user
            }))
            return await meme.save();
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Saves a new vote on an existing meme
     * @param body - the request body
     * @returns {Promise<Meme>} - a Meme Object
     */
    static saveVote = async (body) => {
        try {
            const meme = await Meme.findOne({
                _id: body.meme
            });
            const newVote = meme.votes.every(vote => vote.user.toString() !== body.user) || meme.votes.length === 0;
            /* no votes from this user yet */
            if (newVote) {
                if (body.upVote) {
                    meme.votes.push(new Vote({
                        upVote: body.upVote,
                        user: body.user
                    }))
                } else {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('Cannot remove vote for meme where user has not yet voted. Are you setting the upVote flag correctly?');
                }
                /* user already voted */
            } else {
                if (!body.upVote) {
                    meme.votes.splice(meme.votes.findIndex((vote) => {
                        return vote.user === body.user;
                    }), 1);

                } else {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('User voted already for this meme.');
                }
            }
            return await meme.save();
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Saves a new comment on an existing meme
     * @param body - the request body
     * @returns {Promise<Meme>} - a Meme Object
     */
    static saveView = async (body) => {
        try {
            let meme = await Meme.findOne({_id: body.meme});
            meme.views += 1;
            return await meme.save();
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Saves a list of memes to the database
     * @param body - the request body
     * @param paths - the ordered list of paths of the uploaded images
     * @returns {Promise<Meme>} - List of Meme Objects
     */
    static saveMemes = async (body, paths) => {
        try {
            let memes = [];
            body.memeData = JSON.parse(body.memeData);
            for (let meme in body.memeData) {
                let properties = {
                    user: body.user,
                    title: body.memeData[meme].title,
                    templates: body.templates,
                    texts: body.memeData[meme].texts,
                    listingStatus: body.memeData[meme].listingStatus,
                    isDraft: body.memeData[meme].isDraft
                }
                let memeToBeSaved = this._createMeme(properties, properties.texts, paths[meme])
                memes.push(await memeToBeSaved.save());
            }
            return memes;
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Updates an existing meme in the database
     * @param body - the request body
     * @param path - the uploaded image path
     * @returns {Promise<(*|*)[]>}
     */
    static updateMeme = async (body, path) => {
        try {
            const oldMeme = await Meme.findOne({_id: body.memeId});
            const oldPath = oldMeme.path;

            let meme = this._createMeme(body, JSON.parse(body.texts), path);
            meme.comments = oldMeme.comments;
            meme.votes = oldMeme.votes;

            await Meme.deleteOne({_id: body.memeId});
            const updatedMeme = await meme.save();

            return [updatedMeme, oldPath];
        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * Creates a Meme object to be saved in the database
     * @param body - the request body
     * @param texts - the texts of a meme
     * @param path - the path of th uploaded image
     * @returns {Meme} - the created Meme object
     * @private
     */
    static _createMeme = (body, texts, path) => {
        return new Meme({
            user: body.user,
            title: body.title,
            path: path.replace(/(^.?)(\/?)(public)\//, ''),
            templates: body.templates,
            texts: texts,
            comments: [],
            votes: [],
            views: 0,
            listingStatus: body.listingStatus,
            draft: {
                isDraft: body.isDraft,
                content: body.draftContent
            }
        })
    }
}

module.exports.MemeService = MemeService;