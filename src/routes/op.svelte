<script lang="ts">

	// Imports:
	import { getChainName } from '$lib/functions';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	const chain: Chain = 'op';
	const chainName = getChainName(chain);
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats | {chainName}</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics." />
</svelte:head>

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>