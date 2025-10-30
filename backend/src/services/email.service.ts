import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resend = new Resend(process.env.RESEND_API_KEY);

// Gmail SMTP transporter as fallback
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const getEmailTemplate = (firstName: string, resetCode: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #16a34a; margin: 0;">Gabay Barangay</h1>
      <p style="color: #6b7280; margin: 5px 0;">Barangay Management System</p>
    </div>
    
    <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px; border: 1px solid #bbf7d0;">
      <h2 style="color: #15803d; margin-top: 0;">Password Reset Request</h2>
      
      <p style="color: #374151; line-height: 1.6;">
        Hello ${firstName},
      </p>
      
      <p style="color: #374151; line-height: 1.6;">
        We received a request to reset your password for your Gabay Barangay account. 
        Use the code below to reset your password:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #16a34a; color: white; font-size: 32px; font-weight: bold; 
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
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #bbf7d0;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          This is an automated message from Gabay Barangay. Please do not reply to this email.
        </p>
      </div>
    </div>
  </div>
`;

export const sendPasswordResetEmail = async (email: string, resetCode: string, firstName: string) => {
  const htmlTemplate = getEmailTemplate(firstName, resetCode);
  
  // Try Resend first
  if (process.env.RESEND_API_KEY) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Gabay Barangay <onboarding@resend.dev>',
        to: [email],
        subject: 'Password Reset Code - Gabay Barangay',
        html: htmlTemplate,
      });

      if (!error) {
        return { success: true, messageId: data?.id, provider: 'resend' };
      }
      console.log('Resend failed, trying Gmail:', error);
    } catch (error) {
      console.log('Resend error, trying Gmail:', error);
    }
  }

  // Fallback to Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const result = await gmailTransporter.sendMail({
        from: `"Gabay Barangay" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Code - Gabay Barangay',
        html: htmlTemplate,
      });
      return { success: true, messageId: result.messageId, provider: 'gmail' };
    } catch (error: any) {
      console.error('Gmail SMTP error:', error);
      return { success: false, error: 'Failed to send email via Gmail' };
    }
  }

  return { success: false, error: 'No email service configured' };
};