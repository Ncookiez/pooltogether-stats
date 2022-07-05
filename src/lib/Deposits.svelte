<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { getChainName } from '$lib/functions';
	import { lineChartConfig } from '$lib/charts';
	import { Chart, registerables } from 'chart.js';
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	// Data Imports:
	import ethDepositsOverTime from '$lib/data/eth/depositsOverTime.json';
	import polyDepositsOverTime from '$lib/data/poly/depositsOverTime.json';
	import avaxDepositsOverTime from '$lib/data/avax/depositsOverTime.json';

	// Initializations & Exports:
	export let selectedChain: 'eth' | 'poly' | 'avax';
	let cumulativeDepositCountsChart: Chart;
	let depositCountsChart: Chart;
	let cumulativeDepositAmountsChart: Chart;
	let depositAmountsChart: Chart;
	let avgDepositAmountsChart: Chart;
	let lineColor = '#FFB636';
	let backgroundColor = lineColor + '80';
	let lineWidth = 2;
	let pointSize = 0;
	let pointHoverSize = 5;
	let lineTension = 0.2;

	// Reactive Data:
	$: depositsOverTime = getDepositsOverTime(selectedChain);
	$: timestamps = depositsOverTime[0].timestamps.map(time => (new Date(time * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
	$: totalDepositCount = depositsOverTime[0].cumulativeDepositCounts[depositsOverTime[0].cumulativeDepositCounts.length - 1];
	$: totalDepositAmount = depositsOverTime[0].cumulativeDepositAmounts[depositsOverTime[0].cumulativeDepositAmounts.length - 1];
	$: avgDepositAmount = Math.ceil((depositsOverTime[0].avgDepositAmounts.reduce((a, b) => a + b, 0)) / depositsOverTime[0].avgDepositAmounts.length);

	// Reactive Chart Data:
	$: depositsOverTime, setCumulativeDepositCountsChartData();
	$: depositsOverTime, setDepositCountsChartData();
	$: depositsOverTime, setCumulativeDepositAmountsChartData();
	$: depositsOverTime, setDepositAmountsChartData();
	$: depositsOverTime, setAvgDepositAmountsChartData();

	// Function to find appropriate deposits over time data:
	const getDepositsOverTime = (chain: 'eth' | 'poly' | 'avax') => {
		if(chain === 'eth') {
			return ethDepositsOverTime;
		} else if(chain === 'poly') {
			return polyDepositsOverTime;
		} else {
			return avaxDepositsOverTime;
		}
	}

	// Function to set cumulative deposit counts chart data:
	const setCumulativeDepositCountsChartData = () => {
		if(cumulativeDepositCountsChart) {
			cumulativeDepositCountsChart.data.labels = timestamps;
			cumulativeDepositCountsChart.data.datasets = [{
				label: 'Deposits',
				data: depositsOverTime[0].cumulativeDepositCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			cumulativeDepositCountsChart.update();
		}
	}

	// Function to set deposit counts chart data:
	const setDepositCountsChartData = () => {
		if(depositCountsChart) {
			depositCountsChart.data.labels = timestamps;
			depositCountsChart.data.datasets = [{
				label: 'Deposits',
				data: depositsOverTime[0].depositCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			depositCountsChart.update();
		}
	}

	// Function to set cumulative deposit amounts chart data:
	const setCumulativeDepositAmountsChartData = () => {
		if(cumulativeDepositAmountsChart) {
			cumulativeDepositAmountsChart.data.labels = timestamps;
			cumulativeDepositAmountsChart.data.datasets = [{
				label: 'Deposit Amount',
				data: depositsOverTime[0].cumulativeDepositAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(cumulativeDepositAmountsChart.options.plugins?.tooltip && cumulativeDepositAmountsChart.options.scales?.y && cumulativeDepositAmountsChart.options.scales.y.ticks) {
				cumulativeDepositAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				cumulativeDepositAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			cumulativeDepositAmountsChart.update();
		}
	}

	// Function to set deposit amounts chart data:
	const setDepositAmountsChartData = () => {
		if(depositAmountsChart) {
			depositAmountsChart.data.labels = timestamps;
			depositAmountsChart.data.datasets = [{
				label: 'Deposit Amount',
				data: depositsOverTime[0].depositAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(depositAmountsChart.options.plugins?.tooltip && depositAmountsChart.options.scales?.y && depositAmountsChart.options.scales.y.ticks) {
				depositAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				depositAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			depositAmountsChart.update();
		}
	}

	// Function to set average deposit amounts chart data:
	const setAvgDepositAmountsChartData = () => {
		if(avgDepositAmountsChart) {
			avgDepositAmountsChart.data.labels = timestamps;
			avgDepositAmountsChart.data.datasets = [{
				label: 'Average Deposit Amount',
				data: depositsOverTime[0].avgDepositAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(avgDepositAmountsChart.options.plugins?.tooltip && avgDepositAmountsChart.options.scales?.y && avgDepositAmountsChart.options.scales.y.ticks) {
				avgDepositAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				avgDepositAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			avgDepositAmountsChart.update();
		}
	}

	onMount(() => {

		// Chart.js Registrations:
		Chart.register(...registerables, ChartDataLabels);

		// Initializing Charts:
		cumulativeDepositCountsChart = new Chart('cumulativeDepositCountsChart', structuredClone(lineChartConfig));
		depositCountsChart = new Chart('depositCountsChart', structuredClone(lineChartConfig));
		cumulativeDepositAmountsChart = new Chart('cumulativeDepositAmountsChart', structuredClone(lineChartConfig));
		depositAmountsChart = new Chart('depositAmountsChart', structuredClone(lineChartConfig));
		avgDepositAmountsChart = new Chart('avgDepositAmountsChart', structuredClone(lineChartConfig));
		
		// Setting Chart Data:
		setCumulativeDepositCountsChartData();
		setDepositCountsChartData();
		setCumulativeDepositAmountsChartData();
		setDepositAmountsChartData();
		setAvgDepositAmountsChartData();

	});
	
</script>

<!-- #################################################################################################### -->

<section id="depositStats">

	<!-- Section Title -->
	<h2>Deposit Stats</h2>

	<!-- Cumulative Deposit Counts Over Time Chart -->
	<span>Did you know there are over <strong>{totalDepositCount.toLocaleString(undefined)}</strong> deposits on <strong>{getChainName(selectedChain)}</strong>?</span>
	<canvas id="cumulativeDepositCountsChart" />

	<!-- Deposit Counts Over Time Chart -->
	<span>Here's a more granular look at these deposits:</span>
	<canvas id="depositCountsChart" />

	<!-- Cumulative Deposit Amounts Over Time Chart -->
	<span>This amounts to over <strong>${totalDepositAmount.toLocaleString(undefined)}</strong> deposited over time!</span>
	<canvas id="cumulativeDepositAmountsChart" />

	<!-- Deposit Amounts Over Time Chart -->
	<span>Here's a more granular look at these amounts:</span>
	<canvas id="depositAmountsChart" />

	<!-- Avg Deposit Amounts Over Time Chart -->
	<span>The all-time average deposit on <strong>{getChainName(selectedChain)}</strong> is of <strong>${avgDepositAmount.toLocaleString(undefined)}</strong>:</span>
	<canvas id="avgDepositAmountsChart" />

</section>

<!-- #################################################################################################### -->

<style>

	section {
		display: flex;
		flex-direction: column;
		width: 600px;
		padding: 1em 0;
		border-top: 2px solid white;
	}

	h2 {
		font-size: 2.5em;
		margin-bottom: .2em;
	}

	strong {
		color: var(--secondary-color);
	}

	span {
		margin: 1em 0;
	}
	
</style>