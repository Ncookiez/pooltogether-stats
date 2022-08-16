<script lang="ts">

	// Imports:
	import Highlight from '$lib/Highlight.svelte';

	// Type Imports:
	import type { Hash, PlayerData, ClaimTX } from '$lib/types';

	// Initializations:
	export let wallet: Hash;
	export let playerData: PlayerData;

	// Reactive Player Stats:
	$: currentBalance = playerData.balancesOverTime[playerData.balancesOverTime.length - 1];
	$: claimTXs = playerData.txs.filter(tx => tx.type === 'claim') as ClaimTX[];
	$: prizesClaimed = claimTXs.map(tx => tx.data.prizes.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
	$: numPrizes = claimTXs.map(tx => tx.data.prizes.length).reduce((a, b) => a + b, 0);
	$: firstDepositTimestamp = playerData.txs.slice().reverse().find(tx => tx.type === 'deposit')?.data.timestamp;
	$: firstDepositDate = firstDepositTimestamp ? (new Date(firstDepositTimestamp * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : undefined;
	
</script>

<!-- #################################################################################################### -->

<!-- Player Header -->
<h1>Player Stats: <span title="{wallet}">{wallet.slice(0, 6)}…{wallet.slice(-4)}</span> <i class="icofont-copy-invert" on:click={() => navigator.clipboard.writeText(wallet ?? '')} /></h1>

<!-- Player Summary -->
{#if playerData.txs.length > 0}
	<Highlight>
		<span class="balance big"><span class="highlight">Current Balance:</span> ${currentBalance.toLocaleString(undefined)}</span>
		<span class="claimed big"><span class="highlight">Prizes Claimed:</span> ${prizesClaimed.toLocaleString(undefined)} ({numPrizes.toLocaleString(undefined)} prizes)</span>
		{#if firstDepositDate}
			<span class="firstDeposit big"><span class="highlight">First Deposited:</span> {firstDepositDate}</span>
		{/if}
	</Highlight>
{/if}

<!-- #################################################################################################### -->

<style>

	h1 {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: .5em;
		width: 81rem;
		margin: .5em 0;
		text-align: center;
	}

	i {
		font-size: .7em;
		cursor: pointer;
	}

	i:hover {
		color: var(--light-purple);
	}

	span.highlight {
		color: var(--secondary-color);
		font-weight: bold;
		text-decoration: none;
	}

	span.big {
		font-size: 1.3em;
	}
	
</style>