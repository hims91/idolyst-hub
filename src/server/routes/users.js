
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/fileUpload');

// Public routes
router.get('/profile/:id', userController.getUserProfile);

// Protected routes
router.get('/', authenticateToken, authorize(['admin']), userController.getAllUsers);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/profile/avatar', authenticateToken, uploadProfileImage, userController.updateAvatar);
router.post('/follow/:id', authenticateToken, userController.followUser);
router.post('/unfollow/:id', authenticateToken, userController.unfollowUser);
router.get('/followers', authenticateToken, userController.getFollowers);
router.get('/following', authenticateToken, userController.getFollowing);

module.exports = router;
