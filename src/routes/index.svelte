<script lang="ts">

	// Imports:
	import PieChart from '$lib/PieChart.svelte';
	import LineChart from '$lib/LineChart.svelte';

	// Type Imports:
	import type { LineChartInfo, PieChartInfo } from '$lib/types';

	const testLineChart: LineChartInfo = {
		name: 'testLineChart',
		type: 'line',
		xAxisValues: ['1', '2', '3', '4', '5'],
		data: [{ label: 'Deposits', data: [1, 2, 3, 4, 5] }]
	}

	const testPieChart: PieChartInfo = {
		name: 'testingPieChart',
		type: 'pie',
		sectionLabels: ['s1', 's2', 's3'],
		data: [3, 3, 5]
	}
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics." />
</svelte:head>

<!-- Line Chart -->
<LineChart {...testLineChart} />

<!-- Pie Chart -->
<PieChart {...testPieChart} />

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>