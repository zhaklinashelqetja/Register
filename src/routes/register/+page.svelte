<script>
    let { form } = $props();

   let name = $state('');
   let email = $state('');
   let password = $state('');
   let passwordConfirmation = $state('');
   let errors = $state({});

    function validate() {
        errors = {};

        if (!name.trim()) {
            errors.name = 'Name is required.';
        }

        if (!email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address.';
        }

        if (!password) {
            errors.password = 'Password is required.';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters.';
        }

        if (!passwordConfirmation) {
            errors.passwordConfirmation = 'Please confirm your password.';
        } else if (password !== passwordConfirmation) {
            errors.passwordConfirmation = 'Passwords do not match.';
        }

        return Object.keys(errors).length === 0;
    }
</script>

<svelte:head>
    <title>Register</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        <h1 class="text-3xl font-bold text-center text-gray-800 mb-2">
            Create Account
        </h1>

        <p class="text-center text-gray-500 mb-8">
            Register a new account
        </p>

        {#if form?.errors?.general}
            <p class="mb-4 text-center text-red-600">
                {form.errors.general}
            </p>
        {/if}

        <form
            method="POST"
            onsubmit={(event) => {
                if (!validate()) {
                    event.preventDefault();
                }
            }}
            class="space-y-5"
        >

            <!-- NAME -->
            <div>
                <label
                    for="name"
                    class="block text-sm font-medium text-gray-700 mb-1"
                >
                    Name
                </label>

                <input
                    id="name"
                    name="name"
                    type="text"
                    bind:value={name}
                    class="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.name ? 'border-red-500' : 'border-gray-300'}"
                    placeholder="Your name"
                />

                {#if errors.name}
                    <p class="mt-1 text-sm text-red-600">
                        {errors.name}
                    </p>
                {/if}

                {#if form?.errors?.name}
                    <p class="mt-1 text-sm text-red-600">
                        {form.errors.name}
                    </p>
                {/if}
            </div>

            <!-- EMAIL -->
            <div>
                <label
                    for="email"
                    class="block text-sm font-medium text-gray-700 mb-1"
                >
                    Email
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    bind:value={email}
                    class="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.email ? 'border-red-500' : 'border-gray-300'}"
                    placeholder="you@example.com"
                />

                {#if errors.email}
                    <p class="mt-1 text-sm text-red-600">
                        {errors.email}
                    </p>
                {/if}

                {#if form?.errors?.email}
                    <p class="mt-1 text-sm text-red-600">
                        {form.errors.email}
                    </p>
                {/if}
            </div>

            <!-- PASSWORD -->
            <div>
                <label
                    for="password"
                    class="block text-sm font-medium text-gray-700 mb-1"
                >
                    Password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    bind:value={password}
                    class="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.password ? 'border-red-500' : 'border-gray-300'}"
                    placeholder="At least 8 characters"
                />

                {#if errors.password}
                    <p class="mt-1 text-sm text-red-600">
                        {errors.password}
                    </p>
                {/if}

                {#if form?.errors?.password}
                    <p class="mt-1 text-sm text-red-600">
                        {form.errors.password}
                    </p>
                {/if}
            </div>

            <!-- CONFIRM PASSWORD -->
            <div>
                <label
                    for="passwordConfirmation"
                    class="block text-sm font-medium text-gray-700 mb-1"
                >
                    Confirm Password
                </label>

                <input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    bind:value={passwordConfirmation}
                    class="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.passwordConfirmation ? 'border-red-500' : 'border-gray-300'}"
                    placeholder="Repeat your password"
                />

                {#if errors.passwordConfirmation}
                    <p class="mt-1 text-sm text-red-600">
                        {errors.passwordConfirmation}
                    </p>
                {/if}

                {#if form?.errors?.passwordConfirmation}
                    <p class="mt-1 text-sm text-red-600">
                        {form.errors.passwordConfirmation}
                    </p>
                {/if}
            </div>

            <!-- BUTTON -->
            <button
                type="submit"
                class="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 transition"
            >
                Register
            </button>

        </form>
    </div>
</div>