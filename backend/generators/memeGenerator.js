const fs = require('fs');
const path = require('path');
/**
 * Fabric.js
 * @source https://www.npmjs.com/package/fabric
 * @license MIT License
 * @description Library to work with HTML Canvas using Node.js
 */
const fabric = require('fabric').fabric;
/**
 * Image Size
 * @source https://www.npmjs.com/package/image-size
 * @license MIT License
 * @description Library to get dimensions of image files
 */
const sizeOf = require('image-size');
/**
 * Image-Min
 * @source https://www.npmjs.com/package/imagemin
 * @license MIT License
 * @description Compression library for images
 */
const imagemin = require('imagemin');
/**
 * Image-Min PNG Compression
 * @source https://www.npmjs.com/package/imagemin-pngquant
 * @license MIT License
 * @description Library plugin for PNG compression algorithms
 */
const imageminPngquant = require('imagemin-pngquant');

class MemeGenerator {

    /**
     * Generates an image file from a fabricJSON Object
     * @param fabricJSON - the fabric JSON object
     * @param canvasWidth - wanted with of the image
     * @param canvasHeight - wanted height of the image
     * @param maxImageSize - the maximum image size if image is to be compressed
     * @returns {Promise<PathLike>} - a Promise resolving to the created image path or rejected if an error occurred
     */
    static generateFromJSON = async (fabricJSON, canvasWidth, canvasHeight, maxImageSize) => {
        const canvas = new fabric.StaticCanvas(null, {
            width: parseInt(canvasWidth),
            height: parseInt(canvasHeight)
        });
        return await new Promise((resolve, reject) => {
            try {
                this._adaptSourcePaths(fabricJSON);
                canvas.loadFromJSON(fabricJSON, async () => {
                    canvas.renderAll();
                    try {
                        resolve(await this._saveCanvas(canvas, undefined, maxImageSize, false, true));
                    } catch (err) {
                        reject(err);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Generates an image file from a set of texts and an uploaded image file
     * @param texts - the texts to be placed on the meme image
     * @param path - the path of the uploaded image
     * @param maxImageSize - the maximum image size if image is to be compressed
     * @param multiple - true if multiple images are created (needed for set of memes)
     * @param last - true if the image to be created is the last in this cycle (needed for set of memes)
     * @returns {Promise<PathLike>} - a Promise resolving to the created image path or rejected if an error occurred
     */
    static generate = async (texts, path = '', maxImageSize = false, multiple = false, last = false) => {
        const dimensions = sizeOf(path);
        const width = dimensions.width;
        const height = dimensions.height;
        const canvas = new fabric.StaticCanvas(null, {
            width: width,
            height: height
        })

        return await new Promise(((resolve, reject) => {
            try {
                fabric.util.loadImage('file://' + path, async (img) => {
                    const image = new fabric.Image(img);
                    canvas.add(image);

                    for (let index = 0; index < texts.length; index++) {
                        const renderedText = this._generateTexts(texts[index], width, height);
                        canvas.add(renderedText);
                    }
                    canvas.renderAll();
                    try {
                        resolve(await this._saveCanvas(canvas, path, maxImageSize, multiple, last));
                    } catch (err) {
                        reject(err);
                    }
                });
            } catch (err) {
                reject(err);
            }
        }))
    }

    /**
     * Generates the Text Elements to be placed on a fabric canvas
     * @param text - the text element to be used
     * @param width - the width of the canvas
     * @param height - the height of the canvas
     * @returns {fabric.Text} - the Text Element to be placed on the fabric canvas
     * @private
     */
    static _generateTexts = (text, width, height) => {
        let offSetTop = (height / 2)
        let offSetLeft = (width / 2)
        let fontWeight, fontStyle;
        fontWeight = fontStyle = 'normal';
        let originY = 'center'
        let originX = 'left';
        let angle = 0;

        if (text.isTopCaption === 'true' && text.isBottomCaption !== 'true') {
            offSetTop = (height / 10);
            offSetLeft = (width / 2);
            originY = 'top';
            originX = 'center';
        } else if (text.isBottomCaption === 'true' && text.isTopCaption !== 'true') {
            offSetTop = height - (height / 10);
            offSetLeft = (width / 2);
            originY = 'bottom'
            originX = 'center';
        } else if (text.isTopCaption !== 'true' && text.isBottomCaption !== 'true') {
            if (text.yCoord) offSetTop = parseInt(text.yCoord);
            if (text.xCoord) offSetLeft = parseInt(text.xCoord);
        } else {
            throw new Error('Forbidden Text Values. Can either be \'isTopCaption\', \'isBottomCaption\', none of the two but never both.');
        }

        if (text.bold === 'true') fontWeight = 'bold';
        if (text.italic === 'true') fontStyle = 'italic';
        if (text.rotation) angle = parseInt(text.rotation);

        return new fabric.Textbox(text.content, {
            top: offSetTop,
            left: offSetLeft,
            originY: originY,
            originX: originX,
            fill: text.color,
            fontSize: text.size,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            angle: angle
        });
    }

    /**
     * Saves the fabric canvas to an image file
     * @param canvas - the canvas to be placed
     * @param imagePath - the path of the uploaded image
     * @param maxImageSize - the maximum image size if image is to be compressed
     * @param multiple - true if multiple images are created (needed for set of memes)
     * @param last - true if the image to be created is the last in this cycle (needed for set of memes)
     * @returns {Promise<PathLike>} - a Promise resolving to the created image path or rejected if an error occurred
     * @private
     */
    static _saveCanvas = (canvas, imagePath = undefined, maxImageSize, multiple, last) => {
        return new Promise((resolve, reject) => {
            try {
                let filePath = path.resolve('public')
                    + path.sep + 'uploads' + path.sep + 'memes' + path.sep + 'memes-' + Date.now() + '.png';
                const file = fs.createWriteStream(filePath);
                const stream = canvas.createPNGStream();
                stream.on('data', (chunk) => {
                    file.write(chunk);
                });
                stream.on('end', async () => {
                    if (maxImageSize && parseInt(maxImageSize) !== 0) {
                        try {
                            filePath = await this._compressImage(filePath, maxImageSize);
                        } catch (err) {
                            reject(err);
                        }
                    }
                    if ((!multiple || last) && imagePath !== undefined) fs.unlinkSync(imagePath);
                    resolve(path.relative(process.cwd(), filePath));
                })
            } catch (err) {
                reject(err);
            }
        })
    }

    /**
     * Compresses an image to be smaller than the requested maxImageSize
     * @param imagePath - the path of the uploaded image
     * @param maxImageSize - the maximum image size if image is to be compressed
     * @returns {Promise<string>} - The relative path of the created compressed version of the image
     * @private
     */
    static _compressImage = async (imagePath, maxImageSize) => {
        const file = await imagemin([imagePath], {
            destination: path.resolve('public')
                + path.sep + 'uploads' + path.sep + 'memes' + path.sep + 'compressed',
            plugins: [
                imageminPngquant({
                    quality: [0.1, 0.1]
                })
            ]
        });
        // cannot make quality controls dynamic as size of generated meme always returns 0 --> seems to be a node.js or fabric.js bug
        const oldPath = path.resolve(file[0].sourcePath);
        const newPath = path.resolve(file[0].destinationPath);
        const stats = fs.statSync(newPath);
        const fileSize = stats.size;
        if (fileSize > maxImageSize) throw new Error('File is too big to be compressed to chosen maximum size.');
        // Deleting uncompressed image and moving compressed image to old location of uncompressed image
        fs.unlinkSync(oldPath);
        fs.renameSync(newPath, oldPath);
        return path.relative(process.cwd(), oldPath);
    }

    /**
     * Adapts Paths of incoming JSON object to use correct paths
     * @param json - the fabric JSON
     * @private
     */
    static _adaptSourcePaths = (json) => {
        json.objects.forEach(function (value, i) {
            let src = value.src;
            if (src !== undefined) {
                json.objects[i].src = 'http://localhost:5000' + new URL(src).pathname
            }
        });
    }
}

module.exports.MemeGenerator = MemeGenerator