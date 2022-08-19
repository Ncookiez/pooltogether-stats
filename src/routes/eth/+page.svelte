<script lang="ts">

	// Imports:
	import { getChainName } from '$lib/functions';
	import ChainCharts from '$lib/ChainCharts.svelte';
	import ChainHistory from '$lib/ChainHistory.svelte';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	const chain: Chain = 'eth';
	const chainName = getChainName(chain);
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>Pool Explorer | {chainName}</title>
	<meta name="description" content="An app for exploring all there is to see about PoolTogether statistics. Check out some {chainName}-specific stats!" />
</svelte:head>

<!-- Charts & Highlights -->
<ChainCharts {chain} />

<!-- Chain Event History -->
<ChainHistory {chain} />

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>