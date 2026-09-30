<script>
    import { goto } from '$app/navigation';
</script>

<div class="min-h-screen bg-[#0b0b0f] text-white flex items-center justify-center px-6">

    <div class="w-full max-w-4xl text-center">

        <p class="text-sm uppercase tracking-[0.3em] text-gray-400 mb-6">
            Welcome
        </p>

        <h1 class="text-6xl md:text-7xl font-bold tracking-tight mb-6">
            Create your
            <span class="text-gray-400"> account.</span>
        </h1>

        <p class="max-w-xl mx-auto text-gray-400 text-lg leading-relaxed mb-10">
            Join us and create your personal account.
            Simple, secure and easy to use.
        </p>

        <button
            onclick={() => goto('/register')}
            class="bg-white text-black px-8 py-4 rounded-full font-semibold
                   hover:bg-gray-200 transition duration-200"
        >
            Get Started →
        </button>

        <p class="text-gray-600 text-sm mt-12">
            Already have an account? Log in
        </p>

    </div>

</div>
```
