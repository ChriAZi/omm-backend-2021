const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload/multer')('templates');
const {TemplatesController} = require('../controllers/templatesController');

/** GET Route returning all Template **/
router.get('/', TemplatesController.getTemplates);

/** GET Route returning a captured Screenshot from provided URL as Template **/
router.get('/screenshot', TemplatesController.getScreenshotFromURL);

/** GET Route returning template identified by Id **/
router.get('/:id', TemplatesController.getTemplate);

/** POST Route creating a single template **/
router.post('/templates', upload.single('template'), TemplatesController.postTemplate);

module.exports = router;