import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailersend.net',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USERNAME, // Your MailerSend API key
        pass: process.env.EMAIL_PASSWORD || '', // Leave empty if using API key as username
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
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
const MailerSend = async ({ to, subject, text, html }) => {
    try {
        if (!to) {
            throw new Error('No recipient specified');
        }

        // Convert to array if it's a string
        const recipients = Array.isArray(to) ? to : to.split(',').map(email => email.trim());

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: recipients.join(','),
            subject: subject || 'No Subject',
            ...(text && { text }), // Only include text if provided
            ...(html && { html }), // Only include html if provided
            // MailerSend specific headers for better deliverability
            headers: {
                'X-Mailer': 'Node.js/Nodemailer',
                'X-Priority': '1', // 1 = High, 3 = Normal, 5 = Low
                'X-MailerSend-Track-Opens': 'true',
                'X-MailerSend-Track-Clicks': 'true'
            }
        };

        const info = await transporter.sendMail(mailOptions);
        
        return {
            success: true,
            messageId: info.messageId,
            recipients: recipients,
            response: info.response
        };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

export { MailerSend };
