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

	// Function to load data:
	const loadData = async () => {
		try {

			// Fetching & Assigning Draw Data:
			const draws = await fetchDraws();
			drawsLoadingProgress++;

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
					ethData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.eth });
				} else if(chain === 'poly') {
					polyData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.poly });
				} else if(chain === 'avax') {
					avaxData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.avax });
				} else if(chain === 'op') {
					opData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.op });
				}
				
			})());
			await Promise.all(promises);
			return true;
		} catch(err) {
			console.error(err);
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