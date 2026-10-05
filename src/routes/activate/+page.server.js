import { fail } from '@sveltejs/kit';
import db from '$lib/server/db';

// Treat a token as expired once its stored expiration time has passed.
function expired(value) {
	return new Date(value).getTime() <= Date.now();
}

// Check an emailed activation link and return the information needed by the page.
export async function load({ url }) {
    // Read and trim the token from the query string.
	const token = url.searchParams.get('token')?.trim();

    // A missing token cannot be used to look up an account.
	if (!token) {
		return { success: false, message: 'Kein Aktivierungstoken gefunden.' };
	}

	try {
        // Join the token to its user to check expiration and current activation status.
		const [rows] = await db.execute(
			`SELECT activation_tokens.expires_at, users.activated
             FROM activation_tokens
             JOIN users ON users.id = activation_tokens.user_id
             WHERE activation_tokens.token = ?`,
			[token]
		);

        // No matching row means the token is invalid or has already been removed.
		if (rows.length === 0) {
			return { success: false, message: 'Ungültiger Aktivierungstoken.' };
		}

        // Give a friendly success response when the account was activated previously.
		if (rows[0].activated) {
			return { success: true, message: 'Dein Account ist bereits aktiviert.' };
		}

        // Reject expired links before asking the user to confirm activation.
		if (expired(rows[0].expires_at)) {
			return { success: false, message: 'Der Aktivierungstoken ist abgelaufen.' };
		}

		// Email link scanners often open GET links automatically. Require an
		// explicit POST from the user before changing the account.
		return { success: false, needsConfirmation: true, token };
	} catch (error) {
        // Keep technical details in server logs and show a general error to the visitor.
		console.error('Activation lookup error:', error);
		return { success: false, message: 'Serverfehler bei der Aktivierung.' };
	}
}

export const actions = {
    // Complete activation only after the visitor confirms on the page.
	default: async ({ request }) => {
		// Read the token submitted in the confirmation form.
		const formData = await request.formData();
		const token = formData.get('token')?.toString().trim();

        // Reject a missing token before opening a database connection.
		if (!token) {
			return fail(400, { success: false, message: 'Kein Aktivierungstoken gefunden.' });
		}

        // Reserve one connection because this operation needs a transaction.
		const connection = await db.getConnection();
		try {
			// A transaction and row lock make checking and consuming the token one atomic operation.
			await connection.beginTransaction();

            // Lock the matching rows while checking the token to prevent competing activations.
			const [rows] = await connection.execute(
				`SELECT activation_tokens.user_id, activation_tokens.expires_at, users.activated
                 FROM activation_tokens
                 JOIN users ON users.id = activation_tokens.user_id
                 WHERE activation_tokens.token = ?
                 FOR UPDATE`,
				[token]
			);

            // Roll back when the submitted token has no matching account.
			if (rows.length === 0) {
				await connection.rollback();
				return fail(400, { success: false, message: 'Ungültiger Aktivierungstoken.' });
			}

            // Use the joined user and token data returned by the locked lookup.
			const activation = rows[0];
            // Commit the read-only transaction when another request already activated this account.
			if (activation.activated) {
				await connection.commit();
				return { success: true, message: 'Dein Account ist bereits aktiviert.' };
			}

            // Do not activate accounts with expired tokens.
			if (expired(activation.expires_at)) {
				await connection.rollback();
				return fail(400, { success: false, message: 'Der Aktivierungstoken ist abgelaufen.' });
			}

            // Mark the account active, then consume the token so it cannot be reused.
			await connection.execute('UPDATE users SET activated = TRUE WHERE id = ?', [
				activation.user_id
			]);
			await connection.execute('DELETE FROM activation_tokens WHERE token = ?', [token]);
            // Make the account update and token deletion permanent together.
			await connection.commit();

			return { success: true, message: 'Account erfolgreich aktiviert!' };
		} catch (error) {
            // Undo any partial database changes if one of the activation queries fails.
			await connection.rollback();
			console.error('Activation error:', error);
			return fail(500, { success: false, message: 'Serverfehler bei der Aktivierung.' });
		} finally {
            // Return the reserved connection to the pool on every outcome.
			connection.release();
		}
	}
};
