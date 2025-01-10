const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.get('/', adminController.isLoggedIn, adminController.getAdminPage);

router.get('/create', adminController.isLoggedIn, adminController.getCreatePage);
router.post('/create', adminController.isLoggedIn, adminController.upload.single('image'), adminController.createContent);

router.get('/edit/:type/:id', adminController.isLoggedIn, adminController.getEditPage);
router.post('/edit/:type/:id', adminController.isLoggedIn, adminController.upload.single('image'), adminController.editContent);

router.get('/show/:type/:id', adminController.isLoggedIn, adminController.getShowPage);

router.post('/delete/:type/:id', adminController.isLoggedIn, adminController.deleteContent);

router.get('/login', adminController.getLoginPage);
router.post('/login', adminController.login);

router.get('/logout', adminController.logout);

module.exports = router;
