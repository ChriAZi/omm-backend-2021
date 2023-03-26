const express = require('express');
const router = express.Router();

const {MemesController} = require('../controllers/memesController');
const getFilterAndSortOptions = require('../middleware/filter/filterQueryHandler').getFilterAndSortOptions();

/** GET Route returns all public Memes **/
router.get('/', getFilterAndSortOptions, MemesController.getMemes);

/** GET Route streams a video of memes to the client **/
router.get('/video', MemesController.streamVideo);

/** GET Route returning a meme identified by Id **/
router.get('/:id', MemesController.getMeme);

/** PUT Route updating a meme with a comment **/
router.put('/comments', MemesController.putComment);

/** PUT Route updating a meme with a vote **/
router.put('/votes', MemesController.putVote);

/** PUT Route updating a meme with a view **/
router.put('/views', MemesController.putView);

module.exports = router;