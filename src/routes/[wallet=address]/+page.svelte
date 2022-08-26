<script lang="ts">

	// Imports:
	import { utils } from 'ethers';
	import { page } from '$app/stores';
	import { fetchPlayerData } from '$lib/data';
	import { getShortWallet } from '$lib/functions';
	import PlayerCharts from '$lib/PlayerCharts.svelte';
	import PlayerHistory from '$lib/PlayerHistory.svelte';
	import PlayerSummary from '$lib/PlayerSummary.svelte';

	// Type Imports:
	import type { Hash, PlayerData } from '$lib/types';

	// Initializations:
	let playerData: PlayerData | undefined;
	let dataLoaded: boolean = false;
	let loading: boolean = true;

	// Reactive Wallet:
	$: wallet = $page ? utils.getAddress($page.params.wallet) as Hash : undefined;

	// Reactive Player Data:
	$: getPlayerData(wallet);

	// Function to get player data from API:
	const getPlayerData = async (player: Hash | undefined) => {
		if(player) {
			dataLoaded = false;
			loading = true;
			playerData = await fetchPlayerData(player);
			if(playerData) {
				dataLoaded = true;
			}
			loading = false;
		}
	}
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>Pool Stats | {wallet ? `${getShortWallet(wallet)}` : 'Player Stats'}</title>
	<meta name="description" content="An app for all there is to see about PoolTogether statistics. Check out some individual wallet stats!" />
</svelte:head>

{#if wallet && playerData && dataLoaded}

	<!-- Player Summary -->
	<PlayerSummary {wallet} {playerData} />

	<!-- Charts & Highlights -->
	<PlayerCharts {wallet} {playerData} />

	<!-- Player Event History -->
	<PlayerHistory {wallet} {playerData} />

{:else}
	<div id="loadingModal">
		{#if loading}
			<img src="/images/loading.gif" alt="Loading">
			<h2>Searching up this beautiful player...</h2>
		{:else}
			<span class="error">
				<img src="/images/ngmi.webp" alt="Whoops">
				<h2>There was an issue loading data.</h2>
				<span>Refresh the page to try again, or scream at @Ncookie on Discord.</span>
			</span>
		{/if}
	</div>
{/if}

<!-- #################################################################################################### -->

<style>

	#loadingModal {
		display: flex;
		flex-direction: column;
		margin-top: 4em;
		text-align: center;
	}

	img {
		height: 5em;
		margin: 0 auto;
	}

	h2 {
		margin: 1em auto;
		font-size: 1em;
	}

	span.error {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	span.error img {
		height: 7em;
	}
	
</style>