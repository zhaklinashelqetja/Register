# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.17.1 create --template minimal --no-types --add prettier eslint tailwindcss="plugins:typography,forms" --install npm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Testing activation links on another computer

Set `BASE_URL` in `.env` to this computer's reachable LAN address, including the
Vite port (for example, `http://192.168.1.25:5173`). The app uses this value in
activation emails. Start the dev server with `npm run dev`; Vite listens on the
network interface so another device on the same network can open that link.
Allow port `5173` through the computer's firewall if the other device cannot
connect. Restart the dev server after changing `.env`.

If the email link says the token is invalid, confirm registration and activation
are reaching the same running app and database. Activation tokens are stored in
the database selected by the `DB_*` settings in `.env`.

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
