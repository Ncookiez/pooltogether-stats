<script lang="ts">

	// Imports:
	import { goto } from '$app/navigation';
	import { selectedChains } from '$lib/stores';
	import { getChainName } from '$lib/functions';

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	export let maintenanceMode: boolean = false;
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	let searchModalOpen = false;
	let searchWallet = '';

	// Function to search for given wallet:
	const search = () => {
		if(searchWallet.startsWith('0x') && searchWallet.length === 42) {
			goto(`/${searchWallet}`);
			searchWallet = '';
			searchModalOpen = false;
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
		<div class="playerSearch" on:click={() => { searchModalOpen = !searchModalOpen; }} on:keydown={() => { searchModalOpen = !searchModalOpen; }}>
			<span>Search</span>
			<i class="icofont-ui-search" />
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

	div.cover {
		position: fixed;
		inset: var(--navbar-height) 0 50px 0;
		backdrop-filter: brightness(0.3) blur(3px);
	}

	div.playerSearchModal {
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