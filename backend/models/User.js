const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name : {
        type: String,
        required : true,
    },
    email :{
        type : String,
        required : true,
    },
    password :{
        type : String,
        required : true,
    },
    photo :{
        type : String,
    },
    phone :{
        type : String,  
    },
    sex :{
        type : String,
    },
    birthDate :{
        type : Date,
    },
   
    resetPasswordToken:{
        type : String,
    },
    resetPasswordExpires:{
        type: String,
    }
},{timestamps: true});

UserSchema.statics.login= async function(email,password){
    let user = await this.findOne({email});
    if(!user){
        throw new Error('user does not exit');
    }

    let isCorrect = await bcrypt.compare(password,user.password);
    if(isCorrect){
        return user;
    }else{
        throw new Error('password is incorrect');
    }
}



UserSchema.statics.register= async function(name,email,password){
    let userExits = await this.findOne({email})
        if(userExits){
            throw new Error('User already exits')
        }
        let salt = await bcrypt.genSalt();
        let hashValue = await bcrypt.hash(password,salt)

        let user = await this.create({
            name,
            email,
            password : hashValue
        });
        return user;
}
module.exports = mongoose.model("User",UserSchema);