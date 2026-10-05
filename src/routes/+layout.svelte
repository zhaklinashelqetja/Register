<script>
	// Load shared styling and the site icon once for every route.
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	// Receive and render the active page as this layout's child content.
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
