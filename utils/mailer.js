const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

/**
 * Send claim notification email to the item poster
 */
async function sendClaimNotification({ posterEmail, posterName, item, claimant }) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const itemUrl = `${baseUrl}/item.html?id=${item.id}`;

  const mailOptions = {
    from: `"AICE Lost & Found" <${process.env.GMAIL_USER}>`,
    to: posterEmail,
    subject: `🔔 New Claim Request for "${item.title}" — AICE Lost & Found`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; color: #e5e7eb; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #06b6d4); padding: 32px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px;">🔍 AICE Lost & Found</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Anand International College of Engineering</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #f9fafb; margin-top: 0;">Hi ${posterName},</h2>
          <p style="color: #9ca3af; line-height: 1.6;">Someone has submitted a claim request for your posted item:</p>
          
          <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #818cf8; margin-top: 0;">📦 ${item.title}</h3>
            <p style="color: #9ca3af; margin: 4px 0;"><strong>Type:</strong> ${item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</p>
            <p style="color: #9ca3af; margin: 4px 0;"><strong>Location:</strong> ${item.location}</p>
          </div>

          <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #22d3ee; margin-top: 0;">👤 Claimant Details</h3>
            <p style="color: #9ca3af; margin: 4px 0;"><strong>Name:</strong> ${claimant.name}</p>
            <p style="color: #9ca3af; margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${claimant.email}" style="color: #06b6d4;">${claimant.email}</a></p>
            ${claimant.phone ? `<p style="color: #9ca3af; margin: 4px 0;"><strong>Phone:</strong> ${claimant.phone}</p>` : ''}
            <p style="color: #9ca3af; margin: 8px 0 0;"><strong>Proof/Description:</strong></p>
            <p style="color: #d1d5db; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin: 8px 0 0;">${claimant.proofDescription}</p>
          </div>

          <a href="${itemUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #06b6d4); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; margin-top: 16px;">View Item Details →</a>
          
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px; line-height: 1.5;">
            Please contact the claimant directly to verify ownership. Once verified, you can mark the item as resolved on the portal.
          </p>
        </div>
        <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center;">
          <p style="color: #4b5563; font-size: 12px; margin: 0;">AICE Campus Lost & Found Portal — Reuniting What Matters</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Claim notification sent to ${posterEmail}`);
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
}

module.exports = { sendClaimNotification };
