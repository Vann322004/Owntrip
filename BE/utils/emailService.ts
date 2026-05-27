import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Tạo transporter cho Nodemailer sử dụng Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmailTemplate = async (
  to: string,
  subject: string,
  templateName: string,
  variables: Record<string, string>
) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      console.error(`❌ Invalid email address: ${to}`);
      throw new Error(`Invalid email address: ${to}`);
    }

    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    for (const [key, value] of Object.entries(variables)) {
      htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const info = await transporter.sendMail({
      from: `"Owntrip Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`📧 Email (${templateName}) sent to ${to} (MessageId: ${info.messageId})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send ${templateName} email:`, error.message);
    return false;
  }
};
