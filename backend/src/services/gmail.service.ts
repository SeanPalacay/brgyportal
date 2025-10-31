import nodemailer from 'nodemailer';

// Gmail SMTP configuration (alternative to Resend)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not regular password)
  }
});

export const sendPasswordResetEmailGmail = async (email: string, resetCode: string, firstName: string) => {
  try {
    console.log('Attempting to send email via Gmail SMTP');
    console.log('Gmail user:', process.env.GMAIL_USER);
    console.log('Recipient:', email);
    
    const mailOptions = {
      from: `"TheyCarE Portal" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Code - TheyCarE Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">TheyCarE Portal</h1>
            <p style="color: #6b7280; margin: 5px 0;">Barangay Management System</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
            
            <p style="color: #374151; line-height: 1.6;">
              Hello ${firstName},
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              We received a request to reset your password for your TheyCarE Portal account. 
              Use the code below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #2563eb; color: white; font-size: 32px; font-weight: bold; 
                          padding: 20px; border-radius: 8px; letter-spacing: 8px; display: inline-block;">
                ${resetCode}
              </div>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              This code will expire in <strong>15 minutes</strong> for security reasons.
            </p>
            
            <p style="color: #374151; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email. 
              Your password will remain unchanged.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This is an automated message from TheyCarE Portal. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Gmail:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Gmail service error:', error);
    return { success: false, error: `Gmail service unavailable: ${error.message || 'Unknown error'}` };
  }
};