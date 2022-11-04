<script lang="ts">

	// Imports:
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import { getChainName, timestampToISO } from "$lib/functions";
	import { ethData, polyData, avaxData, opData, startTimestamp, endTimestamp, selectedChains, loading, advancedMode } from '$lib/stores';

	// Type Imports:
	import type { Chain, ChainData } from '$lib/types';

	// Initializations:
	export let maintenanceMode: boolean = false;
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const maxChainLoadingProgress = 11;
	const requireDrawsForAdvancedStats: boolean = false;
	const defaultMinTimestamp = 1_634_256_000;
	const defaultMaxTimestamp = 9_999_999_999;
	const dayInSeconds = 86400;
	let searchModalOpen = false;
	let advancedModeModalOpen = false;
	let searchWallet = '';
	let minDateValue: string | undefined;
	let maxDateValue: string | undefined;
	let chainDownload: Chain = 'eth';
	let typeDownload: keyof ChainData = 'deposits';

	// Downloads Available:
	const downloadsAvailable: { file: keyof ChainData, name: string }[] = [
		{ file: 'deposits', name: 'Deposits' },
		{ file: 'withdrawals', name: 'Withdrawals' },
		{ file: 'claims', name: 'Claims' },
		{ file: 'delegationsCreated', name: 'Delegations Created' },
		{ file: 'delegationsFunded', name: 'Delegations Funded' },
		{ file: 'delegationsUpdated', name: 'Delegations Updated' },
		{ file: 'delegationsWithdrawn', name: 'Delegations Withdrawn' },
		{ file: 'yields', name: 'Yield Collected' },
		{ file: 'supply', name: 'Token Supplies' },
		{ file: 'balances', name: 'Player Balances' },
		{ file: 'draws', name: 'Draws' }
	];

	// Reactive Loading Checks:
	$: advancedDataLoaded = $advancedMode && chains.every(chain => $loading[chain].advanced.progress >= (maxChainLoadingProgress - 1));
	$: advancedStatsLoaded = $advancedMode && chains.every(chain => $loading[chain].advanced.stats === 'done');
	$: advancedStatsErrored = $advancedMode && !chains.every(chain => Object.values($loading[chain].advanced).every(value => value !== 'failed'));

	// Reactive Min/Max Timestamps:
	$: minDate = timestampToISO(defaultMinTimestamp);
	$: maxDate = timestampToISO((Date.now() / 1000) + dayInSeconds);

	// Function to search for given wallet:
	const search = () => {
		if(searchWallet.startsWith('0x') && searchWallet.length === 42) {
			goto(`/${searchWallet}`);
			searchWallet = '';
			searchModalOpen = false;
		}
	}

	// Function to update timestamp stores:
	const updateTimestampStores = () => {
		const minTimeValue = minDateValue ? Date.parse(minDateValue) / 1000 : undefined;
		const maxTimeValue = maxDateValue ? (Date.parse(maxDateValue) / 1000) + (dayInSeconds - 1) : undefined;
		minTimeValue ? startTimestamp.set(minTimeValue) : startTimestamp.set(defaultMinTimestamp);
		if(maxTimeValue) {
			if(minTimeValue) {
				if(maxTimeValue > minTimeValue) {
					endTimestamp.set(maxTimeValue);
				} else {
					endTimestamp.set(defaultMaxTimestamp);
				}
			} else {
				endTimestamp.set(maxTimeValue);
			}
		} else {
			endTimestamp.set(defaultMaxTimestamp);
		}
	}

	// Function to download data:
	const downloadData = () => {
		let chainData: ChainData | undefined;
		if(chainDownload === 'eth') {
			chainData = $ethData;
		} else if(chainDownload === 'poly') {
			chainData = $polyData;
		} else if(chainDownload === 'avax') {
			chainData = $avaxData;
		} else if(chainDownload === 'op') {
			chainData = $opData;
		}
		if(chainData) {
			let jsonContent = 'data:text/json;charset=utf-8,' + encodeURI(JSON.stringify(chainData[typeDownload], null, ' '));
			let fileName = `${chainDownload}${typeDownload.charAt(0).toUpperCase() + typeDownload.slice(1)}.json`;
			let link = document.createElement('a');
			link.setAttribute('href', jsonContent);
			link.setAttribute('download', fileName);
			link.click();
		}
	}
	
</script>

<!-- #################################################################################################### -->

<nav>

	<!-- Banner -->
	<div class="banner" on:click={() => goto('/')} on:keydown={() => goto('/')}>
		<img id="altLogo" src="/images/trophy.webp" alt="PoolTogether">
		<img src="/images/pooltogether-logo.svg" alt="PoolTogether">
		<span>Stats</span>
	</div>

	{#if !maintenanceMode}
	
		<!-- Chain Selection -->
		<div class="chains">
			{#each chains as chain}
				<span class="{chain}" class:selected={$selectedChains[chain]} on:click={() => $selectedChains[chain] = !$selectedChains[chain]} on:keydown={() => $selectedChains[chain] = !$selectedChains[chain]}>
					<img src="/images/{chain}.svg" alt="{chain.toUpperCase()}">
					<span>{getChainName(chain)}</span>
				</span>
			{/each}
		</div>

		<!-- Player Search -->
		<div class="playerSearch" on:click={() => { advancedModeModalOpen = false; searchModalOpen = !searchModalOpen; }} on:keydown={() => { advancedModeModalOpen = false; searchModalOpen = !searchModalOpen; }}>
			<span>Search</span>
			<i class="icofont-ui-search" />
		</div>

		<!-- Advanced Mode -->
		<div class="advancedMode" on:click={() => { searchModalOpen = false; advancedModeModalOpen = !advancedModeModalOpen; }} on:keydown={() => { searchModalOpen = false; advancedModeModalOpen = !advancedModeModalOpen; }}>
			<i class="icofont-instrument" />
		</div>

		<!-- Player Search Modal -->
		{#if searchModalOpen}
			<div class="cover" on:click={() => searchModalOpen = false} on:keydown={() => searchModalOpen = false} />
			<div class="playerSearchModal">
				<span>Enter a wallet to search for:</span>
				<form on:submit|preventDefault={() => search()}>
					<input type="text" bind:value={searchWallet} placeholder="0x...">
					<button type="submit"><i class="icofont-arrow-right" /></button>
				</form>
			</div>
		{/if}

		<!-- Advanced Mode Modal -->
		{#if advancedModeModalOpen}
			<div class="cover" on:click={() => advancedModeModalOpen = false} on:keydown={() => advancedModeModalOpen = false} />
			<div class="advancedModeModal">
				{#if $advancedMode}
					<h3>Advanced Mode</h3>
					{#if advancedStatsLoaded}

						<!-- Time Controls -->
						<div class="timeControls">
							<span>Timespan:</span>
							<input type="date" min="{minDate}" max="{maxDateValue ?? maxDate}" bind:value={minDateValue}>
							<i class="icofont-arrow-right" />
							<input type="date" min="{minDateValue ?? minDate}" max="{maxDate}" bind:value={maxDateValue}>
							<span on:click={() => updateTimestampStores()} on:keydown={() => updateTimestampStores()}><i class="icofont-clock-time" /></span>
						</div>

						<!-- Data Downloads -->
						<div class="downloads">
							<span>Download:</span>
							<select class="chainDownload" bind:value={chainDownload}>
								{#each chains as chain}
									<option value="{chain}">{getChainName(chain)}</option>
								{/each}
							</select>
							<select class="typeDownload" bind:value={typeDownload}>
								{#each downloadsAvailable as download}
									<option value="{download.file}">{download.name}</option>
								{/each}
							</select>
							<span on:click={() => downloadData()} on:keydown={() => downloadData()}><i class="icofont-download" /></span>
						</div>

						<!-- Disable Advanced Mode Button -->
						<span class="disableAdvanced button" on:click={() => $advancedMode = false} on:keydown={() => $advancedMode = false}>Disable Advanced Mode</span>

					{:else if advancedStatsErrored || (requireDrawsForAdvancedStats && $loading.draws === 'failed')}
						<img src="/images/ngmi.webp" alt="Whoops">
						<span>Something went wrong 0.o</span>
					{:else}

						<!-- Loading Display -->
						{#if !advancedDataLoaded}
							{#each chains as chain}
								{#if $loading[chain].advanced.progress < (maxChainLoadingProgress - 1)}
									<span class="loadingProgress" transition:slide|local>
										{#if $loading[chain].advanced.progress !== (maxChainLoadingProgress - 1)}
											<span class="chainLoading">Loading {getChainName(chain)} Data...</span>
											<img src="/images/excitedPooly.gif" alt="Pooly">
											<span class="chainLoadingPercentage">{(($loading[chain].advanced.progress / (maxChainLoadingProgress - 1)) * 100).toFixed(0)}%</span>
										{/if}
									</span>
								{/if}
							{/each}
						{:else if requireDrawsForAdvancedStats && $loading.draws !== 'done'}
							<span class="loadingProgress">
								<span class="chainLoading">Waiting For Draw Data...</span>
								<img src="/images/excitedPooly.gif" alt="Pooly">
							</span>
						{:else}
							<span class="loadingProgress">
								<span class="chainLoading">Calculating Stats...</span>
								<img src="/images/excitedPooly.gif" alt="Pooly">
							</span>
						{/if}

					{/if}
				{:else}
					<span class="prompt">Want time controls and raw data downloads?</span>
					<span class="enableAdvanced button" on:click={() => $advancedMode = true} on:keydown={() => $advancedMode = true}>Enable Advanced Mode</span>
					<span class="small">It might take a little bit to load though :)</span>
				{/if}
			</div>
		{/if}
	{/if}

</nav>

<!-- #################################################################################################### -->

<style>

	nav {
		position: fixed;
		top: 0;
		display: flex;
		align-items: center;
		height: var(--navbar-height);
		width: 100%;
		padding: 0 2em;
		background: var(--dark-purple);
		box-shadow: 0 0 20px 2px black;
		overflow: hidden;
		z-index: 2;
	}

	div {
		display: flex;
		align-items: center;
	}

	div.chains {
		gap: 1em;
		margin-left: auto;
	}

	div.chains > span {
		display: flex;
		align-items: center;
		gap: .3em;
		height: calc(var(--navbar-height) / 2);
		color: inherit;
		cursor: pointer;
		user-select: none;
	}

	div.chains > span:not(.selected) {
		text-decoration: line-through;
		filter: grayscale(1);
	}

	div.chains img {
		height: 25px;
		width: 25px;
	}

	#altLogo {
		display: none;
	}

	div.banner {
		gap: .5em;
		cursor: pointer;
	}

	div.banner > img {
		height: 60px;
	}

	div.banner > span {
		font-size: 2.7em;
		font-weight: bold;
	}

	div.playerSearch {
		gap: .3em;
		height: 2rem;
		margin: 0 1.5em;
		padding: 0 .5em;
		font-size: .9em;
		background: var(--light-purple);
		border-radius: .5em;
		cursor: pointer;
	}

	div.playerSearch:hover {
		background-color: var(--accent-color);
	}

	div.advancedMode {
		font-size: 1.5em;
		cursor: pointer;
	}

	div.cover {
		position: fixed;
		inset: var(--navbar-height) 0 50px 0;
		backdrop-filter: brightness(0.3) blur(3px);
	}

	div.playerSearchModal, div.advancedModeModal {
		position: fixed;
		inset: calc(var(--navbar-height) + 2em) 2em auto auto;
		flex-direction: column;
		gap: .7em;
		max-width: 85vw;
		padding: 1em;
		background: var(--dark-purple);
		border: 2px solid var(--light-purple);
		border-radius: .5em;
	}

	div.playerSearchModal form {
		display: flex;
	}

	div.playerSearchModal input {
		padding: .2em .5em;
		background: transparent;
		border: 2px solid var(--accent-color);
		border-radius: .5em 0 0 .5em;
	}
	
	div.playerSearchModal input:focus {
		outline: none;
	}

	div.playerSearchModal button {
		padding: 0 .5em;
		color: var(--dark-purple);
		background: var(--accent-color);
		border: none;
		border-radius: 0 .5em .5em 0;
		cursor: pointer;
	}

	div.advancedModeModal > span.prompt {
		text-align: center;
	}

	span.button {
		padding: .5em 1em;
		border-radius: .5em;
		cursor: pointer;
	}

	span.enableAdvanced {
		color: var(--dark-purple);
		background: var(--accent-color);
	}

	span.disableAdvanced {
		margin-top: 1em;
		font-size: .7em;
		background: darkred;
	}

	span.small {
		color: grey;
		font-size: .8em;
	}

	h3 {
		padding: 0 7em .8em;
		border-bottom: 2px solid white;
	}

	span.loadingProgress {
		display: flex;
		align-items: center;
		gap: 1em;
		width: 80%;
	}

	span.loadingProgress img {
		height: 2em;
		margin-left: auto;
	}

	div.timeControls, div.downloads {
		gap: .5em;
		margin-top: 1em;
	}

	div.timeControls > input {
		height: 2rem;
		padding: 0 .5em;
		background: var(--light-purple);
		border-radius: .5em;
	}

	div.timeControls > input {
		border: none;
	}

	div.timeControls > input:focus {
		outline: 2px solid var(--accent-color);
	}

	div.timeControls > span, div.downloads > span {
		display: flex;
		align-items: center;
	}

	div.timeControls > span:first-of-type, div.downloads > span:first-of-type {
		font-size: .9em;
	}

	div.timeControls > span:last-of-type, div.downloads > span:last-of-type {
		height: 2rem;
		padding: 0 .5em;
		background: var(--light-purple);
		border-radius: .5em;
		cursor: pointer;
	}

	div.timeControls > span:last-of-type:hover, div.downloads > span:last-of-type:hover {
		background-color: var(--accent-color);
	}

	div.downloads > select {
		font-family: inherit;
		font-size: .9em;
		background: transparent;
		border: none;
		border-bottom: 2px solid var(--light-purple);
	}

	div.downloads > select:focus {
		outline: none;
	}

	div.downloads > select > option {
		background: var(--primary-color);
	}

	@media screen and (max-width: 1530px) {
		div.chains > span > span {
			display: none;
		}
	}

	@media screen and (max-width: 1235px) {
		div.banner > img, div.banner > span {
			display: none;
		}
		#altLogo {
			display: block;
		}
	}

	@media screen and (max-width: 530px) {
		nav {
			flex-wrap: wrap;
			padding: 1em 2em;
		}
		#altLogo {
			height: 50px;
		}
		div.chains {
			width: 100%;
			margin: 0;
			order: 3;
		}
		div.chains > span {
			height: calc(var(--navbar-height) / 4);
		}
	}
	
</style>