const fs = require('fs');
const stackTrace = require('stack-trace');

const {VideoGenerator} = require('../generators/videoGenerator');
const {ZipGenerator} = require('../generators/zipGenerator');
const {MemeService} = require('../services/memeService');
const {MemeFilter} = require('../filter/memeFilter');

class MemesController {

    /**
     * Returns a filtered and sorted list of memes or a zip file of memes
     * Possible filters can be found in the API Documentation
     * https://www.notion.so/API-Documentation-913625c11eb740beaabe77b6310119b0
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the list of memes or the zip file
     */
    static getMemes = async (req, res) => {
        try {
            const memes = await MemeService.getPublicMemes();
            const memeFilter = new MemeFilter(memes);
            const filteredAndSortedMemes = memeFilter.filter(req.filterOptions).sort(req.sortOptions);
            if (req.downloadOptions.zip) {
                const zipPath = await ZipGenerator.generate(filteredAndSortedMemes);
                return res.status(200).contentType('zip').download(
                    zipPath,
                    'filtered-and-sorted-memes.zip',
                    () => {
                        fs.unlinkSync(zipPath);
                    });
            }
            return res.status(200).json(filteredAndSortedMemes);
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
     * Returns a meme identified by its id
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request returning the meme identified by its id if found
     */
    static getMeme = async (req, res) => {
        try {
            const meme = await MemeService.getMeme(req.params.id);
            return res.status(200).json(meme);
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
     * Updates a comment on an already existing meme
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request indicating if the update was successful
     */
    static putComment = async (req, res) => {
        try {
            await MemeService.saveComment(req.body);
            return res.status(200).json({success: 'comment saved'});
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
     * Updates a vote on an already existing meme
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request indicating if the update was successful
     */
    static putVote = async (req, res) => {
        try {
            await MemeService.saveVote(req.body);
            return res.status(200).json({success: 'vote saved'});
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
     * Updates a view on an already existing meme
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request indicating if the update was successful
     */
    static putView = async (req, res) => {
        try {
            await MemeService.saveView(req.body);
            return res.status(200).json({success: 'view saved'});
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
     * Creates a video of memes and streams it to the client
     * SOURCE: https://dev.to/abdisalan_js/how-to-code-a-video-streaming-server-using-nodejs-2o0
     * @param req - the incoming request object
     * @param res - the outgoing response object
     * @returns {*} - an HTTP request streaming the created video
     */
    static streamVideo = async (req, res) => {
        try {
            const videoPath = await VideoGenerator.generate();

            const range = req.headers.range;
            if (!range) {
                res.status(400).send('Range headers are needed to stream video.');
            }

            const videoSize = fs.statSync(videoPath).size;

            const CHUNK_SIZE = 10 ** 6; // 1 MB
            const start = Number(range.replace(/\D/g, ''));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

            // Create headers
            const contentLength = end - start + 1;
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': 'video/mp4'
            };

            res.writeHead(206, headers);
            const videoStream = fs.createReadStream(videoPath, {start, end});

            videoStream.pipe(res);
        } catch (err) {
            return res.status(500).json({
                errors: {
                    message: err.message,
                    location: stackTrace.parse(err)[0]
                }
            });
        }
    }
}

module.exports.MemesController = MemesController;