const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', institutionController.getAllInstitutions);
router.post('/', authorize(['ADMIN', 'OFFICIAL']), institutionController.createInstitution);
router.get('/:id', institutionController.getInstitutionById);
router.patch('/:id', institutionController.updateInstitution);

module.exports = router;
