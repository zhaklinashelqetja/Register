import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

// Replace characters that have special meaning in HTML with safe text entities.
function escapeHtml(value) {
	// Convert the supplied value to text, then inspect each potentially unsafe character.
	return String(value).replace(/[&<>"']/g, (character) => {
		// Map HTML syntax characters to their entity spelling before putting them in email markup.
		const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
		return entities[character];
	});
}

// Send an account activation link as both plain text and HTML email.
export async function sendActivationMail(to, name, link) {
	// Do not create an account that cannot receive its activation link due to missing mail settings.
	const requiredSettings = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'];
	// The callback checks each required setting and fails if any value is missing.
	if (requiredSettings.some((key) => !env[key]) || !env.SMTP_PORT) {
		const error = new Error('SMTP settings are incomplete');
		error.code = 'SMTP_NOT_CONFIGURED';
		throw error;
	}

	// Convert the configured port string to a number for Nodemailer's transport.
	const port = Number(env.SMTP_PORT || 587);
	const transporter = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port,
		// Port 465 uses implicit TLS; other configured ports use STARTTLS.
		secure: port === 465,
		auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
	});
	// Escape values used in HTML; plain-text fields keep their readable original values.
	const safeName = escapeHtml(name);
	const safeLink = escapeHtml(link);

	// Send through the configured SMTP service and wait for delivery to be accepted.
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
