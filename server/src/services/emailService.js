const ses = require('../lib/ses');
const { v4: uuidv4 } = require('uuid');

class EmailService {
  async sendConfirmationEmail(user, baseUrl) {
    const confirmToken = uuidv4();
    const confirmUrl = `${baseUrl}/confirm?email=${encodeURIComponent(user.email)}&token=${confirmToken}`;
    
    const subject = 'Please confirm your email';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Service!</h2>
        <p>Hello ${user.name || 'there'},</p>
        <p>Thank you for registering. Please confirm your email address by clicking the button below:</p>
        <p style="margin: 30px 0;">
          <a href="${confirmUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Confirm Email
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${confirmUrl}" style="color: #4CAF50; word-break: break-all;">${confirmUrl}</a></p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Thanks,<br>The Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject,
      html,
    });

    return confirmToken;
  }

  async sendPasswordResetEmail(user, tempPassword, baseUrl) {
    const subject = 'Your Password Has Been Reset';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello ${user.name || 'there'},</p>
        <p>Your password has been reset. Here's your temporary password:</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 16px; text-align: center; letter-spacing: 2px;">
          ${tempPassword}
        </div>
        <p>Please log in with this temporary password and change it immediately.</p>
        <p style="margin: 30px 0;">
          <a href="${baseUrl}/login" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Log In Now
          </a>
        </p>
        <p>If you didn't request this password reset, please contact our support team immediately.</p>
        <p>Thanks,<br>The Team</p>
      </div>
    `;

    await this.sendEmail({
      to: user.email,
      subject,
      html,
    });
  }

  async sendEmail({ to, subject, text, html }) {
    try {
      await ses.sendEmail({
        to,
        subject,
        text: text || html.replace(/<[^>]*>/g, ' '),
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      // In production, you might want to log this to a monitoring service
      throw error;
    }
  }
}

module.exports = new EmailService();
