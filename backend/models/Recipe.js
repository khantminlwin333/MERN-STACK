const mongoose = require('mongoose');
const User = require('./User');

const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    userId :{
        type : String,
        ref : User,
        required : true,
    },
    title : {
        type: String,
        required : true,
    },
    photo : {
        type: String,
    },
    description :{
        type : String,
        required : true,
    },
    ingredients :{
        type : Array,
        required : true,
    },
    views:{
        type : Number,
       },
    likes:{
        type : Array
       },
       comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
},{timestamps: true});

module.exports = mongoose.model("Recipe",RecipeSchema);