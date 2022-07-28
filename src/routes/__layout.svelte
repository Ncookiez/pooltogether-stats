<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { ethData, polyData, avaxData, opData } from '$lib/stores';
	import { fetchDeposits, fetchWithdrawals, fetchClaims, fetchDelegationsCreated, fetchDelegationsFunded, fetchDelegationsUpdated, fetchDelegationsWithdrawn, fetchYield, fetchSupply, fetchBalances, fetchDraws } from '$lib/data';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const maxLoadingProgress = (10 * chains.length) + 1;
	let dataLoaded = false;
	let loadingData = true;
	let ethLoadingProgress = 0;
	let polyLoadingProgress = 0;
	let avaxLoadingProgress = 0;
	let opLoadingProgress = 0;
	let drawsLoadingProgress = 0;

	// Reactive Loading Progress:
	$: loadingProgress = ethLoadingProgress + polyLoadingProgress + avaxLoadingProgress + opLoadingProgress + drawsLoadingProgress;

	// <TODO> need local caching to only query all data if update has happened

	// Function to load data:
	const loadData = async () => {
		try {

			// Fetching & Assigning Draw Data:
			const draws = await fetchDraws();
			drawsLoadingProgress++;
			$ethData.draws = draws.eth;
			$polyData.draws = draws.poly;
			$avaxData.draws = draws.avax;
			$opData.draws = draws.op;

			let promises = chains.map(chain => (async () => {

				// Fetching Chain-Specific Data:
				const deposits = await fetchDeposits(chain);
				updateLoadingProgress(chain);
				const withdrawals = await fetchWithdrawals(chain);
				updateLoadingProgress(chain);
				const claims = await fetchClaims(chain);
				updateLoadingProgress(chain);
				const delegationsCreated = await fetchDelegationsCreated(chain);
				updateLoadingProgress(chain);
				const delegationsFunded = await fetchDelegationsFunded(chain);
				updateLoadingProgress(chain);
				const delegationsUpdated = await fetchDelegationsUpdated(chain);
				updateLoadingProgress(chain);
				const delegationsWithdrawn = await fetchDelegationsWithdrawn(chain);
				updateLoadingProgress(chain);
				const yields = await fetchYield(chain);
				updateLoadingProgress(chain);
				const supply = await fetchSupply(chain);
				updateLoadingProgress(chain);
				const balances = await fetchBalances(chain);
				updateLoadingProgress(chain);

				// Assigning Chain-Specific Data:
				if(chain === 'eth') {
					$ethData.deposits = deposits;
					$ethData.withdrawals = withdrawals;
					$ethData.claims = claims;
					$ethData.delegationsCreated = delegationsCreated;
					$ethData.delegationsFunded = delegationsFunded;
					$ethData.delegationsUpdated = delegationsUpdated;
					$ethData.delegationsWithdrawn = delegationsWithdrawn;
					$ethData.yield = yields;
					$ethData.supply = supply;
					$ethData.balances = balances;
				} else if(chain === 'poly') {
					$polyData.deposits = deposits;
					$polyData.withdrawals = withdrawals;
					$polyData.claims = claims;
					$polyData.delegationsCreated = delegationsCreated;
					$polyData.delegationsFunded = delegationsFunded;
					$polyData.delegationsUpdated = delegationsUpdated;
					$polyData.delegationsWithdrawn = delegationsWithdrawn;
					$polyData.yield = yields;
					$polyData.supply = supply;
					$polyData.balances = balances;
				} else if(chain === 'avax') {
					$avaxData.deposits = deposits;
					$avaxData.withdrawals = withdrawals;
					$avaxData.claims = claims;
					$avaxData.delegationsCreated = delegationsCreated;
					$avaxData.delegationsFunded = delegationsFunded;
					$avaxData.delegationsUpdated = delegationsUpdated;
					$avaxData.delegationsWithdrawn = delegationsWithdrawn;
					$avaxData.yield = yields;
					$avaxData.supply = supply;
					$avaxData.balances = balances;
				} else if(chain === 'op') {
					$opData.deposits = deposits;
					$opData.withdrawals = withdrawals;
					$opData.claims = claims;
					$opData.delegationsCreated = delegationsCreated;
					$opData.delegationsFunded = delegationsFunded;
					$opData.delegationsUpdated = delegationsUpdated;
					$opData.delegationsWithdrawn = delegationsWithdrawn;
					$opData.yield = yields;
					$opData.supply = supply;
					$opData.balances = balances;
				}
			})());
			await Promise.all(promises);
			return true;
		} catch {
			return false;
		} finally {
			loadingData = false;
		}
	}

	// Function to update loading progress:
	const updateLoadingProgress = (chain: Chain) => {
		if(chain === 'eth') {
			ethLoadingProgress++;
		} else if(chain === 'poly') {
			polyLoadingProgress++;
		} else if(chain === 'avax') {
			avaxLoadingProgress++;
		} else if(chain === 'op') {
			opLoadingProgress++;
		}
	}

	onMount(async () => {
		dataLoaded = await loadData();
	});
	
</script>

<!-- #################################################################################################### -->

<!-- Navbar -->
<Navbar />

<!-- App Content -->
<main>
	{#if dataLoaded}
		<slot />
	{:else}
		<div id="loadingModal">
			{#if loadingData}
				<span>Loading data... ({loadingProgress}/{maxLoadingProgress})</span>
			{:else}
				<span>There seems to have been an issue loading data.</span>
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
		flex-direction: column;
		align-items: center;
		overflow: hidden auto;
	}

	#loadingModal {
		position: absolute;
		inset: 0;
		margin: 20vh 40vw;
	}

</style>