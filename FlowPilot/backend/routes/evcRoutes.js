const express = require('express');
const router = express.Router();
const evcController = require('../controllers/evcController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', evcController.getAllVisits);
router.post('/', authorize(['ADMIN', 'OFFICIAL']), evcController.scheduleVisit);
router.patch('/:id', authorize(['ADMIN', 'OFFICIAL']), evcController.updateVisit);

module.exports = router;
