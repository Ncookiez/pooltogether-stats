<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { fetchDeposits, fetchWithdrawals } from '$lib/data';
	import { ethData, polyData, avaxData, opData } from '$lib/stores';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const maxChainLoadingProgress = 2;
	let dataLoaded = false;
	let loadingData = true;
	let ethLoadingProgress = 0;
	let polyLoadingProgress = 0;
	let avaxLoadingProgress = 0;
	let opLoadingProgress = 0;

	// Reactive Loading Progress:
	$: loadingProgress = ethLoadingProgress + polyLoadingProgress + avaxLoadingProgress + opLoadingProgress;

	// Function to load data:
	const loadData = async () => {
		try {
			let promises = chains.map(chain => (async () => {
				const deposits = await fetchDeposits(chain);
				updateLoadingProgress(chain);
				const withdrawals = await fetchWithdrawals(chain);
				updateLoadingProgress(chain);
				if(chain === 'eth') {
					$ethData.deposits = deposits;
					$ethData.withdrawals = withdrawals;
				} else if(chain === 'poly') {
					$polyData.deposits = deposits;
					$polyData.withdrawals = withdrawals;
				} else if(chain === 'avax') {
					$avaxData.deposits = deposits;
					$avaxData.withdrawals = withdrawals;
				} else if(chain === 'op') {
					$opData.deposits = deposits;
					$opData.withdrawals = withdrawals;
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
				<span>Loading data... ({loadingProgress}/{maxChainLoadingProgress * chains.length})</span>
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