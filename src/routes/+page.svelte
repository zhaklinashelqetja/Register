<script>
	import { resolve } from '$app/paths';
</script>

<div class="flex min-h-screen items-center justify-center bg-[#0b0b0f] px-6 text-white">
	<div class="w-full max-w-4xl text-center">
		<p class="mb-6 text-sm tracking-[0.3em] text-gray-400 uppercase">Welcome</p>

		<h1 class="mb-6 text-6xl font-bold tracking-tight md:text-7xl">
			Create your
			<span class="text-gray-400"> account.</span>
		</h1>

		<p class="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-400">
			Join us and create your personal account. Simple, secure and easy to use.
		</p>

		<a
			href={resolve('/register')}
			class="rounded-full bg-white px-8 py-4 font-semibold text-black
                   transition duration-200 hover:bg-gray-200"
		>
			Get Started →
		</a>

		<p class="mt-12 text-sm text-gray-600">Already have an account? Log in</p>
	</div>
</div>
```
