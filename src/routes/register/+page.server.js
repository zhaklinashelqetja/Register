import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '$env/dynamic/private';
import db from '$lib/server/db';
import { sendActivationMail } from '$lib/server/mail';

function registrationErrorMessage(error, stage) {
	if (stage === 'sending the activation email') {
		return 'The account could not be registered because the activation email could not be sent. Check the SMTP settings in .env and try again.';
	}
	if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
		return 'The database rejected its login. Check DB_USER and DB_PASSWORD in your .env file.';
	}
	if (
		error?.code === 'ENOTFOUND' ||
		error?.code === 'ECONNREFUSED' ||
		error?.code === 'ETIMEDOUT'
	) {
		return 'The database could not be reached. Check DB_HOST and DB_PORT and make sure the server is online.';
	}
	if (error?.code === 'ER_BAD_DB_ERROR') {
		return 'The configured database was not found. Check DB_NAME in your .env file.';
	}
	if (error?.code === 'ER_NO_SUCH_TABLE') {
		return 'The registration tables are missing from the configured database.';
	}
	if (error?.code === 'SMTP_NOT_CONFIGURED') {
		return 'Email delivery is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in your .env file.';
	}
	return 'Registration could not be completed. Check the server configuration and try again.';
}

export const actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString().trim();
		const email = formData.get('email')?.toString().trim().toLowerCase();
		const password = formData.get('password')?.toString();
		const passwordConfirmation = formData.get('passwordConfirmation')?.toString();

		const errors = {};

		if (!name) {
			errors.name = 'Name is required.';
		} else if (Array.from(name).length > 100) {
			errors.name = 'Name must be 100 characters or fewer.';
		}

		if (!email) {
			errors.email = 'Email is required.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address.';
		} else if (Array.from(email).length > 255) {
			errors.email = 'Email must be 255 characters or fewer.';
		}

		if (!password) {
			errors.password = 'Password is required.';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters.';
		} else if (Buffer.byteLength(password, 'utf8') > 72) {
			errors.password = 'Password must be 72 bytes or fewer.';
		}

		if (!passwordConfirmation) {
			errors.passwordConfirmation = 'Please confirm your password.';
		} else if (password !== passwordConfirmation) {
			errors.passwordConfirmation = 'Passwords do not match.';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, name, email });
		}

		let insertedUserId;
		let stage = 'checking the database';
		try {
			const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

			if (existingUsers.length > 0) {
				return fail(409, {
					errors: { email: 'This email is already registered.' },
					name,
					email
				});
			}

			stage = 'hashing the password';
			const passwordHash = await bcrypt.hash(password, 12);

			stage = 'saving the account';
			const [result] = await db.execute(
				`INSERT INTO users (name, email, password_hash, activated)
                 VALUES (?, ?, ?, FALSE)`,
				[name, email, passwordHash]
			);
			insertedUserId = result.insertId;

			const token = crypto.randomBytes(32).toString('hex');
			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

			await db.execute(
				`INSERT INTO activation_tokens (user_id, token, expires_at)
                 VALUES (?, ?, ?)`,
				[insertedUserId, token, expiresAt]
			);

			// Use the configured public origin so email links work when opened
			// from another device (where localhost would refer to that device).
			const activationUrl = new URL('/activate', url.origin);
            activationUrl.searchParams.set('token', token);     
			stage = 'sending the activation email';
			await sendActivationMail(email, name, activationUrl.toString());
		} catch (error) {
			console.error(`Registration failed while ${stage}:`, error?.code || error?.message);
			if (error?.code === 'ER_DUP_ENTRY') {
				return fail(409, {
					errors: { email: 'This email is already registered.' },
					name,
					email
				});
			}
			if (insertedUserId) {
				try {
					await db.execute('DELETE FROM activation_tokens WHERE user_id = ?', [insertedUserId]);
					await db.execute('DELETE FROM users WHERE id = ? AND activated = FALSE', [
						insertedUserId
					]);
				} catch (cleanupError) {
					console.error('Could not clean up incomplete registration:', cleanupError);
				}
			}
			return fail(500, {
				errors: { general: registrationErrorMessage(error, stage) },
				name,
				email
			});
		}

		throw redirect(303, '/register/success');
	}
};
