# Register

SvelteKit account registration with MySQL-backed email activation.

## Run locally

Install dependencies with `npm install`, then run `npm run dev`. The dev server
listens on port `5173` on the network interfaces so other devices can connect.

## Activation email links

Set `BASE_URL` in `.env` to an address the recipient can reach. On the same
network, use this computer's LAN address, for example
`http://192.168.1.25:5173`. Allow port `5173` through the computer's firewall if
needed. A private `10.x.x.x` or `192.168.x.x` address only works for devices on
that LAN or VPN. To reach a PC from outside that network, use a public HTTPS
tunnel or deploy the app, then set `BASE_URL` to that public HTTPS address.

Restart the dev server after changing `.env`. Previously sent emails keep their
original links. Registration and activation must use the same running app and
database (`DB_*` settings in `.env`).

## Build

Run `npm run build` to create a production build. Deployment may require a
SvelteKit adapter suited to the hosting platform.
