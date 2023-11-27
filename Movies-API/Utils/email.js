const nodemailer = require('nodemailer')


const sendEmail =async (option)=>{
    // create transporteR => service that send email
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        secure:true,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    // DEFINE EMAIL OPIONS
    const emailOptions = {
        from:'Cineflix support<support@cineflix.com>',
        to:option.email,
        subject:option.subject,
        text:option.message
    }

   transporter.sendMail(emailOptions)
}


module.exports = sendEmail