<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { ethStats, ethData, polyStats, polyData, avaxStats, avaxData, opStats, opData, selectedChains, loading, advancedMode } from '$lib/stores';
	import * as api from '$lib/data';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	// Type Imports:
	import type { Chain, ChainData, ChainLoading } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const advancedDataLoadingTypes: (keyof ChainLoading['advanced'])[] = ['deposits', 'withdrawals', 'claims', 'delegationsCreated', 'delegationsFunded', 'delegationsUpdated', 'delegationsWithdrawn', 'yield', 'supply', 'balances'];
	const advancedStatsWorkerPath: string = '/workers/statsWorker.js';
	const advancedStatsWorkerTimeout: number = 120000;
	let basicStatsErrored: boolean = false;
	let mainContent: HTMLElement;
	let mainContentScrollY: number = 0;
	let loadingAdvancedData: boolean = false;

	// Reactive Loading Checks:
	$: basicStatsLoaded = chains.every(chain => !$selectedChains[chain] || $loading[chain].basic.stats === 'done');

	// Reactive Advanced Mode Functions:
	$: $advancedMode, loadAdvancedData();
	$: $ethData, $polyData, $avaxData, $opData, calculateAdvancedStats();

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
			$loading[chain].basic.stats = 'loading';
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
			$loading[chain].basic.stats = 'done';
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
			const latestDeposits = await api.fetchLastDeposits(chain);
			assignData(chain, 'deposits', latestDeposits);
			$loading[chain].basic.deposits = 'done';
		} catch(err) {
			console.error(err);
			$loading[chain].basic.deposits = 'failed';
		}
	}

	// Function to load latest delegations:
	const loadLatestDelegations = async (chain: Chain) => {
		try {
			$loading[chain].basic.delegations = 'loading';
			const latestDelegations = await api.fetchLastDelegations(chain);
			assignData(chain, 'delegationsFunded', latestDelegations);
			$loading[chain].basic.delegations = 'done';
		} catch(err) {
			console.error(err);
			$loading[chain].basic.delegations = 'failed';
		}
	}

	// Function to load advanced data:
	const loadAdvancedData = async () => {
		if($advancedMode && !loadingAdvancedData) {
			loadingAdvancedData = true;
			let promises = chains.map(chain => (async () => {

				// Fetching Deposits:
				try {
					$loading[chain].advanced.deposits = 'loading';
					const deposits = await api.fetchDeposits(chain);
					assignData(chain, 'deposits', deposits);
					$loading[chain].advanced.deposits = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.deposits = 'failed';
				}

				// Fetching Withdrawals:
				try {
					$loading[chain].advanced.withdrawals = 'loading';
					const withdrawals = await api.fetchWithdrawals(chain);
					assignData(chain, 'withdrawals', withdrawals);
					$loading[chain].advanced.withdrawals = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.withdrawals = 'failed';
				}

				// Fetching Claims:
				try {
					$loading[chain].advanced.claims = 'loading';
					const claims = await api.fetchClaims(chain);
					assignData(chain, 'claims', claims);
					$loading[chain].advanced.claims = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.claims = 'failed';
				}

				// Fetching Delegations Created:
				try {
					$loading[chain].advanced.delegationsCreated = 'loading';
					const delegationsCreated = await api.fetchDelegationsCreated(chain);
					assignData(chain, 'delegationsCreated', delegationsCreated);
					$loading[chain].advanced.delegationsCreated = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.delegationsCreated = 'failed';
				}

				// Fetching Delegations Funded:
				try {
					$loading[chain].advanced.delegationsFunded = 'loading';
					const delegationsFunded = await api.fetchDelegationsFunded(chain);
					assignData(chain, 'delegationsFunded', delegationsFunded);
					$loading[chain].advanced.delegationsFunded = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.delegationsFunded = 'failed';
				}

				// Fetching Delegations Updated:
				try {
					$loading[chain].advanced.delegationsUpdated = 'loading';
					const delegationsUpdated = await api.fetchDelegationsUpdated(chain);
					assignData(chain, 'delegationsUpdated', delegationsUpdated);
					$loading[chain].advanced.delegationsUpdated = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.delegationsUpdated = 'failed';
				}

				// Fetching Delegations Withdrawn:
				try {
					$loading[chain].advanced.delegationsWithdrawn = 'loading';
					const delegationsWithdrawn = await api.fetchDelegationsWithdrawn(chain);
					assignData(chain, 'delegationsWithdrawn', delegationsWithdrawn);
					$loading[chain].advanced.delegationsWithdrawn = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.delegationsWithdrawn = 'failed';
				}

				// Fetching Yields:
				try {
					$loading[chain].advanced.yield = 'loading';
					const yields = await api.fetchYield(chain);
					assignData(chain, 'yields', yields);
					$loading[chain].advanced.yield = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.yield = 'failed';
				}

				// Fetching Supply:
				try {
					$loading[chain].advanced.supply = 'loading';
					const supply = await api.fetchSupply(chain);
					assignData(chain, 'supply', supply);
					$loading[chain].advanced.supply = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.supply = 'failed';
				}

				// Fetching Balances:
				try {
					$loading[chain].advanced.balances = 'loading';
					const balances = await api.fetchBalances(chain);
					assignData(chain, 'balances', balances);
					$loading[chain].advanced.balances = 'done';
				} catch(err) {
					console.error(err);
					$loading[chain].advanced.balances = 'failed';
				}

			})());
			await Promise.all(promises);
		}
	}

	// Function to calculate advanced stats:
	const calculateAdvancedStats = async () => {
		if($advancedMode && $loading.draws === 'done') {

			// Ethereum Stats:
			if($loading.eth.advanced.stats !== 'done' && $loading.eth.advanced.stats !== 'loading' && advancedDataLoadingTypes.every(type => $loading.eth.advanced[type] === 'done')) {
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => { $loading.eth.advanced.stats = 'failed'; reject(`ETH: Timed out while calculating advanced stats.`); }, advancedStatsWorkerTimeout);
					const dataWorker = new Worker(advancedStatsWorkerPath);
					dataWorker.postMessage($ethData);
					dataWorker.onmessage = (event) => {
						clearTimeout(timeout);
						ethData.set(event.data);
						$loading.eth.advanced.stats = 'done';
						resolve();
					}
				});
			}

			// Polygon Stats:
			if($loading.poly.advanced.stats !== 'done' && $loading.poly.advanced.stats !== 'loading' && advancedDataLoadingTypes.every(type => $loading.poly.advanced[type] === 'done')) {
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => { $loading.poly.advanced.stats = 'failed'; reject(`POLY: Timed out while calculating advanced stats.`); }, advancedStatsWorkerTimeout);
					const dataWorker = new Worker(advancedStatsWorkerPath);
					dataWorker.postMessage($polyData);
					dataWorker.onmessage = (event) => {
						clearTimeout(timeout);
						polyData.set(event.data);
						$loading.poly.advanced.stats = 'done';
						resolve();
					}
				});
			}

			// Avalanche Stats:
			if($loading.avax.advanced.stats !== 'done' && $loading.avax.advanced.stats !== 'loading' && advancedDataLoadingTypes.every(type => $loading.avax.advanced[type] === 'done')) {
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => { $loading.avax.advanced.stats = 'failed'; reject(`AVAX: Timed out while calculating advanced stats.`); }, advancedStatsWorkerTimeout);
					const dataWorker = new Worker(advancedStatsWorkerPath);
					dataWorker.postMessage($avaxData);
					dataWorker.onmessage = (event) => {
						clearTimeout(timeout);
						avaxData.set(event.data);
						$loading.avax.advanced.stats = 'done';
						resolve();
					}
				});
			}

			// Optimism Stats:
			if($loading.op.advanced.stats !== 'done' && $loading.op.advanced.stats !== 'loading' && advancedDataLoadingTypes.every(type => $loading.op.advanced[type] === 'done')) {
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => { $loading.op.advanced.stats = 'failed'; reject(`OP: Timed out while calculating advanced stats.`); }, advancedStatsWorkerTimeout);
					const dataWorker = new Worker(advancedStatsWorkerPath);
					dataWorker.postMessage($opData);
					dataWorker.onmessage = (event) => {
						clearTimeout(timeout);
						opData.set(event.data);
						$loading.op.advanced.stats = 'done';
						resolve();
					}
				});
			}
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
		loadDraws();
		chains.forEach(chain => {
			loadBasicStats(chain);
			loadLatestDeposits(chain);
			loadLatestDelegations(chain);
		});
		loadAdvancedData();
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