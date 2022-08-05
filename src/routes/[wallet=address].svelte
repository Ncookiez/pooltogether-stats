<script lang="ts">

	// Imports:
	import { utils } from 'ethers';
	import { page } from '$app/stores';
	import { getPlayerData } from '$lib/functions';
	import { ethData, polyData, avaxData, opData } from '$lib/stores';
	import PlayerCharts from '$lib/PlayerCharts.svelte';
	import PlayerHistory from '$lib/PlayerHistory.svelte';

	// Type Imports:
	import type { Hash } from '$lib/types';

	// Initializations:
	const ticks = 50;

	// Reactive Wallet:
	$: wallet = $page ? utils.getAddress($page.params.wallet) as Hash : undefined;

	// Reactive Player Data:
	$: playerData = getPlayerData(wallet, $ethData, $polyData, $avaxData, $opData, ticks);
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>Pool Explorer | {wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : 'Player Stats'}</title>
	<meta name="description" content="An app for exploring all there is to see about PoolTogether statistics. Check out some individual wallet stats!" />
</svelte:head>

{#if wallet}

	<!-- Player Header -->
	<h1>Player Stats: <span title="{wallet}">{wallet.slice(0, 6)}…{wallet.slice(-4)}</span> <i class="icofont-copy-invert" on:click={() => navigator.clipboard.writeText(wallet ?? '')} /></h1>

	{#if playerData}

		<!-- Charts & Highlights -->
		<PlayerCharts {wallet} {playerData} />

		<!-- Player Event History -->
		<PlayerHistory {wallet} {playerData} />

	{/if}
{/if}

<!-- #################################################################################################### -->

<style>

	h1 {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: .5em;
		width: 81rem;
		margin: .5em 0;
		text-align: center;
	}

	i {
		font-size: .7em;
		cursor: pointer;
	}

	i:hover {
		color: var(--light-purple);
	}
	
</style>