const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');
const removeFile =require('../helpers/removeFile');
const emailQueue = require('../Queues/emailQueue');
const User = require('../models/User');


const RecipeController = {
    index : async(req,res)=>{

        let limit = 6;
        let page = req.query.page || 1;

        let recipes = await Recipe
        .find()
        .skip((page-1) * limit)
        .limit(limit)
        .sort({createdAt : -1});

        let totalRecipesCount = await Recipe.countDocuments();

        let totalPagesCount = Math.ceil(totalRecipesCount/limit)


        let links = {
            nextPage: totalPagesCount == page ? false : true,
            previousPage: page == 1 ? false : true,
            currentPage: page,//hardcode
            loopableLinks: []
        };

        for (let index = 0; index < totalPagesCount; index++) {
            let number = index+1;
            links.loopableLinks.push({number})
            
        }

        let response = {
            links,
            data : recipes
        }

        return res.json(response);
    },

    userRecipe: async (req, res) => {
        try {
            const userId = req.params.userId; // Get user ID from request parameters
    
            if (!userId) {
                return res.status(400).json({ message: "User ID is required" });
            }
    
            let userRecipes = await Recipe.find({ userId: userId }); // Filter by user ID
            return res.json(userRecipes);
        } catch (error) {
            console.error("Error fetching recipe",error);
            res.status(500).json({ message: "Server error" });
        }
    },

    search : async(req,res)=>{
        try {
          let query = req.query.q;
          if (!query) return res.status(400).json({ message: "Search query is required" });
      
          // Step 1: Find recipes by title
          let recipesByTitle = await Recipe.find({ title: { $regex: query, $options: "i" } });
      
          // Step 2: Find users by name
          let users = await User.find({ name: { $regex: query, $options: "i" } });
      
          let recipesByUser = [];
          if (users.length > 0) {
            let userIds = users.map(user => user._id);
            recipesByUser = await Recipe.find({ user: { $in: userIds } });
          }
      
          // Step 3: Merge and remove duplicate recipes
          let allRecipes = [...recipesByTitle, ...recipesByUser];
          let uniqueRecipes = Array.from(new Map(allRecipes.map(r => [r._id.toString(), r])).values());
      
          res.json(uniqueRecipes);
        } catch (error) {
          console.error("Search error:", error);
          res.status(500).json({ message: "Internal server error" });
        }
      },
    
    store : async(req,res)=>{
           try{
            const {title,description,ingredients} = req.body;
            const recipe = await Recipe.create({
                userId: req.user._id,
                title,
                description,
                ingredients
            });

           //

            // Ensure req.user is defined before using it
            if (!req.user || !req.user.email) {
                console.error("Error: req.user or req.user.email is undefined");
                return res.status(401).json({ msg: "Unauthorized: User data missing" });
            }

            // Corrected User.find() query
            let users = await User.find({}, ['email']); 

            // Ensure valid emails and filter out the logged-in user's email
            let emails = users.map(user => user.email).filter(email => email && email !== req.user.email);

            try {
                await emailQueue.add({
                    viewFileName: 'email',
                    data: {
                        name: req.user.name,
                        recipeTitle: recipe.title
                    },
                    from: req.user.email,
                    to: emails,
                    subject: 'New Recipe Created'
                });
            } catch (emailError) {
                console.error("Error sending email:", emailError);
            }

                    //
            return res.json(recipe);
            
           }catch(e){
            console.error('Error creating recipe:', e);
               return res.status(500).json({msg: "Internal Server error"});
        }    
    },
    show : async(req,res)=>{
        try{
            let id = req.params.id;
            if(!mongoose.Types.ObjectId.isValid(id)){
                
                return res.status(400).json({msg: "Not a valid id"});
            }

        let recipe = await Recipe.findById(id)
        .populate({
            path: 'comments.userId', // Populate the userId field in comments
            select: 'name', // Only select the 'name' field from the user model
            model : 'User'
        });
        if(!recipe){
            return res.status(404).json({msg: "Recipe not found"});
        }

        // Check if comments have userId populated
        
        const commentsWithUsernames = recipe.comments.map(comment => {
            if (comment.userId) {
                return {
                    ...comment.toObject(),
                    userName: comment.userId.name ,
                };
            } else {
                return {
                    ...comment.toObject(),
                    userName: "Unknown User" // Fallback if userId is not populated
                };
            }
        });
     
        recipe.likesCount = recipe.likes.length;
        recipe.viewsCount = recipe.views;
        return res.json({
            ...recipe.toObject(),
            likesCount: recipe.likesCount,
            viewsCount : recipe.views,
            commentsWithUser : commentsWithUsernames
        });
        }
        catch(e){
            return res.status(500).json({msg: "Internet Server error"});
        }
    },
    
    destroy :async (req,res)=>{
        try{
            let id = req.params.id;
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({msg: "Not a valid id"});
            }

        let recipe = await Recipe.findByIdAndDelete(id);
        await removeFile(__dirname+"/../public"+recipe.photo);
        if(!recipe){
            return res.status(404).json({msg: "Recipe not found"});
        }
        return res.json(recipe)
        }
        catch(e){
            return res.status(500).json({msg: "Internet Server error"});
        }
    },

    deleteImage : async (req, res) => {
        try {
            const recipe = await Recipe.findById(req.params.id);
            if (!recipe) return res.status(404).json({ msg: "Recipe not found" });
    
            await removeFile(__dirname+"/../public"+recipe.photo);

            recipe.photo = null;
            await recipe.save();
    
            res.json({ msg: "Recipe photo deleted successfully" });
        } catch (error) {
            console.log("Errors",error);
            res.status(500).json({ msg: "Error deleting recipe photo" });
        }
    },
    update : async(req,res)=>{
        try{
            let id = req.params.id;
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({msg: "Not a valid id"});
            }

        let recipe = await Recipe.findByIdAndUpdate(id,{
            ...req.body// title: update title
        });

        if (req.file) {
            // Remove the old photo from the filesystem
            await removeFile(__dirname + "/../public" + recipe.photo);
        }
        //await removeFile(__dirname+"/../public"+recipe.photo);
        if(!recipe){
            return res.status(404).json({msg: "Recipe not found"});
        }
        return res.json(recipe)
        }
        catch(e){
            return res.status(500).json({msg: "Internet Server error"});
        }
    },
    upload :async(req,res)=>{
        try{
            let id = req.params.id;
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({msg: "Not a valid id"});
            }


            let recipe = await Recipe.findByIdAndUpdate(id,{
            photo: '/'+ req.file.filename
        });
        await removeFile(__dirname + "/../public" + recipe.photo);
        if(!recipe){
            return res.status(404).json({msg: "Recipe not found"});
        }

        
        return res.json(recipe)
        }
        catch(e){
            return res.status(500).json({msg: "Internet Server error"});
        }
    },
    incrementView: async (req, res) => {
        const { id } = req.params;
    
        try {
            // Find the recipe by ID
            const recipe = await Recipe.findById(id);
    
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }
    
            // Initialize views if it's not set
        if (isNaN(recipe.views)) {
            recipe.views = 0;
        }

        // Increment the view count
        recipe.views += 1;
        await recipe.save();

        // Send updated view count
        res.status(200).json({ views: recipe.views });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error incrementing view count' });
        }
    },
    like: async(req,res)=>{
        try {
            let { userId } = req.body; // Get user ID from request body
            let recipe = await Recipe.findById(req.params.id);
        
            if (!recipe) return res.status(404).json({ message: "Recipe not found" });
        
            // Initialize likes array if it's not already initialized
        if (!Array.isArray(recipe.likes)) {
            recipe.likes = [];
        }

        // Like or Unlike Logic
        if (recipe.likes.includes(userId)) {
            // Un-like the recipe (remove userId from likes array)
            recipe.likes = recipe.likes.filter(id => id !== userId);
        } else {
            // Like the recipe (add userId to likes array)
            recipe.likes.push(userId);
        }

        await recipe.save(); // Save the updated recipe
        
        // Send back the updated like count
        res.status(200).json({ likes: recipe.likes.length });
          } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Server error" });
          }
    },
    addcomment:async(req,res)=>{
        try {
            let { id } = req.params;
            let { text,userId } = req.body;
    
            if (!text || !id || !userId) {
                return res.status(400).json({ message: 'Comment are required' });
            }
    
            let recipe = await Recipe.findById(id);

    
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }
    
            // Add the new comment to the comments array
            let saveComment = recipe.comments.push({
                userId,
                text
            });
    
            // Save the updated recipe with the new comment
            await recipe.save();
    
            // Send the updated recipe with the new comment
            return res.status(200).json(recipe);
        } catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    deletecomment: async(req,res)=>{
        try{
            let {recipeId,commentId} = req.params;
            let recipe = await Recipe.findById(recipeId);

            if (!recipe) {
                return res.status(404).json({ message: "Recipe not found" });
            }
            
             // Delete comment using MongoDB $pull
        let deleteComment = await Recipe.findByIdAndUpdate(recipeId, {
            $pull: { comments: { _id: commentId } }
        });

        if(deleteComment){
            res.status(200).json({ message: "Comment deleted successfully" });
        }
        
        }catch(e){
            console.log("Errors",e);
            res.status(500).json({ error: "Failed to delete comment" });
        }
    },

    editcomment:async(req,res)=>{
        

    try {
        const { text } = req.body;
        const { recipeId, commentId } = req.params;
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        const comment = recipe.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.text = text; // Update comment text
        await recipe.save();

        res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        res.status(500).json({ message: "Error updating comment", error });
    }
    },

}

module.exports = RecipeController;