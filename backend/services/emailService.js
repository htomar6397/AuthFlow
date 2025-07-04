import { MailerSend } from '../utils/MailerSend.js';
import { otpManager } from '../utils/otpStore.js';
 const sendOtp = async (email) => { 
    console.log(email);
  // Generate new OTP
  const otp = otpManager.generateOTP(email);
        
  // Send OTP via email
  await MailerSend({
      to: email,
      subject: 'Your Login OTP',
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your Login OTP</h2>
              <p>Your one-time password is: <strong>${otp}</strong></p>
              <p>This OTP is valid for 10 minutes.</p>
              <p>If you didn't request this, please secure your account immediately.</p>
          </div>
      `
  });
};
 const sendPass=async(email ,newPassword)=>{
    await MailerSend({
        to: email,
        subject: 'Your New Password',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset</h2>
                <p>Hello ${email || 'there'},</p>
                <p>Your password has been reset. Here's your new temporary password:</p>
                <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 16px; text-align: center; letter-spacing: 2px;">
                    ${newPassword}
                </div>
                <p><strong>For security reasons, please change this password immediately after logging in.</strong></p>
                <p>If you didn't request this password reset, please secure your account immediately and contact our support team.</p>
                <p>Thanks,<br>The ${process.env.APP_NAME || 'AuthFlow'} Team</p>
            </div>
        `
    });
 }
 const sendWelcomeEmail=async(name,email)=>{
    await MailerSend({
        to: email,
        subject: 'Welcome to AuthFlow',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to AuthFlow</h2>
                <p>Hello ${name || 'there'},</p>
                <p>Thank you for creating an account with AuthFlow. We're excited to have you on board!</p>
                <p>Here's what you can expect from AuthFlow:</p>
                <ul>
                    <li>Secure and reliable authentication</li>
                    <li>Easy-to-use interface</li>
                    <li>24/7 support</li>
                </ul>
                <p>Thanks,<br>The ${process.env.APP_NAME || 'AuthFlow'} Team</p>
            </div>
        `
    });
 }
 const sendPassChangeAlert=async(name ,email)=>{
    await MailerSend({
        to: email,
        subject: 'Your Password Changed',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Changed</h2>
                <p>Hello ${name || 'there'},</p>
                <p>Your password has been changed successfully.</p>
                <p>If you didn't request this password change, please secure your account immediately and contact our support team.</p>
                <p>Thanks,<br>The ${process.env.APP_NAME || 'AuthFlow'} Team</p>
            </div>
        `
    });
 }

export {sendOtp , sendPass , sendWelcomeEmail,sendPassChangeAlert} ;
