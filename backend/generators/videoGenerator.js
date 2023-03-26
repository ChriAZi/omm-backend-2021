/**
 * Video Show
 * @source https://www.npmjs.com/package/videoshow
 * @license MIT License
 * @description Library to create videos from images
 */
const videoshow = require('videoshow')
const path = require('path');
const fs = require('fs');

class VideoGenerator {

    /**
     * Generates a video from a set of 10 uploaded memes
     * @returns {Promise<PathLike>} - a Promise resolving to the created video path or rejected if an error occurred
     */
    static generate = async () => {
        return await new Promise(async (resolve, reject) => {

            const memeFolder = path.resolve('public')
                + path.sep + 'uploads' + path.sep + 'memes';

            let images = [];

            fs.readdirSync(memeFolder).forEach(file => {
                if (path.extname(file) === '.png') {
                    images.push(memeFolder + path.sep + file);
                }
            });

            const videoOptions = {
                fps: 1,
                videoBitrate: 256,
                videoCodec: 'libx264',
                size: '640x640',
                format: 'mp4',
                outputOptions: ['-pix_fmt yuv420p']
            }

            const videoPath = path.resolve('public')
                + path.sep + 'downloads' + path.sep + 'videos' + path.sep;

            if (!fs.existsSync(videoPath)) {
                fs.mkdirSync(videoPath, {recursive: true});
            }
            const videoName = 'video-' + Date.now() + '.mp4';

            videoshow(images.slice(0, 10), videoOptions)
                .save(videoPath + videoName)
                .on('error', (err, stdout, stderr) => {
                    reject(err);
                })
                .on('end', (output) => {
                    resolve(videoPath + videoName);
                })
        })
    }
}

module.exports.VideoGenerator = VideoGenerator;