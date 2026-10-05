<script>
	let { form } = $props();

	let name = $state(form?.name ?? '');
	let email = $state(form?.email ?? '');
	let password = $state('');
	let passwordConfirmation = $state('');
	let errors = $state({});

	function validate() {
		errors = {};

		if (!name.trim()) {
			errors.name = 'Name is required.';
		} else if (Array.from(name.trim()).length > 100) {
			errors.name = 'Name must be 100 characters or fewer.';
		}

		if (!email.trim()) {
			errors.email = 'Email is required.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address.';
		} else if (Array.from(email.trim()).length > 255) {
			errors.email = 'Email must be 255 characters or fewer.';
		}

		if (!password) {
			errors.password = 'Password is required.';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters.';
		} else if (new TextEncoder().encode(password).length > 72) {
			errors.password = 'Password must be 72 bytes or fewer.';
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

<div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
	<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
		<h1 class="mb-2 text-center text-3xl font-bold text-gray-800">Create Account</h1>

		<p class="mb-8 text-center text-gray-500">Register a new account</p>

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
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700"> Name </label>

				<input
					id="name"
					name="name"
					type="text"
					maxlength="100"
					bind:value={name}
					class="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none {errors.name
						? 'border-red-500'
						: 'border-gray-300'}"
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
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700"> Email </label>

				<input
					id="email"
					name="email"
					type="email"
					maxlength="255"
					bind:value={email}
					class="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none {errors.email
						? 'border-red-500'
						: 'border-gray-300'}"
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
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
					Password
				</label>

				<input
					id="password"
					name="password"
					type="password"
					maxlength="72"
					bind:value={password}
					class="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none {errors.password
						? 'border-red-500'
						: 'border-gray-300'}"
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
				<label for="passwordConfirmation" class="mb-1 block text-sm font-medium text-gray-700">
					Confirm Password
				</label>

				<input
					id="passwordConfirmation"
					name="passwordConfirmation"
					type="password"
					maxlength="72"
					bind:value={passwordConfirmation}
					class="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none {errors.passwordConfirmation
						? 'border-red-500'
						: 'border-gray-300'}"
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
				class="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
			>
				Register
			</button>
		</form>
	</div>
</div>
