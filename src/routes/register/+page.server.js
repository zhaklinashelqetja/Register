import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'luisha19_registration_app',
    waitForConnections: true,
    connectionLimit: 10
});

export const actions = {
    default: async ({ request }) => {
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
            return fail(400, {
                errors,
                name,
                email
            });
        }

        try {
            const [existingUsers] = await db.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return fail(409, {
                    errors: {
                        email: 'This email is already registered.'
                    },
                    name,
                    email
                });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            await db.execute(
                `INSERT INTO users
                (name, email, password_hash, activated)
                VALUES (?, ?, ?, FALSE)`,
                [name, email, passwordHash]
            );

            throw redirect(303, '/activate');
        } catch (error) {
            if (error?.status === 303) {
                throw error;
            }

            console.error(error);

            return fail(500, {
                errors: {
                    general: 'An error occurred during registration.'
                },
                name,
                email
            });
        }
    }
};