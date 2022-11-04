<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { ethStats, ethData, polyStats, polyData, avaxStats, avaxData, opStats, opData, selectedChains, loading } from '$lib/stores';
	import * as api from '$lib/data';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	// Type Imports:
	import type { Chain, ChainData } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const maintenanceMode: boolean = true;
	let basicStatsErrored: boolean = false;
	let mainContent: HTMLElement;
	let mainContentScrollY: number = 0;

	// Reactive Loading Checks:
	$: basicStatsLoaded = chains.every(chain => !$selectedChains[chain] || $loading[chain].stats === 'done');

	// Function to load draws:
	const loadDraws = async () => {
		try {
			$loading.draws = 'loading';
			const draws = await api.fetchDraws();
			$ethData.draws = draws.eth;
			$polyData.draws = draws.poly;
			$avaxData.draws = draws.avax;
			$opData.draws = draws.op;
			$loading.draws = 'done';
		} catch(err) {
			console.error(err);
			$loading.draws = 'failed';
		}
	}

	// Function to load basic stats:
	const loadBasicStats = async (chain: Chain) => {
		try {
			$loading[chain].stats = 'loading';
			const stats = await api.fetchStats(chain);
			if(chain === 'eth') {
				ethStats.set(stats);
			} else if(chain === 'poly') {
				polyStats.set(stats);
			} else if(chain === 'avax') {
				avaxStats.set(stats);
			} else if(chain === 'op') {
				opStats.set(stats);
			}
			$loading[chain].stats = 'done';
		} catch(err) {
			console.error(err);
			$loading[chain].stats = 'failed';
			basicStatsErrored = true;
		}
	}

	// Function to load latest deposits:
	const loadLatestDeposits = async (chain: Chain) => {
		try {
			$loading[chain].deposits = 'loading';
			const latestDeposits = await api.fetchLastDeposits(chain);
			assignData(chain, 'deposits', latestDeposits);
			$loading[chain].deposits = 'done';
		} catch(err) {
			console.error(err);
			$loading[chain].deposits = 'failed';
		}
	}

	// Function to load latest delegations:
	const loadLatestDelegations = async (chain: Chain) => {
		try {
			$loading[chain].delegations = 'loading';
			const latestDelegations = await api.fetchLastDelegations(chain);
			assignData(chain, 'delegationsFunded', latestDelegations);
			$loading[chain].delegations = 'done';
		} catch(err) {
			console.error(err);
			$loading[chain].delegations = 'failed';
		}
	}

	// Function to assign data to proper chain:
	const assignData = (chain: Chain, dataType: keyof ChainData, data: any) => {
		if(chain === 'eth') {
			$ethData[dataType] = data;
		} else if(chain === 'poly') {
			$polyData[dataType] = data;
		} else if(chain === 'avax') {
			$avaxData[dataType] = data;
		} else if(chain === 'op') {
			$opData[dataType] = data;
		}
	}

	onMount(() => {
		if(!maintenanceMode) {
			loadDraws();
			chains.forEach(chain => {
				loadBasicStats(chain);
				loadLatestDeposits(chain);
				loadLatestDelegations(chain);
			});
		}
	});
	
</script>

<!-- #################################################################################################### -->

<!-- Navbar -->
<Navbar {maintenanceMode} />

<!-- App Content -->
<main bind:this={mainContent} on:scroll={() => mainContentScrollY = mainContent.scrollTop}>
	{#if !maintenanceMode}
		{#if basicStatsLoaded}
			<slot />
			<div id="scrollButton" class:hide={mainContentScrollY >= mainContent.scrollHeight - window.innerHeight} on:click={() => mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' })} on:keydown={() => mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' })}>
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
						<span>Refresh the page to try again, or scream at Ncookie on Discord.</span>
					</span>
				{/if}
			</div>
		{/if}
	{:else}
		<div id="maintenanceMode">
			<h3>Pooly is currently sleeping.</h3>
			<img src="/images/sleeping.png" alt="Sleeping Pooly">
			<span>The site will be back up shortly - for any questions please reach out to Ncookie on Discord.</span>
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

	#maintenanceMode {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2em;
		margin-top: 5em;
		text-align: center;
	}

	#maintenanceMode > img {
		height: 5em;
		width: auto;
	}

</style>