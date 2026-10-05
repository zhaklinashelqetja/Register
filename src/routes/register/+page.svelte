<script>
	let { form } = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirmation = $state('');
	let errors = $state({});

	// Keep non-sensitive fields filled after the server returns validation feedback.
	$effect(() => {
		// Update these fields only when server action data is available.
		if (form) {
			name = form.name ?? '';
			email = form.email ?? '';
		}
	});

	// These checks provide immediate feedback; the server validates again before saving anything.
	function validate() {
		// Clear messages from the previous validation pass before checking current input.
		errors = {};

		// Trim whitespace when checking required text fields and enforce database size limits.
		if (!name.trim()) {
			errors.name = 'Name is required.';
		} else if (Array.from(name.trim()).length > 100) {
			errors.name = 'Name must be 100 characters or fewer.';
		}

		// Require a basic email shape and enforce the maximum stored email length.
		if (!email.trim()) {
			errors.email = 'Email is required.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address.';
		} else if (Array.from(email.trim()).length > 255) {
			errors.email = 'Email must be 255 characters or fewer.';
		}

		// Require a sufficiently long password that stays within bcrypt's byte limit.
		if (!password) {
			errors.password = 'Password is required.';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters.';
		} else if (new TextEncoder().encode(password).length > 72) {
			errors.password = 'Password must be 72 bytes or fewer.';
		}

		// Require the confirmation field and compare it with the original password.
		if (!passwordConfirmation) {
			errors.passwordConfirmation = 'Please confirm your password.';
		} else if (password !== passwordConfirmation) {
			errors.passwordConfirmation = 'Passwords do not match.';
		}

		// Allow submission only when no validation messages were collected.
		return Object.keys(errors).length === 0;
	}
</script>

<svelte:head>
	<!-- Set the browser tab title for the registration route. -->
	<title>Register</title>
</svelte:head>

<!-- Full-screen background and centered registration card. -->
<div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
	<div class="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
		<!-- Page heading and short description. -->
		<h1 class="mb-2 text-center text-3xl font-bold text-gray-800">Create Account</h1>

		<p class="mb-8 text-center text-gray-500">Register a new account</p>

		<!-- Show a server-side error, such as a database or email configuration problem. -->
		{#if form?.errors?.general}
			<p class="mb-4 text-center text-red-600">
				{form.errors.general}
			</p>
		{/if}

		<!-- POST sends the form to the server action after client-side validation succeeds. -->
		<form
			method="POST"
			onsubmit={(event) => {
				// Stop the browser's POST when client-side validation finds an error.
				if (!validate()) {
					event.preventDefault();
				}
			}}
			class="space-y-5"
		>
			<!-- Name field and its client-side or server-side validation messages. -->
			<!-- NAME -->
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700"> Name </label>

				<!-- Bind the entered name to component state and submit it under the name field key. -->
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

				<!-- Display a validation message produced in the browser. -->
				{#if errors.name}
					<p class="mt-1 text-sm text-red-600">
						{errors.name}
					</p>
				{/if}

				<!-- Display a validation message returned by the server action. -->
				{#if form?.errors?.name}
					<p class="mt-1 text-sm text-red-600">
						{form.errors.name}
					</p>
				{/if}
			</div>

			<!-- Email field; the server normalizes and validates it before storing the account. -->
			<!-- EMAIL -->
			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700"> Email </label>

				<!-- Browser email input with an accessible label and a submitted field name. -->
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

				<!-- Show client-side email validation feedback. -->
				{#if errors.email}
					<p class="mt-1 text-sm text-red-600">
						{errors.email}
					</p>
				{/if}

				<!-- Show server-side feedback, including when the address is already registered. -->
				{#if form?.errors?.email}
					<p class="mt-1 text-sm text-red-600">
						{form.errors.email}
					</p>
				{/if}
			</div>

			<!-- Password field; the value is submitted for hashing and is never echoed back. -->
			<!-- PASSWORD -->
			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
					Password
				</label>

				<!-- Mask the password while typing and cap its browser-submitted length. -->
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

				<!-- Show client-side password validation feedback. -->
				{#if errors.password}
					<p class="mt-1 text-sm text-red-600">
						{errors.password}
					</p>
				{/if}

				<!-- Show server-side password validation feedback. -->
				{#if form?.errors?.password}
					<p class="mt-1 text-sm text-red-600">
						{form.errors.password}
					</p>
				{/if}
			</div>

			<!-- Confirmation field to catch password typing mistakes before registration. -->
			<!-- CONFIRM PASSWORD -->
			<div>
				<label for="passwordConfirmation" class="mb-1 block text-sm font-medium text-gray-700">
					Confirm Password
				</label>

				<!-- Mask the repeated password and submit it for comparison on the server. -->
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

				<!-- Show client-side confirmation feedback when the field is empty or differs. -->
				{#if errors.passwordConfirmation}
					<p class="mt-1 text-sm text-red-600">
						{errors.passwordConfirmation}
					</p>
				{/if}

				<!-- Show any corresponding confirmation error returned from the server. -->
				{#if form?.errors?.passwordConfirmation}
					<p class="mt-1 text-sm text-red-600">
						{form.errors.passwordConfirmation}
					</p>
				{/if}
			</div>

			<!-- Submit the validated registration details to the server action. -->
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
