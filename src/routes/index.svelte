<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Chart, registerables } from 'chart.js';
	import { lineChartConfig, pieChartConfig, setLineChartData, setPieChartData } from '$lib/charts';
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	// Charts:
	let testLineChart: Chart;
	let testPieChart: Chart;

	onMount(() => {

		// Chart.js Registrations:
		Chart.register(...registerables, ChartDataLabels);

		// Initializing Charts:
		testLineChart = new Chart('testLineChart', structuredClone(lineChartConfig));
		testPieChart = new Chart('testPieChart', structuredClone(pieChartConfig));

		// Setting Chart Data:
		setLineChartData(testLineChart, ['0', '1', '2', '3', '4', '5'], [{ label: 'Test Label', data: [0, 1, 2, 3, 4, 5] }]);
		testLineChart.update();
		setPieChartData(testPieChart, ['$15+', '$30+', '$100+'], [10, 5, 20], 5, 'Deposits');
		testPieChart.update();

	});
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics." />
</svelte:head>

<!-- Line Chart Testing -->
<canvas id="testLineChart" />

<!-- Pie Chart Testing -->
<canvas id="testPieChart" />

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