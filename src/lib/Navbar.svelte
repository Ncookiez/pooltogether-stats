<script lang="ts">

	// Imports:
	import { page } from "$app/stores";
	import { getChainName } from "$lib/functions";

	// Type Imports:
	import type { Chain } from '$lib/types';

	// Initializations:
	const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];
	
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
		<a class="dashboard" class:selected={$page.routeId === ''} href="/">Dashboard</a>
		{#each chains as chain}
			<a class="{chain}" class:selected={$page.routeId === chain} href="/{chain}"><img src="/images/{chain}.svg" alt="{chain.toUpperCase()}">{getChainName(chain)}</a>
		{/each}
	</div>

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
	
</style>