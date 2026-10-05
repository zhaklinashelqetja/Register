import nodemailer from 'nodemailer';
import {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM
} from '$env/static/private';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false, // port 2525 uses STARTTLS, so false is correct
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD
    }
});

export async function sendActivationMail(to, name, link) {
    await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject: 'Activate your account',
        html: `<p>Hi ${name},</p>
               <p><a href="${link}">Click here to activate your account</a></p>
               <p>This link is valid for 24 hours.</p>`
    });
}