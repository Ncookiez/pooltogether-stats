<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { getChainName } from '$lib/functions';
	import { Chart, registerables } from 'chart.js';
	import { lineChartConfig, pieChartConfig } from '$lib/charts';
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	// Data Imports:
	import ethClaimsOverTime from '$lib/data/eth/claimsOverTime.json';
	import polyClaimsOverTime from '$lib/data/poly/claimsOverTime.json';
	import avaxClaimsOverTime from '$lib/data/avax/claimsOverTime.json';
	import ethAvgClaimTime from '$lib/data/eth/avgClaimTime.json';
	import polyAvgClaimTime from '$lib/data/poly/avgClaimTime.json';
	import avaxAvgClaimTime from '$lib/data/avax/avgClaimTime.json';
	import ethClaimDistributions from '$lib/data/eth/claimDistributions.json';
	import polyClaimDistributions from '$lib/data/poly/claimDistributions.json';
	import avaxClaimDistributions from '$lib/data/avax/claimDistributions.json';

	// Initializations & Exports:
	export let selectedChain: 'eth' | 'poly' | 'avax';
	let cumulativeClaimCountsChart: Chart;
	let claimCountsChart: Chart;
	let cumulativePrizeCountsChart: Chart;
	let prizeCountsChart: Chart;
	let cumulativeClaimAmountsChart: Chart;
	let claimAmountsChart: Chart;
	let avgClaimAmountsChart: Chart;
	let claimDistributionsChart: Chart;
	let lineColor = '#FFB636';
	let backgroundColor = lineColor + '80';
	let lineWidth = 2;
	let pointSize = 0;
	let pointHoverSize = 5;
	let lineTension = 0.2;

	// Reactive Data:
	$: claimsOverTime = getClaimsOverTime(selectedChain);
	$: avgClaimTime = getAvgClaimTime(selectedChain);
	$: claimDistributions = getClaimDistributions(selectedChain);
	$: timestamps = claimsOverTime[0].timestamps.map(time => (new Date(time * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
	$: totalClaimCount = claimsOverTime[0].cumulativeClaimCounts[claimsOverTime[0].cumulativeClaimCounts.length - 1];
	$: totalPrizeCount = claimsOverTime[0].cumulativePrizeCounts[claimsOverTime[0].cumulativePrizeCounts.length - 1];
	$: totalClaimAmount = claimsOverTime[0].cumulativeClaimAmounts[claimsOverTime[0].cumulativeClaimAmounts.length - 1];
	$: avgClaimAmount = Math.ceil((claimsOverTime[0].avgClaimAmounts.reduce((a, b) => a + b, 0)) / claimsOverTime[0].avgClaimAmounts.length);

	// Reactive Chart Data:
	$: claimsOverTime, setCumulativeClaimCountsChartData();
	$: claimsOverTime, setClaimCountsChartData();
	$: claimsOverTime, setCumulativePrizeCountsChartData();
	$: claimsOverTime, setPrizeCountsChartData();
	$: claimsOverTime, setCumulativeClaimAmountsChartData();
	$: claimsOverTime, setClaimAmountsChartData();
	$: avgClaimTime, setAvgClaimAmountsChartData();
	$: claimDistributions, setClaimDistributionsChartData();

	// Function to find appropriate claims over time data:
	const getClaimsOverTime = (chain: 'eth' | 'poly' | 'avax') => {
		if(chain === 'eth') {
			return ethClaimsOverTime;
		} else if(chain === 'poly') {
			return polyClaimsOverTime;
		} else {
			return avaxClaimsOverTime;
		}
	}

	// Function to find appropriate average claim time data:
	const getAvgClaimTime = (chain: 'eth' | 'poly' | 'avax') => {
		if(chain === 'eth') {
			return ethAvgClaimTime;
		} else if(chain === 'poly') {
			return polyAvgClaimTime;
		} else {
			return avaxAvgClaimTime;
		}
	}

	// Function to find appropriate claim distributions data:
	const getClaimDistributions = (chain: 'eth' | 'poly' | 'avax') => {
		if(chain === 'eth') {
			return ethClaimDistributions;
		} else if(chain === 'poly') {
			return polyClaimDistributions;
		} else {
			return avaxClaimDistributions;
		}
	}

	// Function to set cumulative claim counts chart data:
	const setCumulativeClaimCountsChartData = () => {
		if(cumulativeClaimCountsChart) {
			cumulativeClaimCountsChart.data.labels = timestamps;
			cumulativeClaimCountsChart.data.datasets = [{
				label: 'Claims',
				data: claimsOverTime[0].cumulativeClaimCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			cumulativeClaimCountsChart.update();
		}
	}

	// Function to set claim counts chart data:
	const setClaimCountsChartData = () => {
		if(claimCountsChart) {
			claimCountsChart.data.labels = timestamps;
			claimCountsChart.data.datasets = [{
				label: 'Claims',
				data: claimsOverTime[0].claimCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			claimCountsChart.update();
		}
	}

	// Function to set cumulative prize counts chart data:
	const setCumulativePrizeCountsChartData = () => {
		if(cumulativePrizeCountsChart) {
			cumulativePrizeCountsChart.data.labels = timestamps;
			cumulativePrizeCountsChart.data.datasets = [{
				label: 'Prize Claims',
				data: claimsOverTime[0].cumulativePrizeCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			cumulativePrizeCountsChart.update();
		}
	}

	// Function to set prize counts chart data:
	const setPrizeCountsChartData = () => {
		if(prizeCountsChart) {
			prizeCountsChart.data.labels = timestamps;
			prizeCountsChart.data.datasets = [{
				label: 'Prize Claims',
				data: claimsOverTime[0].prizeCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			prizeCountsChart.update();
		}
	}

	// Function to set cumulative claim amounts chart data:
	const setCumulativeClaimAmountsChartData = () => {
		if(cumulativeClaimAmountsChart) {
			cumulativeClaimAmountsChart.data.labels = timestamps;
			cumulativeClaimAmountsChart.data.datasets = [{
				label: 'Claim Amount',
				data: claimsOverTime[0].cumulativeClaimAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(cumulativeClaimAmountsChart.options.plugins?.tooltip && cumulativeClaimAmountsChart.options.scales?.y && cumulativeClaimAmountsChart.options.scales.y.ticks) {
				cumulativeClaimAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				cumulativeClaimAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			cumulativeClaimAmountsChart.update();
		}
	}

	// Function to set claim amounts chart data:
	const setClaimAmountsChartData = () => {
		if(claimAmountsChart) {
			claimAmountsChart.data.labels = timestamps;
			claimAmountsChart.data.datasets = [{
				label: 'Claim Amount',
				data: claimsOverTime[0].claimAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(claimAmountsChart.options.plugins?.tooltip && claimAmountsChart.options.scales?.y && claimAmountsChart.options.scales.y.ticks) {
				claimAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				claimAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			claimAmountsChart.update();
		}
	}

	// Function to set average claim amounts chart data:
	const setAvgClaimAmountsChartData = () => {
		if(avgClaimAmountsChart) {
			avgClaimAmountsChart.data.labels = timestamps;
			avgClaimAmountsChart.data.datasets = [{
				label: 'Average Claim Amount',
				data: claimsOverTime[0].avgClaimAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(avgClaimAmountsChart.options.plugins?.tooltip && avgClaimAmountsChart.options.scales?.y && avgClaimAmountsChart.options.scales.y.ticks) {
				avgClaimAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				avgClaimAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			avgClaimAmountsChart.update();
		}
	}

	// Function to set claim distributions chart data:
	const setClaimDistributionsChartData = () => {
		if(claimDistributionsChart) {
			claimDistributionsChart.data.labels = ['<$5', '$5-$10', '$10-$50', '$50-$100', '$100-$500', '$500-$1,000', '>$1,000'];
			claimDistributionsChart.data.datasets[0].data = Object.values(claimDistributions[0]);
			claimDistributionsChart.data.datasets[0].backgroundColor = ['#9f82d7', '#8D70C4', '#7B5EB0', '#6A4D9D', '#583B89', '#462976', '#341762'];
			claimDistributionsChart.data.datasets[0].borderColor = ['#4c249f'];
			claimDistributionsChart.data.datasets[0].borderWidth = 10;
			if(claimDistributionsChart.options.plugins?.tooltip && claimDistributionsChart.options.plugins?.datalabels) {
				claimDistributionsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `  ${item.label}: ${item.formattedValue} TXs` } };
				claimDistributionsChart.options.plugins.datalabels.formatter = (value: string, context: any) => {
          let numValue = parseInt(value);
          let totalValue = 0;
          context.dataset.data.forEach((data: string) => {
            totalValue += parseInt(data);
          });
          let percentage = (numValue / totalValue) * 100;
          if(percentage < 5) {
            return '';
          } else {
            return `${context.chart.data.labels[context.dataIndex]}\n${percentage.toFixed(1)}%`;
          }
        }
			}
			claimDistributionsChart.update();
		}
	}

	onMount(() => {

		// Chart.js Registrations:
		Chart.register(...registerables, ChartDataLabels);

		// Initializing Charts:
		cumulativeClaimCountsChart = new Chart('cumulativeClaimCountsChart', structuredClone(lineChartConfig));
		claimCountsChart = new Chart('claimCountsChart', structuredClone(lineChartConfig));
		cumulativePrizeCountsChart = new Chart('cumulativePrizeCountsChart', structuredClone(lineChartConfig));
		prizeCountsChart = new Chart('prizeCountsChart', structuredClone(lineChartConfig));
		cumulativeClaimAmountsChart = new Chart('cumulativeClaimAmountsChart', structuredClone(lineChartConfig));
		claimAmountsChart = new Chart('claimAmountsChart', structuredClone(lineChartConfig));
		avgClaimAmountsChart = new Chart('avgClaimAmountsChart', structuredClone(lineChartConfig));
		claimDistributionsChart = new Chart('claimDistributionsChart', structuredClone(pieChartConfig));
		
		// Setting Chart Data:
		setCumulativeClaimCountsChartData();
		setClaimCountsChartData();
		setCumulativePrizeCountsChartData();
		setPrizeCountsChartData();
		setCumulativeClaimAmountsChartData();
		setClaimAmountsChartData();
		setAvgClaimAmountsChartData();
		setClaimDistributionsChartData();

	});
	
</script>

<!-- #################################################################################################### -->

<section id="claims">

	<!-- Section Title -->
	<h2>Claim Stats</h2>

	<!-- Cumulative Claim Counts Over Time Chart -->
	<span>There are <strong>{totalClaimCount.toLocaleString(undefined)}</strong> claim transactions on <strong>{getChainName(selectedChain)}</strong>:</span>
	<canvas id="cumulativeClaimCountsChart" />

	<!-- Claim Counts Over Time Chart -->
	<span>Here's a more granular look at these claims:</span>
	<canvas id="claimCountsChart" />

	<!-- Cumulative Prize Counts Over Time Chart -->
	<span>Since you can claim multiple prizes at once, the total prize count is even higher, at <strong>{totalPrizeCount.toLocaleString(undefined)}</strong>!</span>
	<canvas id="cumulativePrizeCountsChart" />

	<!-- Prize Counts Over Time Chart -->
	<span>Here's a more granular look at these individual prize claims:</span>
	<canvas id="prizeCountsChart" />

	<!-- Cumulative Claim Amounts Over Time Chart -->
	<span>This amounts to over <strong>${totalClaimAmount.toLocaleString(undefined)}</strong> in claims over time!</span>
	<canvas id="cumulativeClaimAmountsChart" />

	<!-- Claim Amounts Over Time Chart -->
	<span>Here's a more granular look at these amounts:</span>
	<canvas id="claimAmountsChart" />

	<!-- Avg Claim Amounts Over Time Chart -->
	<span>The all-time average claim on <strong>{getChainName(selectedChain)}</strong> is of <strong>${avgClaimAmount.toLocaleString(undefined)}</strong>:</span>
	<canvas id="avgClaimAmountsChart" />

	<!-- Claim Distributions Chart -->
	<span>The distribution of claim transactions on <strong>{getChainName(selectedChain)}</strong> is as follows:</span>
	<canvas id="claimDistributionsChart" class="pieChart" />

	<!-- Average Claim Times -->
	<div>
		<span>How long do users have to wait since their first deposit to win a prize?</span>
		<span>On average, users on <strong>{getChainName(selectedChain)}</strong> have <strong>{avgClaimTime[0].avgClaimTimeInDays.toLocaleString(undefined)}</strong> days between their first deposit and first claim.</span>
	</div>

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

	section > span, section > div {
		margin: 1em 0;
	}

	div {
		position: relative;
		display: flex;
		flex-direction: column;
		text-align: center;
		isolation: isolate;
	}

	div::before {
		content: '';
		position: absolute;
		height: 100%;
		width: 200vw;
		margin-left: -100vw;
		background-color: var(--dark-purple);
		z-index: -1;
	}

	div > span {
		margin: .2em 0;
	}

	div > span:first-of-type {
		margin-top: 1em;
	}

	div > span:last-of-type {
		margin-bottom: 1em;
	}

	canvas.pieChart {
		margin-top: -1em;
		padding: 2em;
	}
	
</style>