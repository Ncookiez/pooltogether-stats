<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { fetchStats, fetchDraws, fetchDeposits, fetchDelegationsFunded } from '$lib/data';
	import { ethStats, ethData, polyStats, polyData, avaxStats, avaxData, opStats, opData, selectedChains, loading } from '$lib/stores';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const numLatestTXs: number = 1000;
	let basicStatsErrored: boolean = false;
	let mainContent: HTMLElement;
	let mainContentScrollY: number = 0;

	// Reactive Loading Check:
	$: basicStatsLoaded = chains.every(chain => $loading[chain].basic.stats === 'done');

	// Function to load draws:
	const loadDraws = async () => {
		try {
			$loading.draws = 'loading';
			const draws = await fetchDraws();
			$ethData.draws = draws.eth;
			$polyData.draws = draws.poly;
			$avaxData.draws = draws.avax;
			$opData.draws = draws.op;
			$loading.draws = 'done';
			console.log(`Queried draw data from API.`);
		} catch(err) {
			console.error(err);
			$loading.draws = 'failed';
		}
	}

	// Function to load basic stats:
	const loadBasicStats = async (chain: Chain) => {
		try {
			$loading[chain].basic.stats = 'loading';
			const stats = await fetchStats(chain);
			if(chain === 'eth') {
				ethStats.set(stats);
			} else if(chain === 'poly') {
				polyStats.set(stats);
			} else if(chain === 'avax') {
				avaxStats.set(stats);
			} else if(chain === 'op') {
				opStats.set(stats);
			}
			$loading[chain].basic.stats = 'done';
			console.log(`${chain.toUpperCase()}: Queried stats from API.`);
		} catch(err) {
			console.error(err);
			$loading[chain].basic.stats = 'failed';
			basicStatsErrored = true;
		}
	}

	// Function to load latest deposits:
	const loadLatestDeposits = async (chain: Chain) => {
		try {
			$loading[chain].basic.deposits = 'loading';
			const latestDeposits = await fetchDeposits(chain, numLatestTXs, 0);
			if(chain === 'eth') {
				$ethData.deposits = latestDeposits;
			} else if(chain === 'poly') {
				$polyData.deposits = latestDeposits;
			} else if(chain === 'avax') {
				$avaxData.deposits = latestDeposits;
			} else if(chain === 'op') {
				$opData.deposits = latestDeposits;
			}
			$loading[chain].basic.deposits = 'done';
			console.log(`${chain.toUpperCase()}: Queried latest deposits from API.`);
		} catch(err) {
			console.error(err);
			$loading[chain].basic.deposits = 'failed';
		}
	}

	// Function to load latest delegations:
	const loadLatestDelegations = async (chain: Chain) => {
		try {
			$loading[chain].basic.delegations = 'loading';
			const latestDelegations = await fetchDelegationsFunded(chain, numLatestTXs, 0);
			if(chain === 'eth') {
				$ethData.delegationsFunded = latestDelegations;
			} else if(chain === 'poly') {
				$polyData.delegationsFunded = latestDelegations;
			} else if(chain === 'avax') {
				$avaxData.delegationsFunded = latestDelegations;
			} else if(chain === 'op') {
				$opData.delegationsFunded = latestDelegations;
			}
			$loading[chain].basic.delegations = 'done';
			console.log(`${chain.toUpperCase()}: Queried latest delegations from API.`);
		} catch(err) {
			console.error(err);
			$loading[chain].basic.delegations = 'failed';
		}
	}

	onMount(() => {
		loadDraws();
		chains.forEach(chain => {
			loadBasicStats(chain);
			loadLatestDeposits(chain);
			loadLatestDelegations(chain);
		});
	});
	
</script>

<!-- #################################################################################################### -->

<!-- Navbar -->
<Navbar />

<!-- App Content -->
<main bind:this={mainContent} on:scroll={() => mainContentScrollY = mainContent.scrollTop}>
	{#if basicStatsLoaded}
		<slot />
		<div id="scrollButton" class:hide={mainContentScrollY >= mainContent.scrollHeight - window.innerHeight} on:click={() => mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' })}>
			<i class="icofont-arrow-down" />
		</div>
	{:else}
		<div id="loadingModal">
			{#if !basicStatsErrored}
				<img src="/images/loading.gif" alt="Loading">
				<h2>Looking for some data...</h2>
			{:else}
				<span class="error">
					<img src="/images/ngmi.webp" alt="Whoops">
					<h2>There was an issue loading data.</h2>
					<span>Refresh the page to try again, or scream at @Ncookie on Discord.</span>
				</span>
			{/if}
		</div>
	{/if}
</main>

<!-- Footer -->
<Footer />

<!-- #################################################################################################### -->

<style>

	main {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 1em;
		max-height: calc(100vh - var(--navbar-height) - 50px);
		margin-top: var(--navbar-height);
		padding: 2em;
		overflow: hidden auto;
	}

	#scrollButton {
		position: fixed;
		inset: auto 2em calc(1.5em + 50px) auto;
		display: flex;
		padding: 1em;
		background: var(--light-purple);
		border-radius: 50%;
		cursor: pointer;
		z-index: 1;
	}

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