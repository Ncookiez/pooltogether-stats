<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { selectedChains } from '$lib/stores';

	// Type Imports:
	import type { Chain } from '$lib/types';

	onMount(() => {
		const chain = $page.params.chain as Chain;
		$selectedChains.eth = false;
		$selectedChains.poly = false;
		$selectedChains.avax = false;
		$selectedChains.op = false;
		$selectedChains[chain] = true;
		goto('/');
	});
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>Pool Stats</title>
	<meta name="description" content="An app for all there is to see about PoolTogether statistics." />
</svelte:head>