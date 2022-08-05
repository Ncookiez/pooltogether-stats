<script lang="ts">

	// Imports:
	import { getChainName } from '$lib/functions';
	import { ethData, polyData, avaxData, opData, startTimestamp, endTimestamp } from '$lib/stores';

	// Type Imports:
	import type { Chain, ChainData } from '$lib/types';

	// Initializations:
	export let chain: Chain;
	const chainName = getChainName(chain);
	const pageSize = 25;
	const now = Date.now() / 1000;
	const dayInSeconds = 86400;
	let tabSelected: 'winners' | 'deposits' | 'delegations' = 'winners';
	let listLength = pageSize;
	let selectedDraw = 0;
	let depositFilter = 0;

	// Reactive Chain Data:
	$: chainData = selectChainData(chain);
	$: draws = getDraws(chainData, $startTimestamp, $endTimestamp);
	$: winners = draws[selectedDraw].result;
	$: deposits = getDeposits(chainData, depositFilter, $startTimestamp, $endTimestamp);
	$: delegations = getDelegations(chainData, $startTimestamp, $endTimestamp);

	// Draw Info:
	$: claimable = winners.reduce((a, b) => a + (b.claimable.reduce((a, b) => a + b, 0)), 0);
	$: dropped = winners.reduce((a, b) => a + (b.dropped.reduce((a, b) => a + b, 0)), 0);
	$: winning = winners.filter(wallet => wallet.claimable.length > 0).length;
	$: when = getTimeDisplay(draws[selectedDraw].timestamp, true);

	// Function to select appropriate chain data:
	const selectChainData = (chain: Chain) => {
		if(chain === 'eth') {
			return $ethData;
		} else if(chain === 'poly') {
			return $polyData;
		} else if(chain === 'avax') {
			return $avaxData;
		} else {
			return $opData;
		}
	}

	// Function to get sorted and filtered draws:
	const getDraws = (chainData: ChainData, startTime: number, endTime: number) => {
		const allDraws = chainData.draws.data.slice().reverse();
		const filteredDraws = allDraws.filter(draw => draw.timestamp >= startTime && draw.timestamp <= endTime);
		return filteredDraws;
	}

	// Function to get sorted and filtered deposits:
	const getDeposits = (chainData: ChainData, filter: number, startTime: number, endTime: number) => {
		const allDeposits = chainData.deposits.data.slice().reverse();
		const filteredDeposits = allDeposits.filter(deposit => deposit.amount >= filter && deposit.timestamp && deposit.timestamp >= startTime && deposit.timestamp <= endTime);
		return filteredDeposits;
	}

	// Function to get sorted and filtered delegations:
	const getDelegations = (chainData: ChainData, startTime: number, endTime: number) => {
		const allDelegations = chainData.delegationsFunded.data.slice().reverse();
		const filteredDelegations = allDelegations.filter(delegation => delegation.timestamp && delegation.timestamp >= startTime && delegation.timestamp <= endTime);
		return filteredDelegations;
	}

	// Function to get 'time ago' string:
	const getTimeDisplay = (timestamp: number, shorten?: boolean) => {
		const secondsSinceEvent = now - timestamp;
		if(secondsSinceEvent > 0) {
			if(secondsSinceEvent < dayInSeconds) {
				if(secondsSinceEvent >= dayInSeconds / 24) {
					const hours = Math.floor(secondsSinceEvent / (dayInSeconds / 24));
					return `${hours} hour${hours > 1 ? 's' : ''} ago`;
				} else if(secondsSinceEvent >= dayInSeconds / 24 / 60) {
					const mins = Math.floor(secondsSinceEvent / (dayInSeconds / 24 / 60));
					return `${mins} minute${mins > 1 ? 's' : ''} ago`;
				} else {
					const secs = Math.floor(secondsSinceEvent / (dayInSeconds / 24 / 60 / 60));
					return `${secs} second${secs > 1 ? 's' : ''} ago`;
				}
			} else {
				const date = new Date(timestamp * 1000);
				const currentYear = (new Date(now * 1000)).getFullYear();
				if(currentYear === date.getFullYear()) {
					return (shorten ? '' : 'on ') + date.toLocaleString(undefined, {month: 'short', day: 'numeric'});
				} else {
					return (shorten ? '' : 'on ') + date.toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
				}
			}
		} else {
			return '';
		}
	}
	
</script>

<!-- #################################################################################################### -->

<!-- History -->
<div class="history">

	<!-- Header -->
	<div class="header">
		<h2>{chainName} History</h2>
		{#if tabSelected === 'winners'}
			<div id="drawSelector">
				<span>Draw:</span>
				<select bind:value={selectedDraw}>
					{#each draws as draw, i}
						<option value="{i}">{draw.draw}</option>
					{/each}
				</select>
			</div>
			<i class="icofont-list" />
			<div id="drawInfo">
				<div class="wrapper">
					<h3>{chainName}</h3>
					<h3>Draw Info</h3>
					<span>Claimable: ${claimable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
					<span>Dropped: ${dropped.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
					<span>Winners: {winning.toLocaleString(undefined)}</span>
					<span>When: {when}</span>
				</div>
			</div>
		{:else if tabSelected === 'deposits'}
			<div id="depositFilter">
				<span>Filter:</span>
				<span class="dollar">$</span>
				<input type="number" bind:value={depositFilter}>
			</div>
		{/if}
	</div>

	<!-- Tab Selection -->
	<div class="tabs">
		<span class:selected={tabSelected === 'winners'} on:click={() => { tabSelected = 'winners'; listLength = pageSize; }}>Winners</span>
		<span class:selected={tabSelected === 'deposits'} on:click={() => { tabSelected = 'deposits'; listLength = pageSize; }}>Deposits</span>
		<span class:selected={tabSelected === 'delegations'} on:click={() => { tabSelected = 'delegations'; listLength = pageSize; }}>Delegations</span>
	</div>

	<!-- Content -->
	<div class="content">

		<!-- Winners Tab -->
		{#if tabSelected === 'winners'}
			{#if winners.length === 0}
				<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
				<span>No winners this draw!</span>
			{:else}
				{#each winners.slice(0, listLength) as winner}
					<span class="winner listItem" class:highlightItem={winner.claimable.reduce((a, b) => a + b, 0) >= 1000}>
						<a href="{`/${winner.wallet}`}" class="wallet" title="{winner.wallet}">{winner.wallet.slice(0, 6)}…{winner.wallet.slice(-4)}</a>
						<i class="icofont-arrow-right" />
						<span class="prizes" title="{winner.claimable.map(value => ` $${value}`).toString().slice(1)}">Won ${winner.claimable.reduce((a, b) => a + b, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
						{#if winner.avgBalance}
							<span class="avgBalance">(Balance: ${winner.avgBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
						{/if}
					</span>
				{/each}
				{#if winners.length > listLength}
					<span class="loadMore" on:click={() => listLength += pageSize}><i class="icofont-arrow-down" /> Load More <i class="icofont-arrow-down" /></span>
				{/if}
			{/if}

		<!-- Deposits Tab -->
		{:else if tabSelected === 'deposits'}
			{#if deposits.length === 0}
				<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
				<span>No deposits found...</span>
			{:else}
				{#each deposits.slice(0, listLength) as deposit}
					<span class="deposit listItem" class:highlightItem={deposit.amount >= 10000}>
						<a href="{`/${deposit.wallet}`}" class="wallet" title="{deposit.wallet}">{deposit.wallet.slice(0, 6)}…{deposit.wallet.slice(-4)}</a>
						<i class="icofont-arrow-right" />
						<span class="amount">Deposited {deposit.amount < 0.9 ? '<$1' : `$${deposit.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>
						{#if deposit.timestamp}
							<span class="time">({getTimeDisplay(deposit.timestamp)})</span>
						{/if}
					</span>
				{/each}
				{#if deposits.length > listLength}
					<span class="loadMore" on:click={() => listLength += pageSize}><i class="icofont-arrow-down" /> Load More <i class="icofont-arrow-down" /></span>
				{/if}
			{/if}

		<!-- Delegations Tab -->
		{:else if tabSelected === 'delegations'}
			{#if delegations.length === 0}
				<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
				<span>No delegations found...</span>
			{:else}
				{#each delegations.slice(0, listLength) as delegation}
					<span class="delegation listItem" class:highlightItem={delegation.amount >= 10000}>
						<a href="{`/${delegation.delegator}`}" class="wallet" title="{delegation.delegator}">{delegation.delegator.slice(0, 6)}…{delegation.delegator.slice(-4)}</a>
						<i class="icofont-arrow-right" />
						<span class="amount">Delegated {delegation.amount < 0.9 ? '<$1' : `$${delegation.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>
						{#if delegation.timestamp}
							<span class="time">({getTimeDisplay(delegation.timestamp)})</span>
						{/if}
					</span>
				{/each}
				{#if delegations.length > listLength}
					<span class="loadMore" on:click={() => listLength += pageSize}><i class="icofont-arrow-down" /> Load More <i class="icofont-arrow-down" /></span>
				{/if}
			{/if}
		{/if}
	</div>
</div>

<!-- #################################################################################################### -->

<style>

	div.history {
		position: relative;
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--navbar-height) - 50px - 4em);
		width: 81em;
		padding: 1em 0 0;
		background: var(--dark-purple);
		border: 2px solid var(--accent-color);
		border-radius: 1em;
		overflow: hidden;
	}

	div.header {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
		padding: 0 2em;
	}

	div.tabs {
		display: flex;
		margin-top: 1em;
		padding: 0 1em;
		background: var(--light-purple);
		border-top: 2px solid var(--accent-color);
		border-bottom: 2px solid var(--accent-color);
		box-shadow: 0 0 20px 5px var(--dark-purple) inset;
	}

	div.tabs > span {
		padding: 1em 2em;
		cursor: pointer;
		user-select: none;
	}

	div.tabs > span:not(.selected):hover {
		background: hsla(170, 86%, 57%, 0.1);
	}

	div.tabs > span.selected {
		color: var(--dark-purple);
		background: var(--accent-color);
	}

	div.content {
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 1em 2em;
		overflow: hidden auto;
	}

	#drawSelector {
		display: flex;
		justify-content: end;
		align-items: center;
		flex: 1;
		gap: .5em;
	}

	#drawSelector > select {
		padding-right: .5em;
		font-family: inherit;
		font-size: inherit;
		background: var(--light-purple);
		border: none;
		border-radius: .5em;
	}

	#drawSelector > select:focus {
		outline: none;
	}

	#drawSelector > select > option {
		padding-right: .5em;
		background: var(--primary-color);
	}

	#drawInfo {
		position: absolute;
		inset: 1.3em 1em auto auto;
		display: none;
	}

	#drawInfo:hover {
		display: flex;
	}

	#drawInfo > div.wrapper {
		display: flex;
		flex-direction: column;
		margin-top: 1em;
		padding: 1em;
		background: var(--light-purple);
		border: 2px solid var(--accent-color);
		border-radius: .5em;
		box-shadow: 0 0 20px 5px var(--dark-purple) inset;
	}

	#drawInfo span:first-of-type {
		margin-top: .5em;
		padding-top: .5em;
		border-top: 2px solid currentColor;
	}

	div.header i.icofont-list:hover + #drawInfo {
		display: flex;
	}

	#depositFilter {
		display: flex;
		align-items: center;
	}

	#depositFilter > span.dollar {
		margin-left: .5em;
		padding: 0 .2em 0 .5em;
		background: var(--light-purple);
		border-radius: .5em 0 0 .5em;
	}

	#depositFilter > input {
		width: 5em;
		padding-right: .5em;
		font-family: inherit;
		font-size: inherit;
		background: var(--light-purple);
		border: none;
		border-radius: 0 .5em .5em 0;
	}

	#depositFilter > input:focus {
		outline: none;
	}

	#sleepingPooly {
		width: 10em;
		margin: 1em 0;
	}

	span.listItem {
		display: flex;
		align-items: center;
		gap: 1em;
		padding: .2em .5em;
		background: var(--primary-color);
		border-radius: .5em;
	}

	span.listItem:hover {
		background-color: #4d249f90;
	}

	span.highlightItem {
		border: 2px solid var(--secondary-color);
	}

	span.loadMore {
		margin: 0 auto;
		color: var(--light-purple);
		font-size: .9em;
		cursor: pointer;
	}

	a.wallet {
		color: var(--secondary-color);
		font-family: 'Courier Prime', monospace;
		text-decoration: none;
		cursor: pointer;
	}

	span.avgBalance {
		color: var(--light-purple);
		font-size: .9em;
	}

	span.time {
		color: var(--light-purple);
		font-size: .9em;
	}
	
</style>