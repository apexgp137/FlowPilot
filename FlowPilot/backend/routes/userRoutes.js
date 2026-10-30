const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.patch('/:id/toggle-status', userController.toggleUserStatus);

module.exports = router;
