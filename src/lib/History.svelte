<script lang="ts">

	// Imports:
	import { getChainName } from '$lib/functions';
	import { ethData, polyData, avaxData, opData, startTimestamp, endTimestamp } from '$lib/stores';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	export let chain: Chain;
	const chainName = getChainName(chain);
	let tabSelected: 'winners' | 'deposits' | 'delegations' = 'winners';
	let selectedDraw = 0;
	let listLength = 25;

	// Reactive Chain Data:
	$: chainData = selectChainData(chain);

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
	
</script>

<!-- #################################################################################################### -->

<!-- History -->
<div class="history">
	<div class="header">
		<h2>{chainName} History</h2>
		{#if tabSelected === 'winners'}
			<div id="drawSelector">
				<span>Draw:</span>
				<select bind:value={selectedDraw}>
					{#each chainData.draws.data as draw, i}
						<option value="{i}">{draw.draw}</option>
					{/each}
				</select>
			</div>
		{:else if tabSelected === 'deposits'}
			<!-- TODO - filter -->
		{/if}
	</div>
	<div class="tabs">
		<span class:selected={tabSelected === 'winners'} on:click={() => tabSelected = 'winners'}>Winners</span>
		<span class:selected={tabSelected === 'deposits'} on:click={() => tabSelected = 'deposits'}>Deposits</span>
		<span class:selected={tabSelected === 'delegations'} on:click={() => tabSelected = 'delegations'}>Delegations</span>
	</div>
	<div class="content">
		{#if tabSelected === 'winners'}
			{#if chainData.draws.data[selectedDraw].result.length === 0}
				<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
				<span>No winners this draw!</span>
			{:else}
				{#each chainData.draws.data[selectedDraw].result.slice(0, listLength) as winner}
					<span class="winner listItem">
						<span class="wallet">{winner.wallet.slice(0, 6)}…{winner.wallet.slice(-4)}</span>
						<!-- TODO - include all winner content -->
					</span>
				{/each}
			{/if}
		{:else if tabSelected === 'deposits'}
			{#each chainData.deposits.data.slice(0, listLength) as deposit}
				<span class="deposit listItem">
					<span class="wallet">{deposit.wallet.slice(0, 6)}…{deposit.wallet.slice(-4)}</span>
					<!-- TODO - include all deposit content -->
				</span>
			{/each}
		{:else if tabSelected === 'delegations'}
			{#each chainData.delegationsFunded.data.slice(0, listLength) as delegation}
				<span class="delegation listItem">
					<span class="wallet">{delegation.delegator.slice(0, 6)}…{delegation.delegator.slice(-4)}</span>
					<!-- TODO - include all delegation content -->
				</span>
			{/each}
		{/if}
		<!-- TODO - need way to increase list length (onclick or lazy loading) -->
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
		display: flex;
		align-items: center;
		justify-content: space-between;
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

	div.tabs > span.selected {
		color: var(--dark-purple);
		background: var(--accent-color);
	}

	div.content {
		display: flex;
		flex-direction: column;
		padding: 1em 2em;
		overflow: hidden auto;
	}

	#drawSelector {
		display: flex;
		align-items: center;
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

	#drawSelector > select > option {
		padding-right: .5em;
		background: var(--primary-color);
	}

	#sleepingPooly {
		width: 10em;
		margin: 1em 0;
	}

	span.listItem {
		display: flex;
		align-items: center;
	}

	span.wallet {
		font-family: 'Courier Prime', monospace;
	}
	
</style>