<script>
	// Resolve the home route so the link respects SvelteKit's configured base path.
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<!-- Identify the registration confirmation screen in the browser tab. -->
	<title>Registrierung erfolgreich</title>
</svelte:head>

<!-- Center the confirmation card on a light full-screen background. -->
<div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
	<div class="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
		<!-- Envelope icon signals that the next step arrives by email. -->
		<div class="mb-4 text-5xl">📧</div>

		<!-- Heading indicates the process is waiting for email activation. -->
		<h1 class="mb-3 text-3xl font-bold text-gray-800">Fast geschafft!</h1>

		<!-- Tell the user to open the activation link sent to their email address. -->
		<p class="mb-6 text-gray-600">
			Wir haben dir eine E-Mail mit einem Aktivierungslink geschickt. Bitte klicke auf den Link in
			der Mail, um deinen Account zu aktivieren.
		</p>

		<!-- Suggest checking spam if the activation message is not in the inbox. -->
		<p class="mb-8 text-sm text-gray-400">Keine Mail bekommen? Schau auch im Spam-Ordner nach.</p>

		<!-- Return the user to the landing page. -->
		<a
			href={resolve('/')}
			class="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
		>
			Zurück zur Startseite
		</a>
	</div>
</div>
