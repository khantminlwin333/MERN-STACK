const nodemailer = require('nodemailer');
const ejs = require('ejs');

let sendEmail= async({viewFileName,data,from,to,subject})=>{
   
// Looking to send emails in production? Check out our Email API/SMTP product!
var transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });


  let dataString = await ejs.renderFile('./views/'+viewFileName+'.ejs',data);
    const info = await transport.sendMail({
        from,
        to,
        subject,
        html:dataString,
      });
 // return res.send('email already sent');
}

module.exports = sendEmail;