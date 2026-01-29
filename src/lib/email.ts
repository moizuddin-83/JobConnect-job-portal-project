import emailjs from '@emailjs/browser';
import { EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, EMAIL_PUBLIC_KEY } from './firebase';

export const sendEmail = async (
  toEmail: string, 
  toName: string, 
  subject: string, 
  message: string
) => {
  if (!toEmail) return;
  
  const templateParams = {
    to_email: toEmail,
    to_name: toName,
    subject: subject,
    message: message
  };
  
  try {
    await emailjs.send(
      EMAIL_SERVICE_ID, 
      EMAIL_TEMPLATE_ID, 
      templateParams, 
      EMAIL_PUBLIC_KEY
    );
    console.log(`✅ Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Email failed to send:", error);
  }
};
