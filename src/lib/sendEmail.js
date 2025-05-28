import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get email template content
const getEmailTemplate = (templateName) => {
  const templatePath = path.join(
    __dirname,
    `../../emails/${templateName}.html`
  );
  try {
    return fs.readFileSync(templatePath, "utf8");
  } catch (error) {
    console.error(`Error reading ${templateName} template:`, error);
    return null;
  }
};

// Function to replace placeholders in the template
const replacePlaceholders = (template, placeholders) => {
  return Object.keys(placeholders).reduce(
    (content, key) =>
      content.replace(new RegExp(`{{${key}}}`, "g"), placeholders[key]),
    template
  );
};

// Reusable email function
const sendEmail = async ({ email, subject, templateName, placeholders }) => {
  try {
    let emailTemplate = getEmailTemplate(templateName);
    if (!emailTemplate) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Replace placeholders dynamically
    const emailContent = replacePlaceholders(emailTemplate, placeholders);

    const info = await transporter.sendMail({
      from: `Genius Learning <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: emailContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.log("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
