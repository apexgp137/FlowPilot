const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', applicationController.getAllApplications);
router.post('/', applicationController.createApplication);
router.get('/:id', applicationController.getApplicationById);
router.patch('/:id', applicationController.updateApplicationWorkflow);
router.get('/:id/history', applicationController.getApplicationHistory);

module.exports = router;
