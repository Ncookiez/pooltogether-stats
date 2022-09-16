<script lang="ts">

	// Imports:
	import { getBlockExplorerLink, getTimeDisplay, getShortWallet } from '$lib/functions';
	import { ethData, polyData, avaxData, opData, startTimestamp, endTimestamp, selectedChains, loading, advancedMode } from '$lib/stores';

	// Type Imports:
	import type { Chain, DrawData, DepositData, DelegationFundedData } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	const pageSize: number = 25;
	const defaultMaxTimestamp = 9_999_999_999;
	const drawHistoryWorkerPath: string = '/workers/drawHistoryWorker.js';
	const depositHistoryWorkerPath: string = '/workers/depositHistoryWorker.js';
	const delegationHistoryWorkerPath: string = '/workers/delegationHistoryWorker.js';
	const workerTimeout: number = 60000;
	let draws: DrawData[] = [];
	let deposits: (DepositData & { chain: Chain })[] = [];
	let delegations: (DelegationFundedData & { chain: Chain })[] = [];
	let tabSelected: 'winners' | 'deposits' | 'delegations' = 'deposits';
	let listLength: number = pageSize;
	let depositFilter: number = 0;

	// Reactive Loading Checks:
	$: latestDepositsLoaded = chains.every(chain => $loading[chain].basic.deposits === 'done');
	$: latestDelegationsLoaded = chains.every(chain => $loading[chain].basic.delegations === 'done');
	$: latestDepositsErrored = !chains.every(chain => $loading[chain].basic.deposits !== 'failed');
	$: latestDelegationsErrored = !chains.every(chain => $loading[chain].basic.delegations !== 'failed');
	$: depositsLoaded = chains.every(chain => $loading[chain].advanced.deposits === 'done');
	$: delegationsLoaded = chains.every(chain => $loading[chain].advanced.delegationsFunded === 'done');
	$: depositsErrored = !chains.every(chain => $loading[chain].advanced.deposits !== 'failed');
	$: delegationsErrored = !chains.every(chain => $loading[chain].advanced.delegationsFunded !== 'failed');

	// Reactive Data:
	$: $selectedChains, $loading, getDraws();
	$: $selectedChains, $loading, $startTimestamp, $endTimestamp, getDeposits();
	$: $selectedChains, $loading, $startTimestamp, $endTimestamp, getDelegations();
	$: firstValidDraw = draws.findIndex(draw => draw.timestamp >= $startTimestamp && draw.timestamp <= $endTimestamp);
	$: selectedDraw = firstValidDraw !== -1 ? firstValidDraw : 0;
	$: winners = draws.length > 0 && firstValidDraw !== -1 ? draws[selectedDraw].result.sort((a, b) => b.claimable.reduce((a, b) => a + b, 0) - a.claimable.reduce((a, b) => a + b, 0)) : undefined;

	// Draw Info:
	$: claimable = winners ? winners.reduce((a, b) => a + (b.claimable.reduce((a, b) => a + b, 0)), 0) : 0;
	$: dropped = winners ? winners.reduce((a, b) => a + (b.dropped.reduce((a, b) => a + b, 0)), 0) : 0;
	$: winning = winners ? winners.filter(wallet => wallet.claimable.length > 0).length : 0;
	$: when = getTimeDisplay(winners ? draws[selectedDraw].timestamp : 0, true);

	// Function to get aggregated and sorted draws:
	const getDraws = async () => {
		if($loading.draws === 'done') {
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => reject(`Timed out while handling draw history.`), workerTimeout);
				const dataWorker = new Worker(drawHistoryWorkerPath);
				const dataToPassToWorker = {
					draws: { eth: $ethData.draws.data, poly: $polyData.draws.data, avax: $avaxData.draws.data, op: $opData.draws.data },
					selectedChains: $selectedChains
				}
				dataWorker.postMessage(dataToPassToWorker);
				dataWorker.onmessage = (event) => {
					clearTimeout(timeout);
					draws = event.data;
					dataWorker.terminate();
					resolve();
				}
			});
		}
	}

	// Function to get aggregated and sorted deposits:
	const getDeposits = async () => {
		if(latestDepositsLoaded && (!$advancedMode || depositsLoaded)) {
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => reject(`Timed out while handling deposit history.`), workerTimeout);
				const dataWorker = new Worker(depositHistoryWorkerPath);
				const dataToPassToWorker = {
					deposits: { eth: $ethData.deposits.data, poly: $polyData.deposits.data, avax: $avaxData.deposits.data, op: $opData.deposits.data },
					selectedChains: $selectedChains,
					minTimestamp: $advancedMode ? $startTimestamp : 0,
					maxTimestamp: $advancedMode ? $endTimestamp : defaultMaxTimestamp
				}
				dataWorker.postMessage(dataToPassToWorker);
				dataWorker.onmessage = (event) => {
					clearTimeout(timeout);
					deposits = event.data;
					dataWorker.terminate();
					resolve();
				}
			});
		}
	}

	// Function to get aggregated and sorted delegations:
	const getDelegations = async () => {
		if(latestDelegationsLoaded && (!$advancedMode || delegationsLoaded)) {
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => reject(`Timed out while handling delegation history.`), workerTimeout);
				const dataWorker = new Worker(delegationHistoryWorkerPath);
				const dataToPassToWorker = {
					delegations: { eth: $ethData.delegationsFunded.data, poly: $polyData.delegationsFunded.data, avax: $avaxData.delegationsFunded.data, op: $opData.delegationsFunded.data },
					selectedChains: $selectedChains,
					minTimestamp: $advancedMode ? $startTimestamp : 0,
					maxTimestamp: $advancedMode ? $endTimestamp : defaultMaxTimestamp
				}
				dataWorker.postMessage(dataToPassToWorker);
				dataWorker.onmessage = (event) => {
					clearTimeout(timeout);
					delegations = event.data;
					dataWorker.terminate();
					resolve();
				}
			});
		}
	}
	
</script>

<!-- #################################################################################################### -->

<!-- History -->
<div class="history">

	<!-- Header -->
	<div class="header">
		<h2>PoolTogether V4 History</h2>
		<h2 id="altHeader">History</h2>
		{#if tabSelected === 'winners' && draws.length > 0 && firstValidDraw !== -1}
			<div id="drawSelector">
				<span>Draw:</span>
				<select bind:value={selectedDraw}>
					{#each draws as draw, i}
						{#if draw.timestamp >= $startTimestamp && draw.timestamp <= $endTimestamp}
							<option value="{i}">{draw.draw}</option>
						{/if}
					{/each}
				</select>
			</div>
			<i class="icofont-list" />
			<div id="drawInfo">
				<div class="wrapper">
					<h3>Draw Info</h3>
					<span>Claimable: ${claimable.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
					<span>Dropped: ${dropped.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
					<span>Winners: {winning.toLocaleString(undefined)}</span>
					<span>When: {when}</span>
				</div>
			</div>
		{:else if tabSelected === 'deposits' && deposits.length > 0 && $advancedMode && depositsLoaded}
			<div id="depositFilter">
				<span>Filter:</span>
				<span class="dollar">$</span>
				<input type="number" bind:value={depositFilter}>
			</div>
		{/if}
	</div>

	<!-- Tab Selection -->
	<div class="tabs">
		<span class:selected={tabSelected === 'deposits'} on:click={() => { tabSelected = 'deposits'; listLength = pageSize; }}>Deposits</span>
		<span class:selected={tabSelected === 'delegations'} on:click={() => { tabSelected = 'delegations'; listLength = pageSize; }}>Delegations</span>
		<span class:selected={tabSelected === 'winners'} on:click={() => { tabSelected = 'winners'; listLength = pageSize; }}>Winners</span>
	</div>

	<!-- Content -->
	<div class="content">

		<!-- Winners Tab -->
		{#if tabSelected === 'winners'}
			{#if winners}
				{#if winners.length === 0}
					<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
					<span>No winners this draw!</span>
				{:else}
					{#each winners.slice(0, listLength) as winner}
						<span class="winner listItem" class:highlightItem={winner.claimable.reduce((a, b) => a + b, 0) >= 1000}>
							{#if winner.chain}
								<img src="/images/{winner.chain}.svg" alt="{winner.chain}">
							{/if}
							<a href="{`/${winner.wallet}`}" class="wallet" title="{winner.wallet}">{getShortWallet(winner.wallet)}</a>
							<i class="icofont-arrow-right" />
							<span class="prizes" title="{winner.claimable.map(value => ` $${value}`).toString().slice(1)}"><span class="label">Won </span>${winner.claimable.reduce((a, b) => a + b, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
							{#if winner.avgBalance}
								<span class="avgBalance">(Balance: ${winner.avgBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
							{/if}
						</span>
					{/each}
					{#if winners.length > listLength}
						<span class="loadMore" on:click={() => listLength += pageSize}><i class="icofont-arrow-down" /> Load More <i class="icofont-arrow-down" /></span>
					{/if}
				{/if}
			{:else}
				<span class="loadingInfo">
					{#if $loading.draws === 'failed'}
						<img src="/images/ngmi.webp" alt="Whoops">
						<span>Something went wrong 0.o</span>
					{:else if firstValidDraw === -1}
						<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
						<span>No draws within your selected time period.</span>
					{:else}
						<img src="/images/loading.gif" alt="Loading">
						<span>Loading...</span>
					{/if}
				</span>
			{/if}

		<!-- Deposits Tab -->
		{:else if tabSelected === 'deposits'}
			{#if latestDepositsLoaded && (!$advancedMode || depositsLoaded)}
				{#if deposits.length === 0}
					<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
					<span>No deposits found...</span>
				{:else}
					{#each deposits.filter(deposit => deposit.amount > depositFilter).slice(0, listLength) as deposit}
						<span class="deposit listItem" class:highlightItem={deposit.amount >= 10000}>
							<img src="/images/{deposit.chain}.svg" alt="{deposit.chain}">
							<a href="{`/${deposit.wallet}`}" class="wallet" title="{deposit.wallet}">{getShortWallet(deposit.wallet)}</a>
							<i class="icofont-arrow-right" />
							<span class="amount"><span class="label">Deposited </span>{deposit.amount < 0.9 ? '<$1' : `$${deposit.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>
							{#if deposit.timestamp}
								<span class="time">({getTimeDisplay(deposit.timestamp)})</span>
							{/if}
							<a class="blockExplorerLink" href="{getBlockExplorerLink(deposit.chain, deposit.txHash)}" target="__blank"><i class="icofont-external-link" /></a>
						</span>
					{/each}
					{#if deposits.filter(deposit => deposit.amount > depositFilter).length > listLength}
						<span class="loadMore" on:click={() => listLength += pageSize}><i class="icofont-arrow-down" /> Load More <i class="icofont-arrow-down" /></span>
					{/if}
				{/if}
			{:else}
				<span class="loadingInfo">
					{#if latestDepositsErrored || ($advancedMode && depositsErrored)}
						<img src="/images/ngmi.webp" alt="Whoops">
						<span>Something went wrong 0.o</span>
					{:else}
						<img src="/images/loading.gif" alt="Loading">
						<span>Loading...</span>
					{/if}
				</span>
			{/if}

		<!-- Delegations Tab -->
		{:else if tabSelected === 'delegations'}
			{#if latestDelegationsLoaded && (!$advancedMode || delegationsLoaded)}
				{#if delegations.length === 0}
					<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
					<span>No delegations found...</span>
				{:else}
					{#each delegations.slice(0, listLength) as delegation}
						<span class="delegation listItem" class:highlightItem={delegation.amount >= 10000}>
							<img src="/images/{delegation.chain}.svg" alt="{delegation.chain}">
							<a href="{`/${delegation.delegator}`}" class="wallet" title="{delegation.delegator}">{getShortWallet(delegation.delegator)}</a>
							<i class="icofont-arrow-right" />
							<span class="amount"><span class="label">Delegated </span>{delegation.amount < 0.9 ? '<$1' : `$${delegation.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>
							{#if delegation.timestamp}
								<span class="time">({getTimeDisplay(delegation.timestamp)})</span>
							{/if}
							<a class="blockExplorerLink" href="{getBlockExplorerLink(delegation.chain, delegation.txHash)}" target="__blank"><i class="icofont-external-link" /></a>
						</span>
					{/each}
					{#if delegations.length > listLength}
						<span class="loadMore" on:click={() => listLength += pageSize}><i class="icofont-arrow-down" /> Load More <i class="icofont-arrow-down" /></span>
					{/if}
				{/if}
			{:else}
				<span class="loadingInfo">
					{#if latestDelegationsErrored || ($advancedMode && delegationsErrored)}
						<img src="/images/ngmi.webp" alt="Whoops">
						<span>Something went wrong 0.o</span>
					{:else}
						<img src="/images/loading.gif" alt="Loading">
						<span>Loading...</span>
					{/if}
				</span>
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
		margin: 0 calc((100vw - 81em) / 2);
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

	#altHeader {
		display: none;
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

	div.header i.icofont-list:hover + #drawInfo {
		display: flex;
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

	span.listItem > img {
		height: 2em;
		width: 2em;
	}

	span.listItem > a.blockExplorerLink {
		margin-left: auto;
		color: inherit;
		text-decoration: none;
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

	span.loadingInfo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
	}

	span.loadingInfo img {
		width: 5em;
		margin-top: 1em;
	}

	@media screen and (max-width: 600px) {
		div.tabs {
			padding: 0;
		}
		div.tabs > span {
			padding: 1em;
		}
		span.avgBalance {
			display: none;
		}
		span.time {
			display: none;
		}
	}

	@media screen and (max-width: 530px) {
		span.deposit span.label {
			display: none;
		}
	}

	@media screen and (max-width: 460px) {
		h2 {
			display: none;
		}
		#altHeader {
			display: block;
		}
		span.label {
			display: none;
		}
	}

	@media screen and (max-width: 410px) {
		span.listItem {
			gap: .5em;
		}
	}
	
</style>