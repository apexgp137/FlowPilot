const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', complianceController.getAllCompliance);
router.post('/', complianceController.createCompliance);
router.get('/:id', complianceController.getComplianceById);
router.patch('/:id', complianceController.updateCompliance);

module.exports = router;
