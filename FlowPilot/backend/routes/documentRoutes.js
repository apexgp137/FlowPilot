const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/check', documentController.performDocumentCheck);
router.get('/', documentController.getDocumentChecks);

module.exports = router;
