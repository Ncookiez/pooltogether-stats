<script lang="ts">

	// Imports:
	import { page } from "$app/stores";
	import { getChainName, getTimestamps, timestampToISO } from "$lib/functions";
	import { ethData, polyData, avaxData, opData, startTimestamp, endTimestamp } from '$lib/stores';

	// Type Imports:
	import type { Chain, ChainData } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const chainMinMaxTimestamps: Record<Chain, number[]> = { eth: [], poly: [], avax: [], op: [] };
	const allChainsMinMaxTimestamps: number[] = [];
	const dayInSeconds = 86400;
	let timestampsSet = false;
	let minDateValue: string | undefined;
	let maxDateValue: string | undefined;

	// Reactive Chain Selection:
	$: selectedChain = $page.routeId !== '' ? $page.routeId as Chain : undefined;

	// Reactive Timestamps:
	$: updateMinMaxTimestamps($ethData, $polyData, $avaxData, $opData);
	$: selectedChain, updateCurrentChainTimestamps();

	// Reactive Input Timestamps:
	$: minDate = timestampsSet ? !selectedChain ? timestampToISO(allChainsMinMaxTimestamps[0]) : timestampToISO(chainMinMaxTimestamps[selectedChain][0]) : timestampToISO(0);
	$: maxDate = timestampsSet ? !selectedChain ? timestampToISO(allChainsMinMaxTimestamps[1]) : timestampToISO(chainMinMaxTimestamps[selectedChain][1]) : timestampToISO(9_999_999_999);

	// Function to update min/max timestamps:
	const updateMinMaxTimestamps = (ethData: ChainData, polyData: ChainData, avaxData: ChainData, opData: ChainData) => {
		if(!timestampsSet && ethData.deposits.data.length > 0 && polyData.deposits.data.length > 0 && avaxData.deposits.data.length > 0 && opData.deposits.data.length > 0) {
			chainMinMaxTimestamps.eth = getTimestamps(ethData, 1);
			chainMinMaxTimestamps.poly = getTimestamps(polyData, 1);
			chainMinMaxTimestamps.avax = getTimestamps(avaxData, 1);
			chainMinMaxTimestamps.op = getTimestamps(opData, 1);
			allChainsMinMaxTimestamps.push(Math.min(chainMinMaxTimestamps.eth[0], chainMinMaxTimestamps.poly[0], chainMinMaxTimestamps.avax[0], chainMinMaxTimestamps.op[0]));
			allChainsMinMaxTimestamps.push(Math.max(chainMinMaxTimestamps.eth[1], chainMinMaxTimestamps.poly[1], chainMinMaxTimestamps.avax[1], chainMinMaxTimestamps.op[1]));
			timestampsSet = true;
		}
	}

	// Function to update current selected chain's timestamps:
	const updateCurrentChainTimestamps = () => {
		if(selectedChain) {
			if(minDateValue) {
				const minTimeValue = Date.parse(minDateValue) / 1000;
				if(minTimeValue < chainMinMaxTimestamps[selectedChain][0] || minTimeValue > chainMinMaxTimestamps[selectedChain][1]) {
					minDateValue = undefined;
				}
			}
			if(maxDateValue) {
				const maxTimeValue = Date.parse(maxDateValue) / 1000;
				if(maxTimeValue < chainMinMaxTimestamps[selectedChain][0] || maxTimeValue > chainMinMaxTimestamps[selectedChain][1]) {
					maxDateValue = undefined;
				}
			}
		}
	}

	// Function to update timestamp stores:
	const updateTimestampStores = () => {
		const minTimeValue = minDateValue ? Date.parse(minDateValue) / 1000 : undefined;
		const maxTimeValue = maxDateValue ? Date.parse(maxDateValue) / 1000 + dayInSeconds - 1 : undefined;
		minTimeValue ? startTimestamp.set(minTimeValue) : startTimestamp.set(0);
		if(maxTimeValue) {
			if(minTimeValue) {
				if(maxTimeValue > minTimeValue) {
					endTimestamp.set(maxTimeValue);
				} else {
					endTimestamp.set(9_999_999_999);
				}
			} else {
				endTimestamp.set(maxTimeValue);
			}
		} else {
			endTimestamp.set(9_999_999_999);
		}
	}
	
</script>

<!-- #################################################################################################### -->

<nav>

	<!-- Banner -->
	<div class="banner">
		<img src="/images/pooltogether-logo.svg" alt="PoolTogether">
		<span>Stats</span>
	</div>

	<!-- Pages -->
	<div class="pages">
		<a class="dashboard" class:selected={!selectedChain} href="/">Dashboard</a>
		{#each chains as chain}
			<a class="{chain}" class:selected={selectedChain === chain} href="/{chain}"><img src="/images/{chain}.svg" alt="{chain.toUpperCase()}">{getChainName(chain)}</a>
		{/each}
	</div>

	<!-- Timestamp Selection -->
	{#if timestampsSet}
		<div class="timestamps">
			<input type="date" min="{minDate}" max="{maxDate}" bind:value={minDateValue}>
			<i class="icofont-arrow-right" />
			<input type="date" min="{minDate}" max="{maxDate}" bind:value={maxDateValue}>
			<span on:click={() => updateTimestampStores()}><i class="icofont-clock-time" /></span>
		</div>
	{/if}

	<!-- Wallet Search -->
	<!-- TODO - search for specific wallet and see all events -->

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
	}

	div {
		display: flex;
		align-items: center;
	}

	a {
		display: flex;
		align-items: center;
		gap: .3em;
		height: calc(var(--navbar-height) / 2);
		color: inherit;
		text-decoration: none;
		border-bottom: 2px solid transparent;
	}
	
	a.dashboard.selected, a.dashboard:hover {
		border-color: currentColor;
	}

	a.eth.selected, a.eth:hover {
		border-color: #627EEA;
	}

	a.poly.selected, a.poly:hover {
		border-color: #7B3FE4;
	}

	a.avax.selected, a.avax:hover {
		border-color: #E84142;
	}

	a.op.selected, a.op:hover {
		border-color: #FF0420;
	}

	a > img {
		height: 25px;
		width: 25px;
	}

	div.banner {
		gap: .5em;
	}

	div.banner > img {
		height: 60px;
	}

	div.banner > span {
		font-size: 2.7em;
		font-weight: bold;
	}

	div.pages {
		gap: 1.5em;
		margin: 0 5em;
	}

	div.timestamps {
		gap: .5em;
		margin-left: auto;
	}

	div.timestamps > input, div.timestamps > span {
		height: 2rem;
		padding: 0 .5em;
		background: var(--light-purple);
		border-radius: .5em;
	}

	div.timestamps > input {
		border: none;
	}

	div.timestamps > input:focus {
		outline: 2px solid var(--accent-color);
	}

	div.timestamps > span {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	div.timestamps > span:hover {
		background-color: var(--accent-color);
	}
	
</style>