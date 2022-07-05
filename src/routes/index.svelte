<script lang="ts">

	// Imports:
	import { getTimestamp } from '$lib/functions';

	// Component Imports:
	import Claims from '$lib/Claims.svelte';
	import Deposits from '$lib/Deposits.svelte';
	import Withdrawals from '$lib/Withdrawals.svelte';

	// Initializations:
	let selectedChain: 'eth' | 'poly' | 'avax' = 'eth';
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics." />
</svelte:head>

<!-- Header -->
<div class="header">
	<img src="/images/pooltogether-logo.svg" alt="PoolTogether">
	<h1>Stats</h1>
</div>

<!-- Last Updated Date -->
<span class="lastUpdated"><strong>Last Updated:</strong> {getTimestamp()}</span>

<!-- Deposits -->
<Deposits {selectedChain} />

<!-- Withdrawals -->
<Withdrawals {selectedChain} />

<!-- Claims -->
<Claims {selectedChain} />

<!-- Bottom Spacer -->
<span class="spacer" />

<!-- Chain Selector -->
<div class="chainSelector">
	<span class="eth" class:selected={selectedChain === 'eth'} on:click={() => selectedChain = 'eth'}><img src="/images/ethereum.svg" alt="ETH"></span>
	<span class="poly" class:selected={selectedChain === 'poly'} on:click={() => selectedChain = 'poly'}><img src="/images/polygon.svg" alt="POLY"></span>
	<span class="avax" class:selected={selectedChain === 'avax'} on:click={() => selectedChain = 'avax'}><img src="/images/avalanche.svg" alt="AVAX"></span>
</div>

<!-- #################################################################################################### -->

<style>

	div.header {
		display: flex;
		margin: 2em 0;
	}

	div.header img {
		height: 10em;
		margin-right: 2em;
	}

	h1 {
		font-family: 'Righteous', cursive;
		font-size: 7.5em;
		letter-spacing: 5px;
	}

	span.lastUpdated {
		margin-bottom: .3em;
		font-size: 1.2em;
	}

	div.chainSelector {
		position: fixed;
		right: 0;
		display: flex;
		margin: 1em;
	}

	div.chainSelector span {
		display: flex;
		align-items: center;
		padding: .2em .3em;
		cursor: pointer;
	}

	div.chainSelector img {
		width: 2em;
		height: 2em;
	}

	div.chainSelector span.eth {
		border-radius: 1em 0 0 1em;
		background-color: #627EEA;
	}

	div.chainSelector span.poly {
		background-color: #7B3FE4;
	}

	div.chainSelector span.avax {
		border-radius: 0 1em 1em 0;
		background-color: #E84142;
	}

	div.chainSelector span.selected {
		outline: 2px solid var(--secondary-color);
		outline-offset: -2px;
		z-index: 1;
	}

	span.spacer {
		height: 100px;
	}
	
</style>