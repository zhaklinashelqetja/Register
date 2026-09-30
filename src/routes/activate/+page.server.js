import { fail } from '@sveltejs/kit';
import db from '$lib/server/db';

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const token = data.get('token');

        // Prüfen, ob Token vorhanden ist
        if (!token) {
            return fail(400, {
                message: 'Aktivierungstoken fehlt.'
            });
        }

        // Token in der Datenbank suchen
        const [rows] = await db.execute(
            `SELECT *
             FROM activation_tokens
             WHERE token = ?`,
            [token]
        );

        // Token nicht gefunden
        if (rows.length === 0) {
            return fail(400, {
                message: 'Ungültiger Aktivierungstoken.'
            });
        }

        const activationToken = rows[0];

        // Ablaufdatum überprüfen
        if (new Date(activationToken.expires_at) < new Date()) {
            return fail(400, {
                message: 'Der Aktivierungstoken ist abgelaufen.'
            });
        }

        // User aktivieren
        await db.execute(
            `UPDATE users
             SET activated = true
             WHERE id = ?`,
            [activationToken.user_id]
        );

        // Token löschen
        await db.execute(
            `DELETE FROM activation_tokens
             WHERE id = ?`,
            [activationToken.id]
        );

        return {
            success: true,
            message: 'Account erfolgreich aktiviert!'
        };
    }
};