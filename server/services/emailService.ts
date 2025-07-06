import { nodemailerSend } from '../utils/nodeMailer.js';
import { otpManager } from '../utils/otpStore.js';
const emailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6cf7; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .header h1 { color: #fff; margin: 0; }
        .content { padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0; border-top: none; }
        .otp-box { 
            background-color: #f8f9fa; 
            color: #4a6cf7; 
            font-size: 24px; 
            font-weight: bold; 
            letter-spacing: 5px; 
            padding: 15px 20px; 
            text-align: center; 
            margin: 25px 0; 
            border-radius: 4px;
            display: inline-block;
        }
        .button {
            background-color: #4a6cf7;
            color: white !important;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
            margin: 10px 0;
            font-weight: 500;
        }
        .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e0e0e0; 
            font-size: 12px; 
            color: #666; 
            text-align: center;
        }
        .text-center { text-align: center; }
        .mt-3 { margin-top: 15px; }
        .mb-3 { margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${process.env.APP_NAME || 'AuthFlow'}</h1>
        </div>
        <div class="content">
            ${content}
            <div class="footer">
                <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'AuthFlow'}. All rights reserved.</p>
                <p>Developed by <a href="mailto:htomar6397@gmail.com" style="color: #4a6cf7; text-decoration: none;">Mayank Tomar</a></p>
            </div>
        </div>
    </div>
</body>
</html>
`;

const sendOtp = async (email: string): Promise<void> => {
  // Generate new OTP
  const otp = otpManager.generateOTP(email);
  const expirationMinutes = 10;

  const emailContent = `
    <h2 style="color: #2c3e50; margin-top: 0;">Your Login Verification Code</h2>
    <p>Hello,</p>
    <p>Your one-time verification code is:</p>
    <div class="otp-box">${otp}</div>
    <p class="mb-3">This code will expire in ${expirationMinutes} minutes.</p>
    <p>If you didn't request this code, please secure your account immediately by changing your password.</p>
    <p class="mt-3">Best regards,<br>${process.env.APP_NAME || 'AuthFlow'} Team</p>
  `;

  await nodemailerSend({
    to: email,
    subject: `Your ${process.env.APP_NAME || 'AuthFlow'} Verification Code`,
    text: `Your verification code is: ${otp}\nThis code will expire in ${expirationMinutes} minutes.`,
    html: emailTemplate(emailContent, 'Verification Code')
  });
};
const sendPass = async (email: string, newPassword: string): Promise<void> => {
  const emailContent = `
    <h2 style="color: #2c3e50; margin-top: 0;">Your New Password</h2>
    <p>Hello ${email || 'there'},</p>
    <p>As requested, we've generated a new password for your account. Here are your login details:</p>
    
    <div style="background-color: #f8f9fa; border-left: 4px solid #4a6cf7; padding: 12px 20px; margin: 20px 0;">
        <strong>New Password:</strong>
        <div class="otp-box">${newPassword}</div>
    </div>
    
    <p><strong>Important Security Notice:</strong> For your protection, please change this password immediately after logging in.</p>
    
    <p style="color: #e74c3c;">
        <strong>⚠️ Security Alert:</strong> If you didn't request this password reset, please secure your account immediately 
        by changing your password and contact our support team.
    </p>
    
    <p class="mt-3">Best regards,<br>${process.env.APP_NAME || 'AuthFlow'} Team</p>
  `;

  await nodemailerSend({
    to: email,
    subject: `Your New ${process.env.APP_NAME || 'AuthFlow'} Password`,
    html: emailTemplate(emailContent, 'Password Reset')
  });
};

const sendWelcomeEmail = async (name: string, email: string): Promise<void> => {
  const emailContent = `
    <div class="text-center">
        <h2 style="color: #2c3e50; margin-top: 0;">Welcome to ${process.env.APP_NAME || 'AuthFlow'}!</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Thank you for creating an account with ${process.env.APP_NAME || 'AuthFlow'}. We're thrilled to have you on board!</p>
        
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #4a6cf7;">Getting Started</h3>
            <ul style="text-align: left; padding-left: 20px;">
                <li style="margin-bottom: 10px;">
                    <strong>Secure Authentication:</strong> Your account is protected with industry-standard security measures
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>Easy Access:</strong> Login from anywhere, anytime
                </li>
                <li style="margin-bottom: 10px;">
                    <strong>24/7 Support:</strong> We're here to help whenever you need us
                </li>
            </ul>
        </div>
        
        <a href="${process.env.FRONTEND_URL || '#'}" class="button" style="background-color: #4a6cf7;">
            Get Started
        </a>
        
        <p class="mt-3">If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>${process.env.APP_NAME || 'AuthFlow'} Team</p>
    </div>
  `;

  await nodemailerSend({
    to: email,
    subject: `Welcome to ${process.env.APP_NAME || 'AuthFlow'}!`,
    html: emailTemplate(emailContent, 'Welcome to ' + (process.env.APP_NAME || 'AuthFlow'))
  });
};

const sendPassChangeAlert = async (name: string, email: string): Promise<void> => {
  const emailContent = `
    <h2 style="color: #2c3e50; margin-top: 0;">Password Successfully Updated</h2>
    <p>Hello ${name || 'there'},</p>
    
    <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 12px 20px; margin: 20px 0;">
        <p style="margin: 0; color: #2e7d32;">
            ✅ Your password has been successfully updated on ${new Date().toLocaleString()}.
        </p>
    </div>
    
    <p>For security reasons, we recommend that you:</p>
    <ul>
        <li>Use a strong, unique password that you don't use elsewhere</li>
        <li>Enable two-factor authentication if available</li>
        <li>Regularly update your password</li>
    </ul>
    
    <p style="color: #e74c3c; font-weight: 500;">
        ⚠️ <strong>Security Alert:</strong> If you didn't make this change, please secure your account immediately 
        by resetting your password and contact our support team.
    </p>
    
    <p class="mt-3">Best regards,<br>${process.env.APP_NAME || 'AuthFlow'} Security Team</p>
  `;

  await nodemailerSend({
    to: email,
    subject: `Your ${process.env.APP_NAME || 'AuthFlow'} Password Was Changed`,
    html: emailTemplate(emailContent, 'Password Changed')
  });
};

export { sendOtp, sendPass, sendWelcomeEmail, sendPassChangeAlert };
