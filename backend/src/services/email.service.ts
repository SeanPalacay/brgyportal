import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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

  console.log('=== SendGrid Email Service ===');
  console.log('Attempting to send password reset email to:', email);
  console.log('SENDGRID_API_KEY configured:', !!process.env.SENDGRID_API_KEY);
  console.log('SENDGRID_FROM_EMAIL configured:', !!process.env.SENDGRID_FROM_EMAIL);

  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured!');
    return { success: false, error: 'Email service not configured. Please contact administrator.' };
  }

  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.error('SendGrid from email not configured!');
    return { success: false, error: 'Email service not configured. Please contact administrator.' };
  }

  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL, // Must be a verified sender in SendGrid
      subject: 'Password Reset Code - Gabay Barangay',
      html: htmlTemplate,
    };

    console.log('Sending email via SendGrid...');
    const response = await sgMail.send(msg);

    console.log('SendGrid email sent successfully!');
    console.log('Response status:', response[0].statusCode);

    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      provider: 'sendgrid'
    };
  } catch (error: any) {
    console.error('SendGrid error:', error);

    if (error.response) {
      console.error('SendGrid error body:', error.response.body);
      return {
        success: false,
        error: `Failed to send email: ${error.response.body.errors?.[0]?.message || 'Unknown error'}`
      };
    }

    return {
      success: false,
      error: `Failed to send email: ${error.message || 'Unknown error'}`
    };
  }
};