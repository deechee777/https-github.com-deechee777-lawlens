import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"LawLens" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendQuestionAnsweredEmail(userEmail: string, question: string, answer: string, sourceUrl?: string) {
  const subject = 'Your LawLens Question Has Been Answered';
  
  const text = `
Your legal question has been researched and answered!

Question: ${question}

Answer: ${answer}

${sourceUrl ? `Source: ${sourceUrl}` : ''}

Thank you for using LawLens!

---
LawLens Team
https://lawlens.com
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Your LawLens Question Has Been Answered</h1>
      
      <p>Your legal question has been researched and answered!</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Question:</h3>
        <p><em>"${question}"</em></p>
        
        <h3>Answer:</h3>
        <p style="line-height: 1.6;">${answer.replace(/\n/g, '<br>')}</p>
        
        ${sourceUrl ? `
          <h3>Source:</h3>
          <p><a href="${sourceUrl}" target="_blank" style="color: #0066cc;">View Original Law Source</a></p>
        ` : ''}
      </div>
      
      <p>Thank you for using LawLens!</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 14px;">
        LawLens Team<br>
        <a href="https://lawlens.com" style="color: #0066cc;">https://lawlens.com</a>
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, text, html });
}