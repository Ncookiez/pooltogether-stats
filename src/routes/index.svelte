<script lang="ts">

	// Imports:
	import { goto } from '$app/navigation';
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics." />
</svelte:head>

<!-- Quick Navigation -->
<div class="quickNav">
	<span on:click={() => goto('#deposits')}>Deposits</span>
	<span on:click={() => goto('#withdrawals')}>Withdrawals</span>
	<span on:click={() => goto('#claims')}>Claims</span>
	<span on:click={() => goto('#delegations')}>Delegations</span>
	<span on:click={() => goto('#yield')}>Yield</span>
</div>

<!-- #################################################################################################### -->

<style>

	div.quickNav {
		position: fixed;
		top: calc(var(--navbar-height) + 2em);
		right: 1em;
		display: flex;
		flex-direction: column;
	}

	div.quickNav span {
		text-align: right;
		cursor: pointer;
	}

	div.quickNav span:hover::before {
		content: '> ';
	}
	
</style>