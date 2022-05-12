const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    getUserDetail,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser,
    googleAuth,
} = require('../controllers/userController');

const { isAuthenticatedUser } = require('../middlewares/auth');

router.route('/users').get(isAuthenticatedUser,getAllUsers);
router.route('/users/:id').get(isAuthenticatedUser,getUserDetail);
router.route('/users/:id').put(isAuthenticatedUser,updateUser);
router.route('/users/:id').delete(isAuthenticatedUser,deleteUser);
router.route('/users').post(createUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser)
router.route('/google/register').post(googleAuth);

module.exports = router;