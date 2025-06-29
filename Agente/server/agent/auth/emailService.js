// auth/emailService.js
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendResetEmail(to, token) {
  const resetLink = `${process.env.FRONTEND_URL}/?resetToken=${token}`; // ejemplo
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject: 'Recuperación de contraseña',
    html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  };

  await sgMail.send(msg);
}

export async function sendVerificationEmail(to, token) {
  const verifyLink = `${process.env.FRONTEND_URL}/?verifyToken=${token}`;
  const msg = {
    to,
    from: process.env.EMAIL_FROM,
    subject: 'Verifica tu correo electrónico',
    html: `<p>Haz clic para verificar tu cuenta:</p>
           <a href="${verifyLink}">${verifyLink}</a>`,
  };

  await sgMail.send(msg);
}
