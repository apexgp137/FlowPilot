const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', alertController.getAllAlerts);
router.get('/unread-count', alertController.getUnreadCount);
router.patch('/:id/read', alertController.markAsRead);
router.post('/mark-all-read', alertController.markAllAsRead);

module.exports = router;
