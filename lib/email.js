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
// Send Welcome & Pending registration email to contractor
export async function sendWelcomePendingEmail(
  userEmail,
  userName,
  companyName,
) {
  try {
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Renewably UK",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: "Welcome to Renewably UK – Your Account is Under Review",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Renewably UK</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F47A8 0%, #1E88E5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status-box { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0F47A8; }
            .button { display: inline-block; background: #0F47A8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Welcome to Renewably UK!</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Thank you for registering.</p>
            </div>
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              
              <p>Thank you for registering for access to the <strong>Renewably UK</strong> Platform.</p>
              <p>We have successfully received your application, and it is currently pending review by our compliance and onboarding team. This review process ensures that all platform users meet the required eligibility, regulatory, and quality standards associated with working within the Renewably UK ecosystem.</p>
              
              <div class="status-box">
                <p style="margin: 0; font-weight: bold;">Your account is currently under review</p>
              </div>
              
              <p><strong>What Happens Next? </strong></p>
              <p>Our team will now:</p>
              <ul>
                <li>Review your submitted company and contact information </li>
                <li>Verify your eligibility and relevant credentials </li>
                <li>Assess alignment with platform access requirements </li>
                <li>Confirm any applicable compliance documentation </li>
              </ul>
              
              <p>If any additional information is required to support your application, a member of our team will contact you directly. </p>
              
              <p style="margin: 12px 0 6px; font-weight: 700; font-size: 14px; color: #0F172A;">Estimated Review Time</p>
              <p>Applications are typically reviewed within 2 business days. You will receive a confirmation email once your access has been approved and activated. </p>

              <p style="margin: 12px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Need Assistance? </p>
              <p>If you have any questions regarding your registration or would like to provide further supporting documentation, please contact us at:</p>
              
              <p style="margin: 12px 0 6px;">
                <strong>Email:</strong> <a href="mailto:support@renewably.energy" style="color:#0F47A8; text-decoration:none;">support@renewably.energy</a><br>
                <strong>Telephone:</strong> <a href="tel:+441615243512" style="color:#0F47A8; text-decoration:none;">+44 161 524 3512</a>
              </p>
              
              <p>We appreciate your interest in joining the Renewably UK Platform and look forward to supporting you.</p>

              <p>Kind regards,<br>
                <strong>The Renewably UK Team</strong><br>
                <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a>
              </p>

            </div>
            <div class="footer">
              <p>Renewably UK Ltd<br>Supporting Your Renewable Energy Business</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Dear ${userName},

Thank you for registering for access to the Renewably UK Platform. 
We have successfully received your application, and it is currently pending review by our compliance and onboarding team. This review process ensures that all platform users meet the required eligibility, regulatory, and quality standards associated with working within the Renewably UK ecosystem. 
What Happens Next? 
Our team will now: 
• Review your submitted company and contact information 
• Verify your eligibility and relevant credentials 
• Assess alignment with platform access requirements 
• Confirm any applicable compliance documentation 
If any additional information is required to support your application, a member of our team will contact you directly. 
Estimated Review Time 
Applications are typically reviewed within 2 business days. You will receive a confirmation email once your access has been approved and activated. 

Need Assistance? 
If you have any questions regarding your registration or would like to provide further supporting documentation, please contact us at: 

Email: support@renewably.energy 
Telephone: +44 161 524 3512 

We appreciate your interest in joining the Renewably UK Platform and look forward to supporting you. 

Kind regards, 
The Renewably UK Team 
https://renewably.energy 
`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send welcome/pending email:", error);
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
      subject: "Your Renewably UK Platform Access Has Been Approved",
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
              <p>Dear <strong>${companyName}</strong>,</p>
              
              <p>We are pleased to inform you that your application to access the Renewably UK Platform has been successfully reviewed and approved.</p>
              
              <p>Your account is now active, and you can log in using the credentials you created during registration. </p>

              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0F47A8;">
                <p><strong>Access the Platform:</strong></p>
                <a href="https://renewably.energy/login" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy/login</a>  
                <p style="margin: 0;"><strong>Login Email:</strong> ${userEmail}</p>
              </div>
              
              
              <p style="font-size: 20px;"><strong>Next Steps:</strong></p>
              <p>To ensure continued compliance and full platform functionality, please upload the following documentation to your account at your earliest convenience. </p>
              <p style="font-size: 15px;"><strong>Required Accreditation Certification </strong></p> 
              <ul>
                <li>Valid PAS accreditation certificate (e.g. PAS 2030 / PAS 2035 where applicable)</li>
                <li>Valid MCS certification (if applicable to your scope of works) </li>
              </ul>
              <p style="font-size: 15px;"><strong>Required Insurance Documentation</strong></p> 
              <ul>
                <li>Professional Indemnity Insurance</li>
                <li>Public Liability Insurance </li>
                <li>Employers’ Liability Insurance </li>
              </ul>
              <p>Please ensure you include a copy of the <strong>key facts</strong> or <strong>what you told us</strong> document.</p>

              <p style="font-size: 15px;"><strong>Upload Your Documentation</strong></p>  
              <p>Please use the secure upload link below to submit all required certification and insurance documentation: </p>

              <p style="font-size: 15px;"><strong>Upload Portal:</strong> <span style="font-size: 13px;"> https://renewably-group.uk/onboarding</span></p>  

              <p>Please ensure that all certificates and insurance documents are: </p>
              <ul>
                <li>In date and clearly legible </li>
                <li>Issued in the legal name of your organisation </li>
                <li>Reflective of adequate indemnity limits in line with industry requirements </li>
              </ul>

              <p>Our FCA approved partners Bluedrop Services (NW) Ltd will review the insurance documentation once submitted. Access to certain platform features or project submissions may remain conditional until verification has been completed. </p>

              <p style="font-size: 15px;"><strong>Ongoing Compliance </strong></p> 
              <p>All activity undertaken via the Renewably UK Platform must align with applicable regulatory, technical, and quality assurance standards. Should your organisation’s accreditation or insurance status change, you are required to upload updated documentation promptly.</p>

              <p style="font-size: 15px;"><strong>Need Support? </strong></p> 
              <p>If you require assistance uploading documentation or navigating the platform, our team is available to support you:</p>
              
              <p style="margin: 12px 0 6px;">
                <strong>Email:</strong> <a href="mailto:support@renewably.energy" style="color:#0F47A8; text-decoration:none;">support@renewably.energy</a><br>
                <strong>Telephone:</strong> <a href="tel:+441615243512" style="color:#0F47A8; text-decoration:none;">+44 161 524 3512</a>
              </p>
              
              <p>We look forward to working with you and supporting your success on the Renewably UK Platform.</p>

              <p>Best regards,<br>
              <strong>The Renewably UK Team</strong><br>
              <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a></p>
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
      text: `Dear ${companyName},

We are pleased to inform you that your application to access the Renewably UK Platform has been successfully reviewed and approved.

Your account is now active, and you can log in using the credentials you created during registration.

Access the Platform
You can log in here: https://renewably.energy/login

Login Email: ${userEmail}

Next Steps
To ensure continued compliance and full platform functionality, please upload the following documentation to your account at your earliest convenience.

Required Accreditation Certification
• Valid PAS accreditation certificate (e.g. PAS 2030 / PAS 2035 where applicable)
• Valid MCS certification (if applicable to your scope of works)

Required Insurance Documentation
• Professional Indemnity Insurance
• Public Liability Insurance
• Employers' Liability Insurance

Please ensure you include a copy of the 'key facts' or 'what you told us' document.

Upload Your Documentation
Please use the secure upload portal to submit all required certification and insurance documentation.
Please ensure that all certificates and insurance documents are:
• In date and clearly legible
• Issued in the legal name of your organisation
• Reflective of adequate indemnity limits in line with industry requirements

Our FCA approved partners Bluedrop Services (NW) Ltd will review the insurance documentation once submitted. Access to certain platform features or project submissions may remain conditional until verification has been completed.

Ongoing Compliance
All activity undertaken via the Renewably UK Platform must align with applicable regulatory, technical, and quality assurance standards. Should your organisation's accreditation or insurance status change, you are required to upload updated documentation promptly.

Need Support?
If you require assistance uploading documentation or navigating the platform, our team is available to support you:

Email: support@renewably.energy
Telephone: +44 161 524 3512

We look forward to working with you and supporting your success on the Renewably UK Platform.

Kind regards,
The Renewably UK Team
https://renewably.energy`,
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
      subject: "Update on Your Renewably UK Platform Application",
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
              <p>Dear <strong>${companyName}</strong>,</p>
              
              <p>Thank you for your recent application to access the Renewably UK Platform at <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a>.</p>
              
              <p>Following a review of the information provided, we regret to inform you that your application has not been approved at this time.</p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Reason for Decision</p>
              <p>As part of our onboarding and compliance framework, all platform users must meet the required technical, accreditation, and insurance standards to ensure regulatory alignment and quality assurance across the Renewably UK ecosystem.</p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">What Happens Next</p>
              <p>Depending on the reason outlined above, you may:</p>
              <ul>
                <li>Submit updated or additional documentation for reassessment</li>
                <li>Provide clarification on accreditation or insurance coverage</li>
                <li>Reapply once the required criteria have been satisfied</li>
              </ul>
              
              <p>If you believe this decision has been made in error or you would like further clarification, please contact our compliance team.</p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Re-Submission / Supporting Documentation</p>
              <p>If applicable, updated documentation can be submitted via:</p>
              
              <p style="margin: 12px 0 6px;">
                <strong>Email:</strong> <a href="mailto:support@renewably.energy" style="color:#0F47A8; text-decoration:none;">support@renewably.energy</a>
              </p>
              
              <p>Please ensure that any resubmitted documents are valid, clearly legible, and issued in the legal name of your organisation.</p>
              
              <p>We appreciate the time taken to apply and thank you for your interest in joining the Renewably UK Platform.</p>
              
              <p>Should you meet the required criteria in the future, we would welcome a new application.</p>
              
              <p>Kind regards,<br>
              <strong>The Renewably UK Team</strong><br>
              <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a></p>
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
      text: `Dear ${companyName},

Thank you for your recent application to access the Renewably UK Platform at https://renewably.energy.

Following a review of the information provided, we regret to inform you that your application has not been approved at this time.

Reason for Decision
As part of our onboarding and compliance framework, all platform users must meet the required technical, accreditation, and insurance standards to ensure regulatory alignment and quality assurance across the Renewably UK ecosystem.

What Happens Next
Depending on the reason outlined above, you may:
• Submit updated or additional documentation for reassessment
• Provide clarification on accreditation or insurance coverage
• Reapply once the required criteria have been satisfied

If you believe this decision has been made in error or you would like further clarification, please contact our compliance team.

Re-Submission / Supporting Documentation
If applicable, updated documentation can be submitted via:
Email: support@renewably.energy

Please ensure that any resubmitted documents are valid, clearly legible, and issued in the legal name of your organisation.

We appreciate the time taken to apply and thank you for your interest in joining the Renewably UK Platform.

Should you meet the required criteria in the future, we would welcome a new application.

Kind regards,
The Renewably UK Team
https://renewably.energy`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send rejection email:", error);
    return false;
  }
}
// Send registration notification to ADMIN
export async function sendRegistrationNotification(
  userEmail,
  userName,
  companyName,
  phoneNumber,
  requestedRoles = [],
  companyAddress,
) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Renewably UK",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: adminEmail,
      subject: "New Platform Signup – Action Required (Renewably UK)",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F47A8 0%, #1E88E5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .info-box { background: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .button { display: inline-block; background: #0F47A8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">New Platform Signup</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Renewably UK Portal</p>
            </div>
            <div class="content">
              <p>Dear Renewably UK Team, </p>
              <p>A new customer has completed the signup form via the Renewably UK Platform. 
              Please review the registration details below and proceed with the appropriate onboarding and compliance checks.</p>
              
              <div class="info-box">
                <h3>Applicant Details:</h3>
                <p><strong> Company Name:</strong> ${companyName}</p>
                 <p><strong>Contact Person:</strong> ${userName}</p>
                <p><strong>Email Address:</strong> ${userEmail}</p>
                <p><strong>Telephone Number:</strong> ${phoneNumber}</p>
                <p><strong>Registered Address:</strong> ${companyAddress}</p>
                ${
                  requestedRoles.length > 0
                    ? `<p><strong>Business Type / Role Selected:</strong> ${requestedRoles.join(", ")}</p>`
                    : ""
                }          
                <p><strong>Date & Time of Registration:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <p><strong>Next Actions Required:</strong></p>
              <p>Please:</p>
              <ul>
                <li>Review submitted information for completeness</li>
                <li>Enter information within HubSpot CRM </li>
                <li>Select User Type</li>
              </ul>
               <p style="margin: 0 0 8px; color: #334155;">Applicant access remains pending until manual review has been completed.</p>
                <p style="margin: 8px 0 6px; font-weight: 700; color: #0F172A;">Admin Portal Access</p>

                <p>To review this application, open the admin dashboard:</p>

                <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a>

                <p>If additional documentation is required from the applicant, please request this via the platform or direct email communication.</p>

                <p>Kind regards,<br>
                  <strong>Renewably UK Platform System Notification</strong><br>
                  <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a>
                </p>
            </div>
            <div class="footer">
              <p>Renewably UK Ltd<br>Supporting Your Renewable Energy Business</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
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
      subject: "Password Reset Request – Renewably UK Platform",
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
              <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Renewably UK Platform</p>
            </div>
            <div class="content">
              <p>Dear <strong>${userName}</strong>,</p>
              
              <p>We have received a request to reset the password associated with your Renewably UK Platform account at <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a>.</p>
              
              <p>If you initiated this request, please follow the instructions below.</p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Password Reset Link</p>
              <p>To create a new password, please click the secure link below:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button" style="color: white;">Reset Your Password</a>
              </div>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Security Notice</p>
              <p>If you did not request a password reset, please disregard this email. No changes will be made to your account unless the link above is used.</p>
              
              <p>If you are concerned about unauthorised access, please contact our support team immediately.</p>
              
              <p><strong>Renewably UK will never ask you to share your password via email or telephone.</strong></p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Need Assistance?</p>
              <p>If you experience any issues resetting your password or accessing your account, please contact:</p>
              
              <p style="margin: 12px 0 6px;">
                <strong>Email:</strong> <a href="mailto:support@renewably.energy" style="color:#0F47A8; text-decoration:none;">support@renewably.energy</a><br>
                <strong>Telephone:</strong> <a href="tel:+441615243512" style="color:#0F47A8; text-decoration:none;">+44 161 524 3512</a>
              </p>
              
              <p>Kind regards,<br>
              <strong>The Renewably UK Team</strong><br>
              <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a></p>
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

We have received a request to reset the password associated with your Renewably UK Platform account at https://renewably.energy.

If you initiated this request, please follow the instructions below.

Password Reset Link
To create a new password, please click the secure link below:
${resetUrl}

Security Notice
If you did not request a password reset, please disregard this email. No changes will be made to your account unless the link above is used.

If you are concerned about unauthorised access, please contact our support team immediately.

Renewably UK will never ask you to share your password via email or telephone.

Need Assistance?
If you experience any issues resetting your password or accessing your account, please contact:

Email: support@renewably.energy
Telephone: +44 161 524 3512

Kind regards,
The Renewably UK Team
https://renewably.energy`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    return false;
  }
}
// Send insurance request approval email to contractor
export async function sendInsuranceRequestApprovalEmail(
  contractorEmail,
  contractorName,
  policyNumber,
  adminNotes = "",
) {
  const mailOptions = {
    from: {
      name: process.env.EMAIL_FROM_NAME || "Renewably UK",
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    },
    to: contractorEmail,
    subject: `Insurance Backed Guarantee Update Approved \u2013 Renewably UK Platform`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IBG Update Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0F47A8 0%, #1E88E5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">IBG Update Approved</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Insurance Backed Guarantee</p>
          </div>
          <div class="content">
            <p>Dear <strong>${contractorName}</strong>,</p>
            
            <p>We are writing to confirm that your recent request submitted via the Renewably UK Platform to update an Insurance Backed Guarantee (IBG) has been reviewed and approved by our FCA approved partners Bluedrop Services (NW) Ltd.</p>
            
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Update Confirmation</p>
            <p>The requested amendments to the following Insurance Backed Guarantee have now been authorised and processed:</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0F47A8;">
              <p style="margin: 0;"><strong>Policy Number:</strong> ${policyNumber}</p>
              ${adminNotes ? `<p style="margin: 5px 0 0;"><strong>Notes:</strong> ${adminNotes}</p>` : ""}
            </div>
            
            <p>The updated IBG record is now reflected within your platform account.</p>
            
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Accessing the Updated IBG</p>
            <p>You can log in to your account at:</p>
            <p><a href="https://renewably.energy/login" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">https://renewably.energy/login</a></p>
            
            <p>Navigate to the relevant project or IBG section within your dashboard to view and download the updated documentation.</p>
            
            <p>If revised policy documents or confirmation certificates have been issued as part of this amendment, they will be available within the platform.</p>
            
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Important Reminder</p>
            <p>Please ensure that all project data and supporting documentation associated with Insurance Backed Guarantees remain accurate and up to date. Any further amendments must be submitted through the platform and will be subject to review and approval.</p>
            
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Need Assistance?</p>
            <p>If you have any questions regarding this update or require further clarification, please contact our support team:</p>
            
            <p style="margin: 12px 0 6px;">
              <strong>Email:</strong> <a href="mailto:support@renewably.energy" style="color:#0F47A8; text-decoration:none;">support@renewably.energy</a><br>
              <strong>Telephone:</strong> <a href="tel:+441615243512" style="color:#0F47A8; text-decoration:none;">+44 161 524 3512</a>
            </p>
            
            <p>Thank you for continuing to use the Renewably UK Platform.</p>
            
            <p>Kind regards,<br>
            <strong>The Renewably UK Team</strong><br>
            <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a></p>
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
  };

  await transporter.sendMail(mailOptions);
}
// Send insurance request rejection email to contractor
export async function sendInsuranceRequestRejectedEmail(
  contractorEmail,
  contractorName,
  policyNumber,
  adminNotes = "",
) {
  const mailOptions = {
    from: {
      name: process.env.EMAIL_FROM_NAME || "Renewably UK",
      address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    },
    to: contractorEmail,
    subject: `Insurance Backed Guarantee Amendment Request \u2013 Update Not Approved`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IBG Amendment Not Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">IBG Amendment Not Approved</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Insurance Backed Guarantee</p>
          </div>
          <div class="content">
            <p>Dear <strong>${contractorName}</strong>,</p>
            
            <p>Thank you for your recent request submitted via the Renewably UK Platform to amend an existing Insurance Backed Guarantee (IBG).</p>
            
            <p>Following review by FCA approved partners Bluedrop Services (NW) Ltd, we regret to inform you that the requested amendment has not been approved at this time.</p>
            
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Amendment Request Details</p>
            
            <div style="background: #FFF5F5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #D32F2F;">
              <p style="margin: 0;"><strong>Policy Number:</strong> ${policyNumber}</p>
            </div>
            
            ${
              adminNotes
                ? `
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Reason for Rejection</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 0;">${adminNotes}</p>
            </div>
            `
                : `
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Reason for Rejection</p>
            <p>e.g. insufficient supporting documentation, amendment outside policy terms, material change requiring new IBG issuance, non-compliance with underwriting criteria, etc.</p>
            `
            }
            
            <p>Insurance Backed Guarantees are subject to underwriting conditions and scheme rules. Amendments must meet the applicable eligibility, evidential, and policy requirements before approval can be granted.</p>
            
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">What Happens Next</p>
            <p>Depending on the reason outlined above, you may:</p>
            <ul>
              <li>Submit additional supporting documentation for reassessment</li>
              <li>Amend and resubmit the request with corrected information</li>
              <li>Submit a new IBG application (if the change constitutes a material alteration)</li>
            </ul>
            
            <p>Any revised submission must be made via your account on:</p>
            <p><a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">https://renewably.energy</a></p>
            
            <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Need Assistance?</p>
            <p>If you require clarification regarding this decision or guidance on next steps, please contact our support team:</p>
            
            <p style="margin: 12px 0 6px;">
              <strong>Email:</strong> <a href="mailto:support@renewably.energy" style="color:#0F47A8; text-decoration:none;">support@renewably.energy</a><br>
              <strong>Telephone:</strong> <a href="tel:+441615243512" style="color:#0F47A8; text-decoration:none;">+44 161 524 3512</a>
            </p>
            
            <p>We appreciate your cooperation in maintaining compliance and accuracy across all Insurance Backed Guarantee records.</p>
            
            <p>Kind regards,<br>
            <strong>The Renewably UK Team</strong><br>
            <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a></p>
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
  };

  await transporter.sendMail(mailOptions);
}
// Send email of certificate's pdf to policy holder
export async function sendCertificateEmail(
  toEmail,
  policyHolderName,
  contractorName,
  policyNumber,
  pdfAttachments, // Array of {filename, content, contentType}
  totalProducts,
) {
  try {
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Renewably UK",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: toEmail,
      subject: `Your Insurance Backed Guarantee Certificate \u2013 Policy Confirmation`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Insurance Backed Guarantee Certificate</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0F47A8 0%, #1E88E5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .info-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0F47A8; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Your Insurance Backed Guarantee Certificate</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Policy Confirmation</p>
            </div>
            <div class="content">
              <p>Dear <strong>${policyHolderName}</strong>,</p>
              
              <p>We are writing to confirm that an Insurance Backed Guarantee (IBG) has been issued in your name.</p>
              
              <p>This guarantee has been created by a Bluedrop Services (NW) Ltd approved Contractor in relation to works carried out at the property detailed below.</p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Policy Details</p>
              <div class="info-box">
                <p style="margin: 0;"><strong>Policy Holder:</strong> ${policyHolderName}</p>
                <p style="margin: 5px 0 0;"><strong>Contractor Name:</strong> ${contractorName}</p>
                <p style="margin: 5px 0 0;"><strong>Policy Number:</strong> ${policyNumber}</p>
                <p style="margin: 5px 0 0;"><strong>Issue Date:</strong> ${new Date().toLocaleDateString("en-GB")}</p>
                <p style="margin: 5px 0 0;"><strong>Total Certificates:</strong> ${totalProducts}</p>
              </div>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Why You Are Receiving This Email</p>
              <p>A Bluedrop Services (NW) Ltd approved Contractor has submitted and successfully registered an Insurance Backed Guarantee in your name via the hosted Renewably UK Platform.</p>
              
              <p>This policy provides protection in accordance with the terms and conditions set out within the attached documentation. The Insurance Backed Guarantee is designed to provide cover in the event that the original installing contractor ceases trading and is unable to honour their workmanship guarantee, subject to policy terms.</p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Attached Documents</p>
              <p>Please find attached:</p>
              <ul>
                <li>Your Insurance Backed Guarantee Certificate (PDF)</li>
                <li>Policy Terms and Conditions (PDF)</li>
                <li>Any applicable supporting documentation</li>
              </ul>
              
              <p>We recommend that you retain these documents in a safe place, as they form part of your official policy record.</p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Important Information</p>
              <p>Please review the certificate carefully to ensure all details are correct, including your name, installation address, and scope of works covered.</p>
              
              <p>If you believe any information is incorrect, please contact us within 30 days of receipt so that we can investigate.</p>
              
              <p style="margin: 20px 0 6px; font-weight: 700; font-size: 15px; color: #0F172A;">Need Assistance?</p>
              <p>If you have any questions regarding your Insurance Backed Guarantee, policy coverage, or claims process, please contact Bluedrop Services (NW) Ltd:</p>
              
              <p style="margin: 12px 0 6px;">
                <strong>Email:</strong> <a href="mailto:claims@bluedropservices.co.uk" style="color:#0F47A8; text-decoration:none;">claims@bluedropservices.co.uk</a><br>
                <strong>Telephone:</strong> <a href="tel:01706658587" style="color:#0F47A8; text-decoration:none;">01706 658587</a>
              </p>
              
              <p>Kind regards,<br>
              <strong>The Renewably UK Team</strong><br>
              <a href="https://renewably.energy" target="_blank" rel="noopener noreferrer" style="color:#0F47A8; text-decoration:none;">renewably.energy</a></p>
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
      text: `Dear ${policyHolderName},

We are writing to confirm that an Insurance Backed Guarantee (IBG) has been issued in your name.

This guarantee has been created by a Bluedrop Services (NW) Ltd approved Contractor in relation to works carried out at the property detailed below.

Policy Details
• Policy Holder: ${policyHolderName}
• Contractor Name: ${contractorName}
• Policy Number: ${policyNumber}
• Issue Date: ${new Date().toLocaleDateString("en-GB")}
• Total Certificates: ${totalProducts}

Why You Are Receiving This Email
A Bluedrop Services (NW) Ltd approved Contractor has submitted and successfully registered an Insurance Backed Guarantee in your name via the hosted Renewably UK Platform.

This policy provides protection in accordance with the terms and conditions set out within the attached documentation. The Insurance Backed Guarantee is designed to provide cover in the event that the original installing contractor ceases trading and is unable to honour their workmanship guarantee, subject to policy terms.

Attached Documents
Please find attached:
• Your Insurance Backed Guarantee Certificate (PDF)
• Policy Terms and Conditions (PDF)
• Any applicable supporting documentation

We recommend that you retain these documents in a safe place, as they form part of your official policy record.

Important Information
Please review the certificate carefully to ensure all details are correct, including your name, installation address, and scope of works covered.

If you believe any information is incorrect, please contact us within 30 days of receipt so that we can investigate.

Need Assistance?
If you have any questions regarding your Insurance Backed Guarantee, policy coverage, or claims process, please contact Bluedrop Services (NW) Ltd:

Email: claims@bluedropservices.co.uk
Telephone: 01706 658587

Kind regards,
The Renewably UK Team
https://renewably.energy`,
      attachments: Array.isArray(pdfAttachments)
        ? pdfAttachments.map((att) => ({
            filename: att.filename,
            content: att.content,
            contentType: att.contentType || "application/pdf",
          }))
        : [
            {
              filename: "Certificate.pdf",
              content: pdfAttachments, // fallback if someone passes buffer directly
              contentType: "application/pdf",
            },
          ],
    };

    // console.log(`Sending email with ${pdfAttachments.length} attachments...`);
    await transporter.sendMail(mailOptions);

    // console.log(
    //   `Email sent successfully to ${toEmail} with ${pdfAttachments.length} attachment(s)`,
    // );
    return true;
  } catch (error) {
    console.error("Failed to send email with multiple attachments:", error);
    return false;
  }
}
