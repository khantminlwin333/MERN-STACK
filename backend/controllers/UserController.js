const User = require('../models/User');
const createToken = require('../helpers/createToken');
const mongoose = require('mongoose');
const removeFile =require('../helpers/removeFile');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../helpers/sendEmail');

const UserController = {
    me: async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json(user);
        } catch (e) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    profile: async (req, res) => {
        try {
            let id = req.params.id;                 
                   if(!mongoose.Types.ObjectId.isValid(id)){
                       return res.status(400).json({msg: "Not a valid id"});
                   }
       
                   let userProfile = await User.findById(id);
               if(!userProfile){
                
                   return res.status(404).json({msg: "User not found"});
               }
               return res.json(userProfile)
               }
               catch(e){
                console.error("Error fetching user profile:", e);
                return res.status(500).json({msg: "Internet Server error"});
               }

    },

    editprofile : async(req,res)=>{
        try{
            let id = req.params.id;
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({msg: "Not a valid id"});
            }

        let user = await User.findById(id);
        if(!user){
            return res.status(404).json({msg: "User not found"});
        }

        const { name, email, phone, sex, birthDate, oldPassword, newPassword } = req.body;

         // ✅ Update profile fields
         if (name) user.name = name;
         if (email) user.email = email;
         if (phone) user.phone = phone;
         if (sex) user.sex = sex;
         if (birthDate) user.birthDate = birthDate;

        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Old password is incorrect" });

            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();


        if (req.file) {
            // Remove the old photo from the filesystem
            await removeFile(__dirname + "/../public" + user.photo);
        }
        
        
        return res.json(user)
        }
        catch(e){
            console.error('error',e);
            return res.status(500).json({ msg: e.message || "Internal Server Error" });
        }


    },
    login: async (req, res) => {
        try {
            let { email, password } = req.body;
            let user = await User.login(email, password);
            let token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, secure : false,  maxAge: 3 * 24 * 60 * 60 * 1000,path:'/' });
            
            return res.json({ user, token });
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
    register: async (req, res) => {
        try {
            let { name, email, password } = req.body;
            let user = await User.register(name, email, password);
            let token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, secure : false,  maxAge: 3 * 24 * 60 * 60 * 1000 , path:'/'});
            return res.json({ user, token });
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
    },
//uploading profile picture
upload: async (req, res) => {
    try {
        let id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "Not a valid id" });
        }

        // Find the user to get the current photo path before updating
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // If there is an existing photo, remove it before updating with the new one
        if (user.photo) {
            await removeFile(__dirname + "/../public" + user.photo);
        }

        // Update the user's photo with the new one
        user.photo = '/' + req.file.filename;

        // Save the updated user
        await user.save();

        return res.json(user);
    } catch (e) {
        console.error('Error updating user profile photo:', e);
        return res.status(500).json({ msg: "Internal server error" });
    }
},


// Forgot Password
forgotPassword: async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
        await user.save();

        
        

        const resetLink = `${process.env.FRONTEND_URL}/forgot-password?token=${resetToken}`;

        // Send email
        await sendEmail({
            viewFileName: "resetPassword",
                data: { name: user.name, resetLink },
                from: "server@gmail.com",
                to: user.email,
                subject: "Password Reset Request"
        })
        

        

        res.json({ message: 'Password reset link already sent to email' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    }
},

// Reset Password
resetPassword: async (req, res) => {
    try {
        const { token,newPassword } = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');    
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error' });
    }
},

deleteImg : async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        await removeFile(__dirname+"/../public"+user.photo);
        user.photo = null;
        await user.save();

        res.json({ msg: "Profile photo deleted successfully" });
    } catch (error) {
        console.log("Errors",error);
        res.status(500).json({ msg: "Error deleting profile photo" });
    }
},

    logout: (req, res) => {
        
        res.cookie('jwt', '', { maxAge: 1 });
        return res.json({ message: 'User logged out' });
    }
};

module.exports = UserController;