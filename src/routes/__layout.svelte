<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { ethData, polyData, avaxData, opData, aggregatedData } from '$lib/stores';
	import { fetchDeposits, fetchWithdrawals, fetchClaims, fetchDelegationsCreated, fetchDelegationsFunded, fetchDelegationsUpdated, fetchDelegationsWithdrawn, fetchYield, fetchSupply, fetchBalances, fetchDraws } from '$lib/data';
	import { getChainName, getTimestamps, getDepositsOverTime, getWithdrawalsOverTime, getClaimsOverTime, getTVLOverTime, getDelegationsOverTime, getYieldOverTime, getWalletData, getWinlessWithdrawals, getMovingUsers, getTVLDistribution, getAggregatedData } from '$lib/functions';
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const chainLoadingProgress: Record<Chain, number> = { eth: 0, poly: 0, avax: 0, op: 0 };
	const maxChainLoadingProgress = 10;
	const ticks = 50;
	let dataLoaded = false;
	let loadingData = true;
	let drawsLoaded = false;
	let mainContent: HTMLElement;
	let mainContentScrollY = 0;

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
					[$ethData.minTimestamp, $ethData.maxTimestamp] = getTimestamps($ethData, 1);
					$ethData.depositsOverTime = getDepositsOverTime($ethData, ticks);
					$ethData.withdrawalsOverTime = getWithdrawalsOverTime($ethData, ticks);
					$ethData.claimsOverTime = getClaimsOverTime($ethData, ticks);
					$ethData.tvlOverTime = getTVLOverTime($ethData.depositsOverTime, $ethData.withdrawalsOverTime, $ethData.claimsOverTime);
					$ethData.delegationsOverTime = getDelegationsOverTime($ethData, ticks);
					$ethData.yieldOverTime = getYieldOverTime($ethData, ticks);
					$ethData.wallets = getWalletData($ethData);
					$ethData.winlessWithdrawals = getWinlessWithdrawals($ethData.wallets);
					$ethData.tvlDistribution = getTVLDistribution($ethData.balances.data);
				} else if(chain === 'poly') {
					polyData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.poly });
					[$polyData.minTimestamp, $polyData.maxTimestamp] = getTimestamps($polyData, 1);
					$polyData.depositsOverTime = getDepositsOverTime($polyData, ticks);
					$polyData.withdrawalsOverTime = getWithdrawalsOverTime($polyData, ticks);
					$polyData.claimsOverTime = getClaimsOverTime($polyData, ticks);
					$polyData.tvlOverTime = getTVLOverTime($polyData.depositsOverTime, $polyData.withdrawalsOverTime, $polyData.claimsOverTime);
					$polyData.delegationsOverTime = getDelegationsOverTime($polyData, ticks);
					$polyData.yieldOverTime = getYieldOverTime($polyData, ticks);
					$polyData.wallets = getWalletData($polyData);
					$polyData.winlessWithdrawals = getWinlessWithdrawals($polyData.wallets);
					$polyData.tvlDistribution = getTVLDistribution($polyData.balances.data);
				} else if(chain === 'avax') {
					avaxData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.avax });
					[$avaxData.minTimestamp, $avaxData.maxTimestamp] = getTimestamps($avaxData, 1);
					$avaxData.depositsOverTime = getDepositsOverTime($avaxData, ticks);
					$avaxData.withdrawalsOverTime = getWithdrawalsOverTime($avaxData, ticks);
					$avaxData.claimsOverTime = getClaimsOverTime($avaxData, ticks);
					$avaxData.tvlOverTime = getTVLOverTime($avaxData.depositsOverTime, $avaxData.withdrawalsOverTime, $avaxData.claimsOverTime);
					$avaxData.delegationsOverTime = getDelegationsOverTime($avaxData, ticks);
					$avaxData.yieldOverTime = getYieldOverTime($avaxData, ticks);
					$avaxData.wallets = getWalletData($avaxData);
					$avaxData.winlessWithdrawals = getWinlessWithdrawals($avaxData.wallets);
					$avaxData.tvlDistribution = getTVLDistribution($avaxData.balances.data);
				} else if(chain === 'op') {
					opData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.op });
					[$opData.minTimestamp, $opData.maxTimestamp] = getTimestamps($opData, 1);
					$opData.depositsOverTime = getDepositsOverTime($opData, ticks);
					$opData.withdrawalsOverTime = getWithdrawalsOverTime($opData, ticks);
					$opData.claimsOverTime = getClaimsOverTime($opData, ticks);
					$opData.tvlOverTime = getTVLOverTime($opData.depositsOverTime, $opData.withdrawalsOverTime, $opData.claimsOverTime);
					$opData.delegationsOverTime = getDelegationsOverTime($opData, ticks);
					$opData.yieldOverTime = getYieldOverTime($opData, ticks);
					$opData.wallets = getWalletData($opData);
					$opData.winlessWithdrawals = getWinlessWithdrawals($opData.wallets);
					$opData.tvlDistribution = getTVLDistribution($opData.balances.data);
				}
				
			})());
			await Promise.all(promises);

			// Assigning Extra Multi-Chain Data:
			$ethData.movingUsers = getMovingUsers($ethData.withdrawals.data, $ethData.deposits.data, $polyData.deposits.data, $avaxData.deposits.data, $opData.deposits.data);
			$polyData.movingUsers = getMovingUsers($polyData.withdrawals.data, $ethData.deposits.data, $polyData.deposits.data, $avaxData.deposits.data, $opData.deposits.data);
			$avaxData.movingUsers = getMovingUsers($avaxData.withdrawals.data, $ethData.deposits.data, $polyData.deposits.data, $avaxData.deposits.data, $opData.deposits.data);
			$opData.movingUsers = getMovingUsers($opData.withdrawals.data, $ethData.deposits.data, $polyData.deposits.data, $avaxData.deposits.data, $opData.deposits.data);

			// Assigning Aggregated Data:
			aggregatedData.set(getAggregatedData($ethData, $polyData, $avaxData, $opData));

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
<main bind:this={mainContent} on:scroll={() => mainContentScrollY = mainContent.scrollTop}>
	{#if dataLoaded}
		<slot />
		<div id="scrollButton" class:hide={mainContentScrollY >= mainContent.scrollHeight - window.innerHeight} on:click={() => mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' })}>
			<i class="icofont-arrow-down" />
		</div>
	{:else}
		<div id="loadingModal">
			{#if loadingData}
				<img src="/images/loading.gif" alt="Loading">
				{#if chainLoadingProgress.eth === maxChainLoadingProgress && chainLoadingProgress.poly === maxChainLoadingProgress && chainLoadingProgress.avax === maxChainLoadingProgress && chainLoadingProgress.op === maxChainLoadingProgress}
					<h2>Wrapping up some calculations...</h2>
				{:else}
					<h2>Initializing some data... (this may take a couple minutes)</h2>
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
				{/if}
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