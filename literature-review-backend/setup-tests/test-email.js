// Test Email Configuration
// This script tests if your SMTP settings are working correctly

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

console.log('=== Email Configuration Test ===\n');

// Check if required environment variables are set
console.log('Checking environment variables...');
console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ Not set');
console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ Not set');
console.log('SMTP_USER:', process.env.SMTP_USER || '❌ Not set');
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✓ Set (hidden)' : '❌ Not set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set');
console.log('');

if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('❌ Error: SMTP_USER or SMTP_PASSWORD not set in .env file');
    process.exit(1);
}

// Create transporter
console.log('Creating email transporter...');
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

console.log('✓ Transporter created\n');

// Test connection
console.log('Testing SMTP connection...');
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ SMTP Connection Failed!');
        console.error('Error:', error.message);
        console.log('\nCommon issues:');
        console.log('1. Check if SMTP_PASSWORD has no spaces (remove all spaces from App Password)');
        console.log('2. Verify you created a Gmail App Password (not regular password)');
        console.log('3. Ensure 2-Step Verification is enabled on your Google Account');
        console.log('4. Check if SMTP_USER is your correct Gmail address');
        process.exit(1);
    } else {
        console.log('✓ SMTP Connection Successful!\n');

        // Send test email
        console.log('Sending test email...');
        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to: "sahabidyut999@gmial.com",             //process.env.SMTP_USER, // Send to yourself for testing
            subject: 'Test Email - Literature Review System',
            text: 'This is a test email from your Literature Review System.\n\nIf you received this, your email configuration is working correctly! ✓',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #4CAF50;">✓ Email Configuration Test</h2>
          <p>This is a test email from your <strong>Literature Review System</strong>.</p>
          <p>If you received this, your email configuration is working correctly!</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            <strong>Configuration Details:</strong><br>
            SMTP Host: ${process.env.SMTP_HOST}<br>
            SMTP Port: ${process.env.SMTP_PORT}<br>
            From: ${process.env.EMAIL_FROM || process.env.SMTP_USER}
          </p>
        </div>
      `,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error('❌ Failed to send test email');
                console.error('Error:', error.message);
                process.exit(1);
            } else {
                console.log('✓ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
                console.log('\n=== Email Test Complete ===');
                console.log('✓ SMTP connection works');
                console.log('✓ Test email sent');
                console.log(`✓ Check your inbox: ${process.env.SMTP_USER}`);
                console.log('\nYour email configuration is working correctly! 🎉');
            }
        });
    }
});
