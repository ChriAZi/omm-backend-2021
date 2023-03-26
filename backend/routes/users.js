const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload/multer')('memes');
const {UserController} = require('../controllers/usersController');
const setMemeGenerationMethod = require('../middleware/upload/MemeGenerationHandler').setMemeGenerationMethod();

/** GET Route returning all memes of user identified by Id **/
router.get('/:id/memes', UserController.getMemes);

/** GET Route returning username of user identified by Id **/
router.get('/:id', UserController.getUser);

/** POST Route uploading single meme (client-side generated/server-side generation/API-only generation) **/
router.post('/memes', setMemeGenerationMethod, UserController.postMeme);

/** POST Route uploading a single image with multiple texts -> returns zip of images**/
router.post('/memes/set', upload.single('meme'), UserController.postMemes);

/** PUT Route updating a already existing meme **/
router.put('/memes', upload.single('meme'), UserController.putMeme);

module.exports = router;