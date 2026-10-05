<script>
    import { goto } from '$app/navigation';
</script>

<svelte:head>
    <title>Registrierung erfolgreich</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">

        <div class="text-5xl mb-4">📧</div>

        <h1 class="text-3xl font-bold text-gray-800 mb-3">
            Fast geschafft!
        </h1>

        <p class="text-gray-600 mb-6">
            Wir haben dir eine E-Mail mit einem Aktivierungslink geschickt.
            Bitte klicke auf den Link in der Mail, um deinen Account zu aktivieren.
        </p>

        <p class="text-sm text-gray-400 mb-8">
            Keine Mail bekommen? Schau auch im Spam-Ordner nach.
        </p>

        <button
            onclick={() => goto('/')}
            class="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
            Zurück zur Startseite
        </button>

    </div>
</div>