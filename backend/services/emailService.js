const nodemailer = require("nodemailer")

const createTransporter = async ()=>{
    return nodemailer.createTransport({
        service: "Gmail",
        host: 'smtp.gmail.email',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_PASS
            // user: 'alena.runte@ethereal.email',
            // pass: 'ymucR8mGjMh5spegjZ'
        },
    });
}

const sendResetEmail = async (to, resetToken)=>{
    const transporter = await createTransporter();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    const mailOptions = {
        from: '"Neuron Support" <neuronspaceofficial@gmail.com>',
        to: to,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
        html: `
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7fa; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #f4f7fa;">
                <tr>
                    <td align="center" valign="top">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);">
                            <tr>
                                <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);">
                                    <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Neuron</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; font-size: 24px; font-weight: bold; margin: 0 0 20px; text-align: center;">Password Reset Request</h2>
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Hello,</p>
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">We received a request to reset the password for your Neuron account. If you didn't make this request, please ignore this email.</p>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 12px 30px; border-radius: 50px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(110, 142, 251, 0.4);">Reset Your Password</a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">This password reset link will expire in 24 hours. If you need assistance, please don't hesitate to contact our support team.</p>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                                        <tr>
                                            <td>
                                                <h3 style="color: #333333; font-size: 18px; font-weight: bold; margin: 0 0 15px;">Security Tips:</h3>
                                                <ul style="color: #555555; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0;">
                                                    <li style="margin-bottom: 10px;">Create a strong, unique password for your account</li>
                                                    <li style="margin-bottom: 10px;">Enable two-factor authentication for added security</li>
                                                    <li style="margin-bottom: 10px;">Never share your password or security questions with anyone</li>
                                                </ul>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px; text-align: center; background-color: #f8fafc;">
                                    <p style="color: #888888; font-size: 14px; margin: 0 0 10px;">© 2023 Neuron. All rights reserved.</p>
                                    <p style="color: #888888; font-size: 14px; margin: 0;">
                                        <a href="#" style="color: #6e8efb; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
                                        <a href="#" style="color: #6e8efb; text-decoration: none; margin: 0 10px;">Terms of Service</a> | 
                                        <a href="#" style="color: #6e8efb; text-decoration: none; margin: 0 10px;">Support</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>`
    };
    

    const info = await transporter.sendMail(mailOptions);
    console.log('Message send: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

}

module.exports = {sendResetEmail}