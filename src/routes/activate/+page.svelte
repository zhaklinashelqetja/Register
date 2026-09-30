<script>
    import { onMount } from 'svelte';

    let message = 'Account wird aktiviert...';
    let success = false;

    onMount(async () => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
            message = 'Kein Aktivierungstoken gefunden.';
            return;
        }

        const response = await fetch(`/api/activate?token=${token}`);
        const data = await response.json();

        message = data.message;
        success = response.ok;
    });
</script>

<div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
        <h1 class="text-3xl font-bold mb-4">
            Account Aktivierung
        </h1>

        <p class={success ? 'text-green-600' : 'text-red-600'}>
            {message}
        </p>
    </div>
</div>