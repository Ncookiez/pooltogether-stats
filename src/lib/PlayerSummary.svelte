<script lang="ts">

	// Imports:
	import { getShortWallet } from '$lib/functions';
	import Highlight from '$lib/Highlight.svelte';

	// Type Imports:
	import type { Hash, PlayerData, ClaimTX } from '$lib/types';

	// Initializations:
	export let wallet: Hash;
	export let playerData: PlayerData;
	let copiedAddress: boolean = false;

	// Reactive Player Stats:
	$: currentBalance = playerData.balancesOverTime[playerData.balancesOverTime.length - 1];
	$: claimTXs = playerData.txs.filter(tx => tx.type === 'claim') as ClaimTX[];
	$: prizesClaimed = claimTXs.map(tx => tx.data.prizes.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
	$: numPrizes = claimTXs.map(tx => tx.data.prizes.length).reduce((a, b) => a + b, 0);
	$: firstDepositTimestamp = playerData.txs.slice().reverse().find(tx => tx.type === 'deposit')?.data.timestamp;
	$: firstDepositDate = firstDepositTimestamp ? (new Date(firstDepositTimestamp * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : undefined;

	// Function to copy address to clipboard:
	const copyAddress = () => {
		navigator.clipboard.writeText(wallet);
		copiedAddress = true;
		setTimeout(() => copiedAddress = false, 3000);
	}
	
</script>

<!-- #################################################################################################### -->

<!-- Player Header -->
<h1>Player Stats: <span class="wallet" title="{wallet}">{getShortWallet(wallet)}</span> <i class="icofont-copy-invert" on:click={copyAddress} on:keydown={copyAddress}><span class="copyTooltip" class:hide={!copiedAddress}>Copied!</span></i></h1>

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
		width: 100%;
		margin: .5em 0;
		text-align: center;
		flex-wrap: wrap;
	}

	i {
		position: relative;
		display: flex;
		align-items: center;
		font-size: .7em;
		cursor: pointer;
	}

	i:hover {
		color: var(--light-purple);
	}

	span.wallet {
		white-space: nowrap;
	}

	span.copyTooltip {
		position: absolute;
		left: 2em;
		color: grey;
		font-size: .7em;
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