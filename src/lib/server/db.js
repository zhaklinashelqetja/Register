import mysql from 'mysql2/promise';

import { DB_NAME, DB_HOST, DB_USER, DB_PASSWORD, DB_PORT } from '$env/static/private';

// Reuse a bounded pool instead of opening a new MySQL connection for every query.
const pool = mysql.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	port: Number(DB_PORT)
});

export default pool;
