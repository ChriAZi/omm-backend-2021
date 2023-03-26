/**
 * Archiver
 * @source https://www.npmjs.com/package/archiver
 * @license MIT License
 * @description Library to create zip archives
 */
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

class ZipGenerator {

    /**
     * Generates a zip archive of maximum 10 images
     * @param memes - the memes to be included in the zip archive
     * @returns {Promise<PathLike>} - a Promise resolving to the created zip path or rejected if an error occurred
     */
    static generate = async (memes) => {
        return await new Promise(async (resolve, reject) => {
                try {
                    const archive = archiver('zip', {});
                    archive.on('error', (err) => {
                        throw new Error(err);
                    });

                    const downloadPath = path.resolve('public')
                        + path.sep + 'downloads' + path.sep + 'memes' + path.sep;
                    if (!fs.existsSync(downloadPath)) {
                        fs.mkdirSync(downloadPath, {recursive: true});
                    }

                    const output = fs.createWriteStream(downloadPath + 'memes-' + Date.now() + '.zip');
                    output.on('close', () => {
                        resolve(output.path)
                    })

                    archive.pipe(output);
                    const memesToBeZipped = memes.slice(0, 10);
                    for (let meme in memesToBeZipped) {
                        const filePath = path.resolve('public') + path.sep + path.normalize(memes[meme].path);
                        archive.file(filePath, {
                            name: path.basename(memes[meme].path)
                        });
                    }
                    await archive.finalize();
                } catch (err) {
                    reject(err);
                }
            }
        )
    }
}

module.exports.ZipGenerator = ZipGenerator;