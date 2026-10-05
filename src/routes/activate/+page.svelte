<script>
    let { data } = $props();
</script>

<div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
        <h1 class="text-3xl font-bold mb-4">Account Aktivierung</h1>
        <p class={data.success ? 'text-green-600' : 'text-red-600'}>
            {data.message}
        </p>
    </div>
</div>