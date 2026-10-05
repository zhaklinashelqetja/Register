<script>
	let { data, form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="max-w-md px-4 text-center">
		<h1 class="mb-4 text-3xl font-bold">Account Aktivierung</h1>
		{#if data.needsConfirmation && !form}
			<p class="mb-6 text-gray-700">
				Klicke auf die Schaltfläche, um deinen Account zu aktivieren.
			</p>
			<form method="POST">
				<input type="hidden" name="token" value={data.token} />
				<button class="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
					Account aktivieren
				</button>
			</form>
		{:else}
			<p class={(form?.success ?? data.success) ? 'text-green-600' : 'text-red-600'}>
				{form?.message ?? data.message}
			</p>
		{/if}
	</div>
</div>
