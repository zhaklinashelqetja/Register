import { fail } from '@sveltejs/kit';
import db from '$lib/server/db';

function expired(value) {
	return new Date(value).getTime() <= Date.now();
}

export async function load({ url }) {
	const token = url.searchParams.get('token')?.trim();

	if (!token) {
		return { success: false, message: 'Kein Aktivierungstoken gefunden.' };
	}

	try {
		const [rows] = await db.execute(
			`SELECT activation_tokens.expires_at, users.activated
             FROM activation_tokens
             JOIN users ON users.id = activation_tokens.user_id
             WHERE activation_tokens.token = ?`,
			[token]
		);

		if (rows.length === 0) {
			return { success: false, message: 'Ungültiger Aktivierungstoken.' };
		}

		if (rows[0].activated) {
			return { success: true, message: 'Dein Account ist bereits aktiviert.' };
		}

		if (expired(rows[0].expires_at)) {
			return { success: false, message: 'Der Aktivierungstoken ist abgelaufen.' };
		}

		// Email link scanners often open GET links automatically. Require an
		// explicit POST from the user before changing the account.
		return { success: false, needsConfirmation: true, token };
	} catch (error) {
		console.error('Activation lookup error:', error);
		return { success: false, message: 'Serverfehler bei der Aktivierung.' };
	}
}

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const token = formData.get('token')?.toString().trim();

		if (!token) {
			return fail(400, { success: false, message: 'Kein Aktivierungstoken gefunden.' });
		}

		const connection = await db.getConnection();
		try {
			await connection.beginTransaction();

			const [rows] = await connection.execute(
				`SELECT activation_tokens.user_id, activation_tokens.expires_at, users.activated
                 FROM activation_tokens
                 JOIN users ON users.id = activation_tokens.user_id
                 WHERE activation_tokens.token = ?
                 FOR UPDATE`,
				[token]
			);

			if (rows.length === 0) {
				await connection.rollback();
				return fail(400, { success: false, message: 'Ungültiger Aktivierungstoken.' });
			}

			const activation = rows[0];
			if (activation.activated) {
				await connection.commit();
				return { success: true, message: 'Dein Account ist bereits aktiviert.' };
			}

			if (expired(activation.expires_at)) {
				await connection.rollback();
				return fail(400, { success: false, message: 'Der Aktivierungstoken ist abgelaufen.' });
			}

			await connection.execute('UPDATE users SET activated = TRUE WHERE id = ?', [
				activation.user_id
			]);
			await connection.execute('DELETE FROM activation_tokens WHERE token = ?', [token]);
			await connection.commit();

			return { success: true, message: 'Account erfolgreich aktiviert!' };
		} catch (error) {
			await connection.rollback();
			console.error('Activation error:', error);
			return fail(500, { success: false, message: 'Serverfehler bei der Aktivierung.' });
		} finally {
			connection.release();
		}
	}
};
