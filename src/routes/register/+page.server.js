import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '$env/dynamic/private';
import db from '$lib/server/db';
import { sendActivationMail } from '$lib/server/mail';

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
        }

        if (!email) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address.';
        }

        if (!password) {
            errors.password = 'Password is required.';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        }

        if (!passwordConfirmation) {
            errors.passwordConfirmation = 'Please confirm your password.';
        } else if (password !== passwordConfirmation) {
            errors.passwordConfirmation = 'Passwords do not match.';
        }

        if (Object.keys(errors).length > 0) {
            return fail(400, { errors, name, email });
        }

        try {
            const [existingUsers] = await db.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return fail(409, {
                    errors: { email: 'This email is already registered.' },
                    name,
                    email
                });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const [result] = await db.execute(
                `INSERT INTO users (name, email, password_hash, activated)
                 VALUES (?, ?, ?, FALSE)`,
                [name, email, passwordHash]
            );

            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await db.execute(
                `INSERT INTO activation_tokens (user_id, token, expires_at)
                 VALUES (?, ?, ?)`,
                [result.insertId, token, expiresAt]
            );

            // Use the configured public origin so email links work when opened
            // from another device (where localhost would refer to that device).
            const baseUrl = env.BASE_URL?.trim() || url.origin;
            const activationUrl = new URL('/activate', baseUrl);
            activationUrl.searchParams.set('token', token);
            await sendActivationMail(email, name, activationUrl.toString());
        } catch (error) {
            console.error(error);
            return fail(500, {
                errors: { general: 'An error occurred during registration.' },
                name,
                email
            });
        }

        throw redirect(303, '/register/success');
    }
};
