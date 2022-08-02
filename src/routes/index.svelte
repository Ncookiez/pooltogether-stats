<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { timestampsToDates } from '$lib/functions';
	import { ethData, polyData, avaxData, opData } from '$lib/stores';
	import PieChart from '$lib/PieChart.svelte';
	import LineChart from '$lib/LineChart.svelte';

	// Type Imports:
	import type { LineChartInfo, PieChartInfo } from '$lib/types';

	// Charts:
	// :3

	onMount(() => {
		// :3
	});
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>Pool Explorer</title>
	<meta name="description" content="An app for exploring all there is to see about PoolTogether statistics." />
</svelte:head>

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>