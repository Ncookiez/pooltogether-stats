<script lang="ts">

	// Type Imports:
	import type { Hash, PlayerData } from '$lib/types';

	// Initializations:
	export let wallet: Hash;
	export let playerData: PlayerData;
	const pageSize = 25;
	const now = Date.now() / 1000;
	const dayInSeconds = 86400;
	let listLength = pageSize;

	// Function to get 'time ago' string:
	const getTimeDisplay = (timestamp: number) => {
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
					return 'on ' + date.toLocaleString(undefined, {month: 'short', day: 'numeric'});
				} else {
					return 'on ' + date.toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
				}
			}
		} else {
			return '';
		}
	}
	
</script>

<!-- #################################################################################################### -->

<!-- Player History -->
<div class="playerHistory">

	<!-- Header -->
	<div class="header">
		<h2 title="{wallet}">{wallet.slice(0,6)}…{wallet.slice(-4)} Player History</h2>
	</div>

	<!-- Content -->
	<div class="content">
		{#if playerData.txs.length === 0}
			<img id="sleepingPooly" src="/images/sleeping.png" alt="Sleeping Pooly">
			<span>This player hasn't done anything yet...</span>
		{:else}
			{#each playerData.txs.slice(0, listLength) as tx}
				<span class="listItem">
					<img src="/images/{tx.chain}.svg" alt="{tx.chain}">
					<span class="wallet" title="{wallet}">{wallet.slice(0, 6)}…{wallet.slice(-4)}</span>
					<i class="icofont-arrow-right" />

					<!-- Deposit -->
					{#if tx.type === 'deposit'}
						<span class="deposit">Deposited {tx.data.amount < 0.9 ? '<$1' : `$${tx.data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>

					<!-- Claim -->
					{:else if tx.type === 'claim'}
						<span class="claim" title="{tx.data.prizes.map(value => ` $${value}`).toString().slice(1)}">Claimed ${tx.data.prizes.reduce((a, b) => a + b, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>

					<!-- Withdrawal -->
					{:else if tx.type === 'withdrawal'}
						<span class="withdrawal">Withdrew {tx.data.amount < 0.9 ? '<$1' : `$${tx.data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>

					<!-- Delegation Created -->
					{:else if tx.type === 'delegationCreated'}
						{#if tx.data.delegator === wallet}
							<span class="delegationCreated">Created a delegation to <span class="wallet">{tx.data.delegatee.slice(0, 6)}…{tx.data.delegatee.slice(-4)}</span></span>
						{:else}
							<span class="delegationReceived">Received a delegation from <span class="wallet">{tx.data.delegator.slice(0, 6)}…{tx.data.delegator.slice(-4)}</span></span>
						{/if}

					<!-- Delegation Funded -->
					{:else if tx.type === 'delegationFunded'}
						<span class="delegationFunded">Funded a delegation with {tx.data.amount < 0.9 ? '<$1' : `$${tx.data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}</span>

					<!-- Delegation Updated -->
					{:else if tx.type === 'delegationUpdated'}
						{#if tx.data.delegator === wallet}
							<span class="delegationUpdated">Updated a delegation to point to <span class="wallet">{tx.data.newDelegatee.slice(0, 6)}…{tx.data.newDelegatee.slice(-4)}</span></span>
						{:else}
							<span class="delegationReceived">Received a delegation from <span class="wallet">{tx.data.delegator.slice(0, 6)}…{tx.data.delegator.slice(-4)}</span></span>
						{/if}

					<!-- Delegation Withdrawn -->
					{:else if tx.type === 'delegationWithdrawn'}
						<span class="delegationWithdrawn">Withdrew {tx.data.amount < 0.9 ? '<$1' : `$${tx.data.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} from a delegation</span>
					{/if}

					{#if tx.data.timestamp}
						<span class="time">({getTimeDisplay(tx.data.timestamp)})</span>
					{/if}
				</span>
			{/each}
			{#if playerData.txs.length > listLength}
				<span class="loadMore" on:click={() => listLength += pageSize}><i class="icofont-arrow-down" /> Load More <i class="icofont-arrow-down" /></span>
			{/if}
		{/if}
	</div>
</div>

<!-- #################################################################################################### -->

<style>

	div.playerHistory {
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
		padding: 0 2em 1em;
	}

	div.content {
		display: flex;
		flex-direction: column;
		gap: 1em;
		padding: 1em 2em;
		border-top: 2px solid var(--accent-color);
		overflow: hidden auto;
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

	span.loadMore {
		margin: 0 auto;
		color: var(--light-purple);
		font-size: .9em;
		cursor: pointer;
	}

	span.wallet {
		color: var(--secondary-color);
		font-family: 'Courier Prime', monospace;
	}

	span.time {
		color: var(--light-purple);
		font-size: .9em;
	}
	
</style>