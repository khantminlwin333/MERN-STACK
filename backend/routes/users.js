const express = require('express');
const UserController = require('../controllers/UserController');
const handleErrorMessage = require('../middlewares/handleErrorMessage');
const {body} = require('express-validator');
const User = require('../models/User');
const router = express.Router();
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const upload = require('../helpers/upload');

router.get('/me', AuthMiddleware, UserController.me);

router.get('/profile/:id',UserController.profile);

router.patch('/editprofile/:id',UserController.editprofile);

router.post('/login', UserController.login);

router.post('/register', [
    body('name').notEmpty(),
    body('email').notEmpty(),
    body('email').custom(async value => {
        const user = await User.findOne({ email: value });
        if (user) {
            throw new Error('Email already in use');
        }
    }),
    body('password').notEmpty(),
], handleErrorMessage, UserController.register);


//uploading profile picture
router.post('/:id/upload',[
    upload.single('photo'),
    body('photo').custom((value,{req})=>{
        if(!req.file){
            throw new Error("Photo is required");
        }
        if(!req.file.mimetype.startsWith('image')){
            throw new Error("Photo must be image");
        }
        return true;
    })
],handleErrorMessage,UserController.upload);

router.delete('/delete-photo/:id',UserController.deleteImg);

router.post('/forgot-password',UserController.forgotPassword);
router.post('/reset-password/:token',UserController.resetPassword);

router.post('/logout', UserController.logout);

module.exports = router;