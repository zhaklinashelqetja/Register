# Register

SvelteKit account registration with MySQL-backed email activation.

## Registration configuration

Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `.env` for
the MySQL database. It must contain the `users` and `activation_tokens` tables
used by the registration and activation routes.

Activation emails require `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASSWORD`, and `SMTP_FROM` in `.env`.

## Run locally

Install dependencies with `npm install`, then run `npm run dev`. The dev server
listens on port `5173` on the network interfaces so other devices can connect.

## Activation email links

For local development, set `BASE_URL=http://localhost:5173` in `.env`. Email
activation links then open on the same computer running the app. `localhost`
always refers to the computer opening the link, so it will not reach this app
when opened from another PC.

Restart the dev server after changing `.env`. Previously sent emails keep their
original links. Registration and activation must use the same running app and
database (`DB_*` settings in `.env`).

## Build

Run `npm run build` to create a production build. Deployment may require a
SvelteKit adapter suited to the hosting platform.
