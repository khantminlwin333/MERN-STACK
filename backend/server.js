const express = require('express');
require('dotenv').config()
const morgan = require('morgan');
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const mongoose = require('mongoose');
const cors = require('cors')
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const User = require('./models/User');
const sendEmail = require('./helpers/sendEmail');

const app = express();
app.use(express.static('public'))

app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials : true
    }
))

const mongoURL = "mongodb+srv://khantminlwin:141218kmlcmt@mern-cluster.kx9sc.mongodb.net/?retryWrites=true&w=majority&appName=MERN-cluster";

mongoose.connect(mongoURL).then(()=>{
    console.log('connected to db');

    app.listen(process.env.PORT,()=>{
        console.log('app is running on http://localhost:4000');
        

cron.schedule('*/1 * * * *', async () => {
    let user = await User.findByIdAndUpdate('67c54131be44dee1ddd76f72', {
        name : "Name "+Math.random()
   });
});
        
    });
})

app.use(express.json());
app.use(morgan('dev'))

//Post to server

app.use(cookieParser()); // Required for reading cookies

app.get('/send-email',async(req,res)=>{
    try{
        sendEmail({
            viewFileName:'test',
            data:{name:'khantminlwin'},
            from:'server@gmail.com',
            to:'client@gmail.com',
            subject:'Refactor email' 
        })
        return res.send('email already sent');
    }catch(e){
        return res.status(500).json({message:'Internal Server Error'}); 

    }
})

app.use('/api/recipes',recipeRoutes);
app.use('/api/users',userRoutes);

