<script>
	// Resolve this internal route with SvelteKit's configured base path.
	import { resolve } from '$app/paths';
</script>

<div class="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-6 text-white">
	<!-- Center the landing page content in a full-screen dark background. -->
	<div class="w-full max-w-4xl text-center">
		<!-- Small introductory label above the main heading. -->
		<p class="mb-6 text-sm tracking-[0.3em] text-gray-400 uppercase">Welcome</p>

		<!-- Main message introducing account creation. -->
		<h1 class="mb-6 text-6xl font-bold tracking-tight md:text-7xl">
			Create your
			<span class="text-gray-400"> account.</span>
		</h1>

		<!-- Brief explanation of what visitors can do on this site. -->
		<p class="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-400">
			Join us and create your personal account. Simple, secure and easy to use.
		</p>

		<!-- Internal link that opens the registration form. -->
		<a
			href={resolve('/register')}
			class="rounded-full bg-white px-8 py-4 font-semibold text-black
                   transition duration-200 hover:bg-gray-200"
		>
			Get Started →
		</a>

		<!-- Login prompt displayed below the registration link. -->
		<p class="mt-12 text-sm text-gray-600">Already have an account? Log in</p>
	</div>
</div>
```
