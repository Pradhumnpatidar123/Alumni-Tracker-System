import nodemailer from 'nodemailer';
const mailer=function(email,callback) {
    const transport=nodemailer.createTransport({
        service:'gmail',
        auth:{
          user:'pradhumnpatidar156@gmail.com',
            pass:'ohqx egsb weje huta'
        } 
    })
    const mailOption={
        from:'pradhumnpatidar156@gmail.com',
         to:email,
         subject:'Hello alumni , Its verification mail ',
        html:`Hello ${email} , This is Verification mail of Alumni Tracker System. please Click on th below link of verify yourself.<br>
        // <form action='http://localhost:/verifyEmail?email=${email}' method='get'>
        // <input type="hidden" name="email" value="${email}" id="email">
        // <button>Click here To Verify</button>
        // </from>
        <a href='http://localhost:3000/verifyEmail?email=${email}'>Click here To Verify</a>
        `
    }
    transport.sendMail(mailOption,(error,info)=>{
        if (error) {
            console.log("error while sending mail from mailer : ",error);
            callback(false)
        }else{
            console.log("Mail from mailer Send Successfully");
            callback(info)
        }
    })
}
export default {mailer:mailer}