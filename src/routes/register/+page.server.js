import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '$lib/server/db';
import { sendActivationMail } from '$lib/server/mail';
 
// Convert internal database or email errors into a message safe and useful for the registration form.
function registrationErrorMessage(error, stage) {
    // Email failure gets its own message because the account must receive its activation link.
    if (stage === 'sending the activation email') {
        return 'The account could not be registered because the activation email could not be sent. Check the SMTP settings and try again.';
    }
 
    // MySQL reports a specific code when the username or password is rejected.
    if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
        return 'The database rejected its login. Check DB_USER and DB_PASSWORD.';
    }
 
    // These codes indicate that the configured database host could not be reached.
    if (
        error?.code === 'ENOTFOUND' ||
        error?.code === 'ECONNREFUSED' ||
        error?.code === 'ETIMEDOUT'
    ) {
        return 'The database could not be reached. Check DB_HOST and DB_PORT and make sure the server is online.';
    }
 
    // This code means the server was reached, but the configured database name is invalid.
    if (error?.code === 'ER_BAD_DB_ERROR') {
        return 'The configured database was not found. Check DB_NAME.';
    }
 
    // The SQL connection worked, but the expected registration table is absent.
    if (error?.code === 'ER_NO_SUCH_TABLE') {
        return 'The registration tables are missing from the configured database.';
    }
 
    // Mail setup can be incomplete even when the database is available.
    if (error?.code === 'SMTP_NOT_CONFIGURED') {
        return 'Email delivery is not configured. Check the SMTP settings.';
    }
 
    return 'Registration could not be completed. Check the server configuration and try again.';
}
 
export const actions = {
    // Handle the registration form's POST request on the server.
    default: async ({ request }) => {
        // Read all submitted form fields from the incoming request.
        const formData = await request.formData();
 
        // Normalize email addresses so capitalization does not create duplicate accounts.
        const name = formData.get('name')?.toString().trim();
        const email = formData.get('email')?.toString().trim().toLowerCase();
        const password = formData.get('password')?.toString();
        const passwordConfirmation = formData
            .get('passwordConfirmation')
            ?.toString();
 
        // Collect field errors so multiple validation problems can be shown at once.
        const errors = {};
 
        // Require a name and keep it within the database column's expected size.
        if (!name) {
            errors.name = 'Name is required.';
        } else if (Array.from(name).length > 100) {
            errors.name = 'Name must be 100 characters or fewer.';
        }
 
        // Check that an email is present, has a basic valid shape, and fits its column.
        if (!email) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address.';
        } else if (Array.from(email).length > 255) {
            errors.email = 'Email must be 255 characters or fewer.';
        }
 
        // Enforce bcrypt's minimum strength and maximum input size before hashing.
        if (!password) {
            errors.password = 'Password is required.';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        } else if (Buffer.byteLength(password, 'utf8') > 72) {
            errors.password = 'Password must be 72 bytes or fewer.';
        }
 
        // Make the user repeat the same password to catch typing mistakes.
        if (!passwordConfirmation) {
            errors.passwordConfirmation = 'Please confirm your password.';
        } else if (password !== passwordConfirmation) {
            errors.passwordConfirmation = 'Passwords do not match.';
        }
 
        // Return a 400 response with field errors instead of attempting database writes.
        if (Object.keys(errors).length > 0) {
            return fail(400, {
                errors,
                name,
                email
            });
        }
 
        // Remember the new row ID so a later failure can remove the incomplete account.
        let insertedUserId;
        // Track the current operation to make server-side error logs easier to diagnose.
        let stage = 'checking the database';
 
        try {
            // The unique database constraint remains the final guard against concurrent signups.
            const [existingUsers] = await db.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
 
            // Stop early with a field-level message when this email is already taken.
            if (existingUsers.length > 0) {
                return fail(409, {
                    errors: {
                        email: 'This email is already registered.'
                    },
                    name,
                    email
                });
            }
 
            stage = 'hashing the password';
 
            // Hashing is intentionally expensive to make stolen password hashes harder to crack.
            const passwordHash = await bcrypt.hash(password, 12);
 
            stage = 'saving the account';
 
            const [result] = await db.execute(
                `INSERT INTO users (name, email, password_hash, activated)
                 VALUES (?, ?, ?, FALSE)`,
                [name, email, passwordHash]
            );
 
            // Keep the generated ID for the activation token and possible cleanup below.
            insertedUserId = result.insertId;
 
            // Sicheren Aktivierungstoken erstellen
            const token = crypto.randomBytes(32).toString('hex');
 
            // Token ist 24 Stunden gültig
            const expiresAt = new Date(
                Date.now() + 24 * 60 * 60 * 1000
            );
 
            // Token in der Datenbank speichern
            await db.execute(
                `INSERT INTO activation_tokens
                    (user_id, token, expires_at)
                 VALUES (?, ?, ?)`,
                [insertedUserId, token, expiresAt]
            );
 
            // WICHTIG:
            // Öffentliche Vercel-URL verwenden.
            // Dadurch funktioniert der Link auch auf anderen Geräten.
            // Build an absolute link that works from a recipient's device, not just this server.
            const activationUrl = new URL(
                '/activate',
                'https://register-eta-three.vercel.app'
            );
 
            // Token an den Link anhängen
            activationUrl.searchParams.set('token', token);
 
            stage = 'sending the activation email';
 
            // Aktivierungs-E-Mail versenden
            await sendActivationMail(
                email,
                name,
                activationUrl.toString()
            );
        } catch (error) {
            // Include the failing step in server logs while returning a safe message to the form.
            console.error(
                `Registration failed while ${stage}:`,
                error?.code || error?.message
            );
 
            // A concurrent signup can win after the earlier email lookup; map that race to the same message.
            if (error?.code === 'ER_DUP_ENTRY') {
                return fail(409, {
                    errors: {
                        email: 'This email is already registered.'
                    },
                    name,
                    email
                });
            }
 
            // Remove the pending user and token if any later registration step failed.
            if (insertedUserId) {
                try {
                    await db.execute(
                        'DELETE FROM activation_tokens WHERE user_id = ?',
                        [insertedUserId]
                    );
 
                    await db.execute(
                        `DELETE FROM users
                         WHERE id = ?
                         AND activated = FALSE`,
                        [insertedUserId]
                    );
                } catch (cleanupError) {
                    console.error(
                        'Could not clean up incomplete registration:',
                        cleanupError
                    );
                }
            }
 
            // Preserve the name and email so the user does not need to enter them again.
            return fail(500, {
                errors: {
                    general: registrationErrorMessage(error, stage)
                },
                name,
                email
            });
        }
 
        // After saving the account and sending its email, redirect to the confirmation page.
        throw redirect(303, '/register/success');
    }
};