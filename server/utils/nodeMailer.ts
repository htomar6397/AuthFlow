import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer';

interface MailerSendOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

// Create reusable transporter object using the default SMTP transport
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD || '',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send an email using MailerSend SMTP
 * @param {Object} options - Email options
 * @param {string|Array} options.to - Comma separated list or array of recipients
 * @param {string} options.subject - Subject line
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.html] - HTML body
 * @returns {Promise<Object>} - Result of the send operation
 */
const nodemailerSend = async ({
  to,
  subject,
  text,
  html,
}: MailerSendOptions): Promise<{
  success: boolean;
  messageId?: string;
  recipients: string[];
  response?: string;
}> => {
  try {
    if (!to) {
      throw new Error('No recipient specified');
    }

    const recipients: string[] = Array.isArray(to) ? to : to.split(',').map(email => email.trim());

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipients.join(','),
      subject: subject || 'No Subject',
      ...(text && { text }),
      ...(html && { html }),
      headers: {
        'X-Mailer': 'Node.js/Nodemailer',
        'X-Priority': '1',
        'X-MailerSend-Track-Opens': 'true',
        'X-MailerSend-Track-Clicks': 'true',
      },
    };

    const info: SentMessageInfo = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      recipients: recipients,
      response: info.response,
    };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export { nodemailerSend };
