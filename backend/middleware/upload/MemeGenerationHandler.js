const stackTrace = require('stack-trace');
const upload = require('./multer')('memes');

module.exports = {
    /**
     * Middleware discerning what kind of meme creation request was made redirecting accordingly
     * @returns Express Middleware Function
     */
    setMemeGenerationMethod: () => {
        return (req, res, next) => {
            try {
                switch (req.is()) {
                    // FormData -> API Generation
                    case 'multipart/form-data':
                        req.isFabric = false;
                        upload.single('meme')(req, res, next);
                        break;
                    // Application/JSON -> Server-side Generation from Frontend
                    case 'application/json':
                        req.isFabric = true;
                        next();
                        break;
                    default:
                        const err = new Error('Content-Type not allowed. Use either multipart/form-data or application/json');
                        return res.status(401).json({
                            errors: {
                                message: err.message,
                                location: stackTrace.parse(err)[0]
                            }
                        });
                }
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
}