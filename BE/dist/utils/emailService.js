"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailTemplate = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Tạo transporter cho Nodemailer sử dụng Gmail
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendEmailTemplate = async (to, subject, templateName, variables) => {
    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            console.error(`❌ Invalid email address: ${to}`);
            throw new Error(`Invalid email address: ${to}`);
        }
        const templatePath = path_1.default.join(__dirname, 'templates', `${templateName}.html`);
        let htmlContent = fs_1.default.readFileSync(templatePath, 'utf8');
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
    }
    catch (error) {
        console.error(`❌ Failed to send ${templateName} email:`, error.message);
        return false;
    }
};
exports.sendEmailTemplate = sendEmailTemplate;
