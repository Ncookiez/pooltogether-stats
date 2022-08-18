<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { getChainName } from '$lib/functions';
	import { ethData, polyData, avaxData, opData, aggregatedData, multichainUsersData, lastUpdate } from '$lib/stores';
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
	const dataWorkerPath = '/workers/dataWorker.js';
	const dataCalculationTimeout = 120000;
	let dataLoaded = false;
	let loadingData = true;
	let drawsLoaded = false;
	let calculating = false;
	let usingLocalStorageData = false;
	let movingUsersDataFound = false;
	let multichainUsersDataFound = false;
	let mainContent: HTMLElement;
	let mainContentScrollY = 0;

	// Function to load data:
	const loadData = async () => {
		try {

			// Fetching & Assigning Draw Data:
			const draws = await fetchDraws();
			drawsLoaded = true;
			console.log(`Queried draw data from API.`);

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
				console.log(`${chain.toUpperCase()}: Queried all data from API.`);

				// Updating Status:
				if((chainLoadingProgress.eth + chainLoadingProgress.poly + chainLoadingProgress.avax + chainLoadingProgress.op) >= (chains.length * maxChainLoadingProgress)) {
					calculating = true;
				}
				if(chain === 'eth' && balances.timestamp) {
					if(balances.timestamp > $lastUpdate) {
						lastUpdate.set(balances.timestamp);
					} else if($lastUpdate > 0) {
						usingLocalStorageData = true;
					}
				}

				// Assigning Chain-Specific Data Through Workers:
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => { reject(`${chain.toUpperCase()}: Timed out during main data calculations.`); }, dataCalculationTimeout);
					const dataWorker = new Worker(dataWorkerPath);
					if(chain === 'eth') {
						ethData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.eth });
						dataWorker.postMessage([$ethData]);
						dataWorker.onmessage = (event) => {
							clearTimeout(timeout);
							ethData.set(event.data);
							resolve();
						}
					} else if(chain === 'poly') {
						polyData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.poly });
						dataWorker.postMessage([$polyData]);
						dataWorker.onmessage = (event) => {
							clearTimeout(timeout);
							polyData.set(event.data);
							resolve();
						}
					} else if(chain === 'avax') {
						avaxData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.avax });
						dataWorker.postMessage([$avaxData]);
						dataWorker.onmessage = (event) => {
							clearTimeout(timeout);
							avaxData.set(event.data);
							resolve();
						}
					} else if(chain === 'op') {
						opData.set({ deposits, withdrawals, claims, delegationsCreated, delegationsFunded, delegationsUpdated, delegationsWithdrawn, yields, supply, balances, draws: draws.op });
						dataWorker.postMessage([$opData]);
						dataWorker.onmessage = (event) => {
							clearTimeout(timeout);
							opData.set(event.data);
							resolve();
						}
					}
				});
				console.log(`${chain.toUpperCase()}: Calculated main stats.`);
			})());
			await Promise.all(promises);

			// Assigning Aggregated Data Through Workers:
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => { reject(`Timed out during aggregated data calculations.`); }, dataCalculationTimeout);
				const dataWorker = new Worker(dataWorkerPath);
				dataWorker.postMessage([$ethData, $polyData, $avaxData, $opData]);
				dataWorker.onmessage = (event) => {
					clearTimeout(timeout);
					aggregatedData.set(event.data);
					console.log(`Calculated aggregated data.`);
					resolve();
				}
			});

			// Assigning Moving Users Data & Multichain Users Data Through LocalStorage Or Workers:
			if(usingLocalStorageData) {
				const ethStoredMovingUsers = localStorage.getItem('ethMovingUsers');
				const polyStoredMovingUsers = localStorage.getItem('polyMovingUsers');
				const avaxStoredMovingUsers = localStorage.getItem('avaxMovingUsers');
				const opStoredMovingUsers = localStorage.getItem('opMovingUsers');
				if(ethStoredMovingUsers && polyStoredMovingUsers && avaxStoredMovingUsers && opStoredMovingUsers) {
					$ethData.movingUsers = JSON.parse(ethStoredMovingUsers);
					$polyData.movingUsers = JSON.parse(polyStoredMovingUsers);
					$avaxData.movingUsers = JSON.parse(avaxStoredMovingUsers);
					$opData.movingUsers = JSON.parse(opStoredMovingUsers);
					movingUsersDataFound = true;
					console.log(`Fetched moving users' data from local storage.`);
				}
				const multichainUsers = localStorage.getItem('multichainUsers');
				if(multichainUsers) {
					multichainUsersData.set(JSON.parse(multichainUsers));
					multichainUsersDataFound = true;
					console.log(`Fetched multichain users' data from local storage.`);
				}
			}
			if(!movingUsersDataFound) {
				let movingUsersPromises = chains.map(chain => (async () => {
					await new Promise<void>((resolve, reject) => {
						const timeout = setTimeout(() => { reject(`${chain.toUpperCase()}: Timed out during moving users' data calculations.`); }, dataCalculationTimeout);
						const dataWorker = new Worker(dataWorkerPath);
						const depositData = [$ethData.deposits.data, $polyData.deposits.data, $avaxData.deposits.data, $opData.deposits.data];
						if(chain === 'eth') {
							dataWorker.postMessage([$ethData.withdrawals.data, ...depositData]);
							dataWorker.onmessage = (event) => {
								clearTimeout(timeout);
								$ethData.movingUsers = event.data;
								resolve();
							}
						} else if(chain === 'poly') {
							dataWorker.postMessage([$polyData.withdrawals.data, ...depositData]);
							dataWorker.onmessage = (event) => {
								clearTimeout(timeout);
								$polyData.movingUsers = event.data;
								resolve();
							}
						} else if(chain === 'avax') {
							dataWorker.postMessage([$avaxData.withdrawals.data, ...depositData]);
							dataWorker.onmessage = (event) => {
								clearTimeout(timeout);
								$avaxData.movingUsers = event.data;
								resolve();
							}
						} else if(chain === 'op') {
							dataWorker.postMessage([$opData.withdrawals.data, ...depositData]);
							dataWorker.onmessage = (event) => {
								clearTimeout(timeout);
								$opData.movingUsers = event.data;
								resolve();
							}
						}
					});
					console.log(`${chain.toUpperCase()}: Calculated moving users' stats.`);
				})());
				await Promise.all(movingUsersPromises);
			}
			if(!multichainUsersDataFound) {
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => { reject(`Timed out during multichain users' data calculations.`); }, dataCalculationTimeout);
					const dataWorker = new Worker(dataWorkerPath);
					dataWorker.postMessage([$ethData.balances.data, $polyData.balances.data, $avaxData.balances.data, $opData.balances.data]);
					dataWorker.onmessage = (event) => {
						clearTimeout(timeout);
						multichainUsersData.set(event.data);
						resolve();
					}
				});
				console.log(`Calculated multichain users' stats.`);
			}

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
				{#if calculating}
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