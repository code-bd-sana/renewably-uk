import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email connection
export async function testEmailConnection() {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("Email server connection failed:", error);
    return false;
  }
}

// Send approval email to contractor
export async function sendApprovalEmail(userEmail, userName, companyName) {
  try {
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Renewably UK",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: "Your Renewably UK Account Has Been Approved!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F47A8 0%, #1E88E5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #0F47A8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Account Approved!</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Welcome to Renewably UK Portal</p>
            </div>
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              
              <p>Great news! Your account for <strong>${companyName}</strong> has been approved by our admin team.</p>
              
              <p>You can now access the Renewably UK Portal using your registered credentials:</p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0F47A8;">
                <p style="margin: 0;"><strong>Login Email:</strong> ${userEmail}</p>
                <p style="margin: 5px 0 0;"><strong>Company:</strong> ${companyName}</p>
              </div>
              
              <div style="text-align: center; color: white;">
                <p>Sign In to Your Account with our website.</ap>
              </div>
              
              <p>Once logged in, you'll be able to:</p>
              <ul>
                <li>Generate Insurance Backed Guarantee (IBG) certificates</li>
                <li>Access your document library</li>
                <li>Manage your submissions</li>
                <li>And much more...</li>
              </ul>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>
              <strong>The Renewably UK Team</strong></p>
            </div>
            <div class="footer">
              <p>Renewably UK Ltd<br>
              Supporting Your Renewable Energy Business</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Dear ${userName},

Your account for ${companyName} has been approved by the Renewably UK admin team.

You can now log in to your account at: /login?verified=true

Login Email: ${userEmail}
Company: ${companyName}


Once logged in, you'll be able to generate Insurance Backed Guarantee (IBG) certificates, access your document library, and manage your submissions.

If you have any questions, please contact our support team.

Best regards,
The Renewably UK Team`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send approval email:", error);
    return false;
  }
}
// Send rejection  mail to contractor
export async function sendRejectEmail(userEmail, userName, companyName) {
  try {
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Renewably UK",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: "Application Status Update - Renewably UK Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status-box { background: #FFF5F5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #D32F2F; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Application Status Update</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Renewably UK Portal Registration</p>
            </div>
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              
              <div class="status-box">
                <p style="margin: 0; color: #D32F2F; font-weight: bold;">✗ APPLICATION NOT APPROVED</p>
                <p style="margin: 5px 0 0;">Your registration for <strong>${companyName}</strong> has been reviewed but cannot be approved at this time.</p>
              </div>
              
              <p>After careful review by our admin team, we regret to inform you that your application for the Renewably UK Portal has not been approved.</p>
              
              <p><strong>Application Details:</strong></p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 0;"><strong>Applicant Name:</strong> ${userName}</p>
                <p style="margin: 5px 0 0;"><strong>Company:</strong> ${companyName}</p>
                <p style="margin: 5px 0 0;"><strong>Email:</strong> ${userEmail}</p>
              </div>
              
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Your account registration has been declined</li>
                <li>You will not have access to the Renewably UK Portal</li>
                <li>You will not be able to generate Insurance Backed Guarantee (IBG) certificates</li>
              </ul>
              
              <p><strong>If you believe this decision was made in error:</strong><br>
              You may contact our support team to discuss your application or submit additional documentation for reconsideration.</p>
              
              <p>For more information or to appeal this decision, please contact our support team directly.</p>
              
              <p>We appreciate your interest in Renewably UK and thank you for your time.</p>
              
              <p>Best regards,<br>
              <strong>The Renewably UK Team</strong></p>
            </div>
            <div class="footer">
              <p>Renewably UK Ltd<br>
              Supporting Your Renewable Energy Business</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Dear ${userName},

APPLICATION STATUS UPDATE

We regret to inform you that your registration for ${companyName} has been reviewed but cannot be approved at this time.

Application Details:
- Applicant Name: ${userName}
- Company: ${companyName}
- Email: ${userEmail}

What happens next?
• Your account registration has been declined
• You will not have access to the Renewably UK Portal
• You will not be able to generate Insurance Backed Guarantee (IBG) certificates

If you believe this decision was made in error, you may contact our support team to discuss your application or submit additional documentation for reconsideration.

For more information or to appeal this decision, please contact our support team directly.

We appreciate your interest in Renewably UK and thank you for your time.

Best regards,
The Renewably UK Team`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send rejection email:", error);
    return false;
  }
}
// Send registration notification to admin
export async function sendRegistrationNotification(
  userEmail,
  userName,
  companyName,
  phoneNumber
) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Renewably UK",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: adminEmail,
      subject: "New Registration Request - Renewably UK",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0F47A8; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .info-box { background: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .button { display: inline-block; background: #0F47A8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Registration Request</h2>
            </div>
            <div class="content">
              <p>A new company has requested access to the Renewably UK Portal.</p>
              
              <div class="info-box">
                <h3>Company Details:</h3>
                <p><strong>Company:</strong> ${companyName}</p>
                <p><strong>Contact Person:</strong> ${userName}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Please review and approve this registration request in the admin dashboard.</p>

              <p>This is an automated notification from the Renewably UK Portal.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send registration notification:", error);
    return false;
  }
}
// Send password reset email to contractor
export async function sendResetPasswordEmail(userEmail, userName, resetUrl) {
  try {
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Renewably UK",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: "Reset Your Renewably UK Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F47A8 0%, #1E88E5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #0F47A8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Renewably UK Portal</p>
            </div>
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              
              <p>You recently requested to reset your password for your Renewably UK account. Click the button below to reset it.</p>
              
              <div style="text-align: center; text-color:white">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
              
              <p><strong>Important:</strong> This password reset link will expire in 1 hour.</p>
              
              <p>Best regards,<br>
              <strong>The Renewably UK Team</strong></p>
            </div>
            <div class="footer">
              <p>Renewably UK Ltd<br>
              Supporting Your Renewable Energy Business</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Dear ${userName},

You recently requested to reset your password for your Renewably UK account. 

Click the link below to reset your password:
${resetUrl}

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Important: This password reset link will expire in 1 hour.

Best regards,
The Renewably UK Team`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    return false;
  }
}

export async function sendInsuranceRequestApprovalEmail(contractorEmail, contractorName, policyNumber, adminNotes = '') {
  const mailOptions = {
    from: `"Renewably UK Admin" <${process.env.EMAIL_USER}>`,
    to: contractorEmail,
    subject: `Insurance Request Approved - Policy ${policyNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0F47A8; padding: 20px; text-align: center;">
          <img src="https://yourdomain.com/logo.png" alt="Renewably UK" style="height: 50px;">
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Request Approved ✅</h2>
          <p>Dear ${contractorName},</p>
          <p>Your request for policy <strong>${policyNumber}</strong> has been <strong>approved</strong> by the admin.</p>
          
          ${adminNotes ? `
          <div style="background-color: #fff; border-left: 4px solid #0F47A8; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Admin Notes:</strong></p>
            <p style="margin: 10px 0 0 0;">${adminNotes}</p>
          </div>
          ` : ''}
          
          <p>You can now view the updated policy details in your dashboard.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">Thank you,<br>The Renewably UK Team</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendInsuranceRequestRejectedEmail(contractorEmail, contractorName, policyNumber, adminNotes = '') {
  const mailOptions = {
    from: `"Renewably UK Admin" <${process.env.EMAIL_USER}>`,
    to: contractorEmail,
    subject: `Insurance Request Declined - Policy ${policyNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0F47A8; padding: 20px; text-align: center;">
          <img src="https://yourdomain.com/logo.png" alt="Renewably UK" style="height: 50px;">
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Request Declined ❌</h2>
          <p>Dear ${contractorName},</p>
          <p>Your request for policy <strong>${policyNumber}</strong> has been <strong>declined</strong> by the admin.</p>
          
          ${adminNotes ? `
          <div style="background-color: #fff; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Admin Notes:</strong></p>
            <p style="margin: 10px 0 0 0;">${adminNotes}</p>
          </div>
          ` : ''}
          
          <p>The policy remains unchanged. Please review the admin notes above for more details.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">Thank you,<br>The Renewably UK Team</p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

