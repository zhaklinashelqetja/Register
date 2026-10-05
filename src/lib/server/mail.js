import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (character) => {
		const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
		return entities[character];
	});
}

export async function sendActivationMail(to, name, link) {
	const port = Number(env.SMTP_PORT || 587);
	const transporter = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port,
		secure: port === 465,
		auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
	});
	const safeName = escapeHtml(name);
	const safeLink = escapeHtml(link);

	await transporter.sendMail({
		from: env.SMTP_FROM,
		to,
		subject: 'Activate your account',
		text: `Hi ${name},\n\nActivate your account: ${link}\n\nThis link is valid for 24 hours.`,
		html: `<p>Hi ${safeName},</p>
		       <p><a href="${safeLink}">Click here to activate your account</a></p>
		       <p>This link is valid for 24 hours.</p>`
	});
}
