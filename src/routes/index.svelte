<script>

	// Imports:
	import { onMount } from 'svelte';
	import { updateBlockTimestamps } from '$lib/stats';

	// Initializations & Exports:
	// :3

	onMount(() => {
		updateBlockTimestamps();
	});
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics." />
</svelte:head>

<!-- Page Content -->
<span>Temp Content</span>

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>