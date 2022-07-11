<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { getChainName } from '$lib/functions';
	import { lineChartConfig } from '$lib/charts';
	import { Chart, registerables } from 'chart.js';
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	// Initializations & Exports:
	export let selectedChain: 'eth' | 'poly' | 'avax' | 'op';
	const lineColor = '#FFB636';
	const backgroundColor = lineColor + '80';
	const lineWidth = 2;
	const pointSize = 0;
	const pointHoverSize = 5;
	const lineTension = 0.2;

	// Charts:
	let cumulativeYieldAmountsChart: Chart;

	// JSON Files:
	let yieldOverTime: { timestamps: number[], yieldAmounts: number[], yieldCounts: number[], cumulativeYieldAmounts: number[], cumulativeYieldCounts: number[] }[] | undefined;

	// Reactive Data:
	$: getYieldOverTime(selectedChain);
	$: timestamps = yieldOverTime ? yieldOverTime[0].timestamps.map(time => (new Date(time * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })) : [];
	$: totalYieldAmount = yieldOverTime ? yieldOverTime[0].cumulativeYieldAmounts[yieldOverTime[0].cumulativeYieldAmounts.length - 1] : 0;

	// Reactive Chart Data:
	$: yieldOverTime, setCumulativeYieldAmountsChartData();

	// Function to find appropriate yield over time data:
	const getYieldOverTime = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		yieldOverTime = (await import(`./data/${chain}/yieldOverTime.json`)).default;
	}

	// Function to set cumulative yield amounts chart data:
	const setCumulativeYieldAmountsChartData = () => {
		if(cumulativeYieldAmountsChart && yieldOverTime) {
			cumulativeYieldAmountsChart.data.labels = timestamps;
			cumulativeYieldAmountsChart.data.datasets = [{
				label: 'Yield Amount',
				data: yieldOverTime[0].cumulativeYieldAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(cumulativeYieldAmountsChart.options.plugins?.tooltip && cumulativeYieldAmountsChart.options.scales?.y && cumulativeYieldAmountsChart.options.scales.y.ticks) {
				cumulativeYieldAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				cumulativeYieldAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			cumulativeYieldAmountsChart.update();
		}
	}

	onMount(() => {

		// Chart.js Registrations:
		Chart.register(...registerables, ChartDataLabels);

		// Initializing Charts:
		cumulativeYieldAmountsChart = new Chart('cumulativeYieldAmountsChart', structuredClone(lineChartConfig));
		
		// Setting Chart Data:
		setCumulativeYieldAmountsChartData();

	});
	
</script>

<!-- #################################################################################################### -->

<section id="yield">

	<!-- Section Title -->
	<h2>Yield Stats</h2>

	<!-- Cumulative Yield Amounts Over Time Chart -->
	<span>Over <strong>${totalYieldAmount.toLocaleString(undefined)}</strong>	in yield has been captured in <strong>{getChainName(selectedChain)}</strong> thus far.</span>
	<canvas id="cumulativeYieldAmountsChart" />

</section>

<!-- #################################################################################################### -->

<style>

	section {
		display: flex;
		flex-direction: column;
		width: min(90%, 600px);
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

	section > span {
		margin: 1em 0;
	}
	
</style>