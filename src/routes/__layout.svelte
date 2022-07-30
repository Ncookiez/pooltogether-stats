<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { getChainName } from '$lib/functions';
	import { ethData, polyData, avaxData, opData } from '$lib/stores';
	import { fetchDeposits, fetchWithdrawals, fetchClaims, fetchDelegationsCreated, fetchDelegationsFunded, fetchDelegationsUpdated, fetchDelegationsWithdrawn, fetchYield, fetchSupply, fetchBalances, fetchDraws } from '$lib/data';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const chainLoadingProgress: Record<Chain, number> = { eth: 0, poly: 0, avax: 0, op: 0 };
	const maxChainLoadingProgress = 10;
	let dataLoaded = true; // <TODO> turn to false before full deployment
	let loadingData = true;
	let drawsLoaded = false;

	// Function to load data:
	const loadData = async () => {
		try {

			// Fetching & Assigning Draw Data:
			const draws = await fetchDraws();
			drawsLoaded = true;

			let promises = chains.map(chain => (async () => {

				// Fetching Chain-Specific Data:
				const deposits = await fetchDeposits(chain);
				chainLoadingProgress[chain]++;
				const withdrawals = await fetchWithdrawals(chain);
				chainLoadingProgress[chain]++;
				const claims = await fetchClaims(chain);
				chainLoadingProgress[chain]++;
				const delegationsCreated = await fetchDelegationsCreated(chain);
				chainLoadingProgress[chain]++;
				const delegationsFunded = await fetchDelegationsFunded(chain);
				chainLoadingProgress[chain]++;
				const delegationsUpdated = await fetchDelegationsUpdated(chain);
				chainLoadingProgress[chain]++;
				const delegationsWithdrawn = await fetchDelegationsWithdrawn(chain);
				chainLoadingProgress[chain]++;
				const yields = await fetchYield(chain);
				chainLoadingProgress[chain]++;
				const supply = await fetchSupply(chain);
				chainLoadingProgress[chain]++;
				const balances = await fetchBalances(chain);
				chainLoadingProgress[chain]++;

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

	onMount(async () => {
		if(!dataLoaded) {
			dataLoaded = await loadData();
		}
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
				<img src="/images/loading.gif" alt="Loading">
				<h2>Initializing some data... (This may take a minute)</h2>
				{#if !drawsLoaded}
					<span class="dataProgress" transition:slide|local>
						<span class="type">Prize Draw Data...</span>
						<span class="status">
							<img src="/images/excitedPooly.gif" alt="Pooly">
							<img class="trophy" src="/images/trophy.webp" alt="Trophy">
						</span>
					</span>
				{/if}
				{#each chains as chain}
					{#if chainLoadingProgress[chain] < maxChainLoadingProgress}
						<span class="dataProgress" transition:slide|local>
							<span class="type">{getChainName(chain)} Data...</span>
							<span class="status">
								<img src="/images/excitedPooly.gif" alt="Pooly" style="margin-left: {(chainLoadingProgress[chain] / maxChainLoadingProgress) * 80}%">
								<img class="trophy" src="/images/trophy.webp" alt="Trophy">
							</span>
						</span>
					{/if}
				{/each}
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
		flex-direction: column;
		align-items: center;
		overflow: hidden auto;
	}

	#loadingModal {
		display: flex;
		flex-direction: column;
		margin-top: calc(var(--navbar-height) + 5em);
	}

	img {
		height: 5em;
		margin: 0 auto;
	}

	h2 {
		margin: 1em auto;
		font-size: 1em;
	}

	span.dataProgress {
		display: flex;
		align-items: center;
		margin: .5em 1em;
		white-space: nowrap;
	}

	span.type {
		display: flex;
		align-items: center;
		width: 15ch;
	}

	span.status {
		display: flex;
		align-items: center;
		flex: 1;
	}

	span.status img {
		height: 1.5em;
		margin: 0;
	}

	span.status img.trophy {
		margin-left: auto;
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