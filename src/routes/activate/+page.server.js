import db from '$lib/server/db';

export async function load({ url }) {
    const token = url.searchParams.get('token')?.trim();

    if (!token) {
        return { success: false, message: 'Kein Aktivierungstoken gefunden.' };
    }

    try {
        const [rows] = await db.execute(
            'SELECT * FROM activation_tokens WHERE token = ?',
            [token]
        );

        if (rows.length === 0) {
            return { success: false, message: 'Ungültiger Aktivierungstoken.' };
        }

        const t = rows[0];

        const [users] = await db.execute(
            'SELECT activated FROM users WHERE id = ?',
            [t.user_id]
        );

        if (users.length > 0 && users[0].activated) {
            return { success: true, message: 'Dein Account ist bereits aktiviert.' };
        }

        if (new Date(t.expires_at) < new Date()) {
            return { success: false, message: 'Der Aktivierungstoken ist abgelaufen.' };
        }

        await db.execute('UPDATE users SET activated = TRUE WHERE id = ?', [t.user_id]);

        return { success: true, message: 'Account erfolgreich aktiviert!' };
    } catch (error) {
        console.error('Activation error:', error);
        return { success: false, message: 'Serverfehler bei der Aktivierung.' };
    }
}