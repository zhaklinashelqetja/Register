<script>
	// Read the activation status from the server and any result returned by the confirmation form.
	let { data, form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<!-- Keep the activation prompt or result centered on the page. -->
	<div class="max-w-md px-4 text-center">
		<!-- Explain that this route handles activation email links. -->
		<h1 class="mb-4 text-3xl font-bold">Account Aktivierung</h1>
		<!-- Show a confirmation form only for a valid, unused, unexpired token. -->
		{#if data.needsConfirmation && !form}
			<p class="mb-6 text-gray-700">
				Klicke auf die Schaltfläche, um deinen Account zu aktivieren.
			</p>
			<!-- POST the token only after the visitor presses the activation button. -->
			<form method="POST">
				<input type="hidden" name="token" value={data.token} />
			<!-- The submit button confirms the account activation request. -->
				<button class="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
					Account aktivieren
				</button>
			</form>
		<!-- Otherwise show the server's activation success or error message. -->
		{:else}
			<p class={(form?.success ?? data.success) ? 'text-green-600' : 'text-red-600'}>
				{form?.message ?? data.message}
			</p>
		{/if}
	</div>
</div>
