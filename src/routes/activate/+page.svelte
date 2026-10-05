<script>
    let { data, form } = $props();
</script>

<div class="min-h-screen flex items-center justify-center">
    <div class="text-center max-w-md px-4">
        <h1 class="text-3xl font-bold mb-4">Account Aktivierung</h1>
        {#if data.needsConfirmation && !form}
            <p class="text-gray-700 mb-6">Klicke auf die Schaltfläche, um deinen Account zu aktivieren.</p>
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
