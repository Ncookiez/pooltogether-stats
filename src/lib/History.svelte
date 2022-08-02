<script lang="ts">

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	export let chain: Chain;
	
</script>

<!-- #################################################################################################### -->

<!-- History -->
<div class="history">
	test {chain}
	<!-- TODO -->
</div>

<!-- TODO - display latest deposits, latest winners, etc. (+draw data stuff) -->

<!-- #################################################################################################### -->

<style>

	div.history {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 81em;
		padding: 1em;
		background: var(--dark-purple);
		border: 2px solid var(--accent-color);
		border-radius: 1em;
		overflow: hidden;
	}
	
</style>