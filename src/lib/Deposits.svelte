<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { getChainName } from '$lib/functions';
	import { Chart, registerables } from 'chart.js';
	import { lineChartConfig, pieChartConfig } from '$lib/charts';
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	// Data Imports:
	import ethDepositsOverTime from '$lib/data/eth/depositsOverTime.json';
	import polyDepositsOverTime from '$lib/data/poly/depositsOverTime.json';
	import avaxDepositsOverTime from '$lib/data/avax/depositsOverTime.json';
	import ethConfidentUsers from '$lib/data/eth/confidentUsers.json';
	import polyConfidentUsers from '$lib/data/poly/confidentUsers.json';
	import avaxConfidentUsers from '$lib/data/avax/confidentUsers.json';
	import ethDepositDistributions from '$lib/data/eth/depositDistributions.json';
	import polyDepositDistributions from '$lib/data/poly/depositDistributions.json';
	import avaxDepositDistributions from '$lib/data/avax/depositDistributions.json';

	// Initializations & Exports:
	export let selectedChain: 'eth' | 'poly' | 'avax';
	let cumulativeDepositCountsChart: Chart;
	let depositCountsChart: Chart;
	let cumulativeDepositAmountsChart: Chart;
	let depositAmountsChart: Chart;
	let avgDepositAmountsChart: Chart;
	let depositDistributionsChart: Chart;
	let lineColor = '#FFB636';
	let backgroundColor = lineColor + '80';
	let lineWidth = 2;
	let pointSize = 0;
	let pointHoverSize = 5;
	let lineTension = 0.2;

	// Reactive Data:
	$: depositsOverTime = getDepositsOverTime(selectedChain);
	$: confidentUsers = getConfidentUsersData(selectedChain);
	$: depositDistributions = getDepositDistributions(selectedChain);
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
	$: depositDistributions, setDepositDistributionsChartData();

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
	
	// Function to find appropriate confident users' data:
	const getConfidentUsersData = (chain: 'eth' | 'poly' | 'avax') => {
		if(chain === 'eth') {
			return ethConfidentUsers;
		} else if(chain === 'poly') {
			return polyConfidentUsers;
		} else {
			return avaxConfidentUsers;
		}
	}

	// Function to find appropriate deposit distributions data:
	const getDepositDistributions = (chain: 'eth' | 'poly' | 'avax') => {
		if(chain === 'eth') {
			return ethDepositDistributions;
		} else if(chain === 'poly') {
			return polyDepositDistributions;
		} else {
			return avaxDepositDistributions;
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

	// Function to set deposit distributions chart data:
	const setDepositDistributionsChartData = () => {
		if(depositDistributionsChart) {
			depositDistributionsChart.data.labels = ['<$10', '$10-$100', '$100-$500', '$500-$1,000', '$1,000-$5,000', '$5,000-$50,000', '>$50,000'];
			depositDistributionsChart.data.datasets[0].data = Object.values(depositDistributions[0]);
			depositDistributionsChart.data.datasets[0].backgroundColor = ['#9f82d7', '#8D70C4', '#7B5EB0', '#6A4D9D', '#583B89', '#462976', '#341762'];
			depositDistributionsChart.data.datasets[0].borderColor = ['#4c249f'];
			depositDistributionsChart.data.datasets[0].borderWidth = 10;
			if(depositDistributionsChart.options.plugins?.tooltip && depositDistributionsChart.options.plugins?.datalabels) {
				depositDistributionsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `  ${item.label}: ${item.formattedValue} TXs` } };
				depositDistributionsChart.options.plugins.datalabels.formatter = (value: string, context: any) => {
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
			depositDistributionsChart.update();
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
		depositDistributionsChart = new Chart('depositDistributionsChart', structuredClone(pieChartConfig));
		
		// Setting Chart Data:
		setCumulativeDepositCountsChartData();
		setDepositCountsChartData();
		setCumulativeDepositAmountsChartData();
		setDepositAmountsChartData();
		setAvgDepositAmountsChartData();
		setDepositDistributionsChartData();

	});
	
</script>

<!-- #################################################################################################### -->

<section id="deposits">

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

	<!-- Deposit Distributions Chart -->
	<span>The distribution of deposit transactions on <strong>{getChainName(selectedChain)}</strong> is as follows:</span>
	<canvas id="depositDistributionsChart" class="pieChart" />

	<!-- Confident Depositors -->
	<div>
		<span>Some may choose to deposit a small amount first to test out the waters, then later deposit more.</span>
		<span>Turns out <strong>{confidentUsers[0].totalCount.toLocaleString(undefined)}</strong> users did just that, with under <strong>$100</strong>!</span>
		{#if confidentUsers[0].withClaim === 1}
			<span>Only <strong>one</strong> of these users claimed a prize before choosing to deposit a larger amount.</span>
		{:else if confidentUsers[0].withClaim > 1}
			<span>Out of these, <strong>{confidentUsers[0].withClaim.toLocaleString(undefined)}</strong> users (<strong>{((confidentUsers[0].withClaim / confidentUsers[0].totalCount) * 100).toFixed(1)}%</strong>) won a prize before choosing to deposit a larger amount.</span>
		{:else}
			<span>None of these users won a prize before choosing to deposit a larger amount.</span>
		{/if}
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