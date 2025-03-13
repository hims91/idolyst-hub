
// In a production environment, you would use a service like Nodemailer, SendGrid, AWS SES, etc.
// This is a mock implementation for development

const sendEmail = async ({ to, subject, html, from = 'no-reply@founderplatform.com' }) => {
  if (process.env.NODE_ENV === 'production') {
    // Here you would implement the actual email sending logic
    // For example using Nodemailer or a service like SendGrid
    
    // Example implementation for SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // return sgMail.send({ to, from, subject, html });
    
    console.log(`Sending email to ${to} with subject: ${subject}`);
    return Promise.resolve();
  } else {
    // In development, just log the email
    console.log('========== MOCK EMAIL ==========');
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(html);
    console.log('===============================');
    return Promise.resolve();
  }
};

module.exports = { sendEmail };
