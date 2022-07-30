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
	let tvlChart: LineChartInfo = {
		name: 'tvlChart',
		xAxisValues: [],
		data: [{ label: 'TVL', data: [] }]
	};

	onMount(() => {
		if($opData.tvlOverTime) {
			tvlChart.xAxisValues = timestampsToDates($opData.tvlOverTime.timestamps);
			tvlChart.data[0].data = $opData.tvlOverTime.tvls;
		}
	});
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics." />
</svelte:head>

<!-- TVL Chart -->
<LineChart {...tvlChart} />

<!-- Pie Chart -->
<!-- <PieChart {...testPieChart} /> -->

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>