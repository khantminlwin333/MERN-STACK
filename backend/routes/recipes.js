const express = require('express');
const {body} = require('express-validator');
const RecipeController = require('../controllers/RecipeController');
const handleErrorMessage = require('../middlewares/handleErrorMessage');
const upload = require('../helpers/upload');
const router = express.Router();
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const UserController = require('../controllers/UserController');

router.get('',RecipeController.index)

router.get('/userRecipe/:userId',RecipeController.userRecipe)
//Post to server
router.post('',[
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('ingredients').notEmpty().isArray({min : 2}),
],handleErrorMessage,AuthMiddleware,RecipeController.store);


router.post('/:id/increment-views',AuthMiddleware,RecipeController.incrementView);
router.post('/:id/like',AuthMiddleware,RecipeController.like);

router.post('/:id/addcomment',AuthMiddleware,RecipeController.addcomment);

//Showing with search query
router.get('/search',RecipeController.search);

//Showing with id detail
router.get('/:id',RecipeController.show);

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
],handleErrorMessage,AuthMiddleware,RecipeController.upload);
//Deleting whole recipe
router.delete('/:id',AuthMiddleware,RecipeController.destroy);

//Deleting Comment
router.delete('/:recipeId/deletecomment/:commentId',RecipeController.deletecomment);
//Editing comments
router.put('/:recipeId/editcomment/:commentId',RecipeController.editcomment);

router.delete('/delete-photo/:id',AuthMiddleware,RecipeController.deleteImage)

router.patch('/:id',AuthMiddleware,RecipeController.update);

module.exports = router;