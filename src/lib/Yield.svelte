<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { lineChartConfig } from '$lib/charts';
	import { Chart, registerables } from 'chart.js';
	import { getChainName, getTimestamp } from '$lib/functions';
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
	let yieldVsClaimAmountsChart: Chart;

	// JSON Files:
	let yieldOverTime: { timestamps: number[], yieldAmounts: number[], yieldCounts: number[], cumulativeYieldAmounts: number[], cumulativeYieldCounts: number[] }[] | undefined;
	let supply: { aToken: number, ticket: number } | undefined;
	let claimsOverTime: { timestamps: number[], claimAmounts: number[], claimCounts: number[], prizeCounts: number[], avgClaimAmounts: number[], cumulativeClaimAmounts: number[], cumulativeClaimCounts: number[], cumulativePrizeCounts: number[] }[] | undefined;

	// Reactive Data:
	$: getYieldOverTime(selectedChain);
	$: getSupplyData(selectedChain);
	$: getClaimsOverTime(selectedChain);
	$: timestamps = yieldOverTime ? yieldOverTime[0].timestamps.map(time => (new Date(time * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })) : [];
	$: totalYieldAmount = yieldOverTime ? yieldOverTime[0].cumulativeYieldAmounts[yieldOverTime[0].cumulativeYieldAmounts.length - 1] : 0;
	$: totalClaimAmount = claimsOverTime ? claimsOverTime[0].cumulativeClaimAmounts[claimsOverTime[0].cumulativeClaimAmounts.length - 1] : 0;

	// Reactive Chart Data:
	$: yieldOverTime, setCumulativeYieldAmountsChartData();
	$: yieldOverTime, claimsOverTime, setYieldVsClaimAmountsChartData();

	// Function to find appropriate yield over time data:
	const getYieldOverTime = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		yieldOverTime = (await import(`./data/${chain}/yieldOverTime.json`)).default;
	}

	// Function to find appropriate supply data:
	const getSupplyData = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		supply = (await import(`./data/${chain}/supply.json`)).default[0];
	}

	// Function to find appropriate claims over time data:
	const getClaimsOverTime = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		claimsOverTime = (await import(`./data/${chain}/claimsOverTime.json`)).default;
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

	// Function to set yield vs claim amounts chart data:
	const setYieldVsClaimAmountsChartData = () => {
		if(yieldVsClaimAmountsChart && yieldOverTime && claimsOverTime) {
			yieldVsClaimAmountsChart.data.labels = timestamps;
			yieldVsClaimAmountsChart.data.datasets = [
				{
					label: 'Yield Amount',
					data: yieldOverTime[0].cumulativeYieldAmounts,
					backgroundColor: backgroundColor,
					borderColor: lineColor,
					borderWidth: lineWidth,
					pointRadius: pointSize,
					pointHoverRadius: pointHoverSize,
					tension: lineTension
				},
				{
					label: 'Claim Amount',
					data: claimsOverTime[0].cumulativeClaimAmounts,
					backgroundColor: lineColor,
					borderColor: backgroundColor,
					borderWidth: lineWidth,
					pointRadius: pointSize,
					pointHoverRadius: pointHoverSize,
					tension: lineTension
				}
			];
			if(yieldVsClaimAmountsChart.options.plugins?.tooltip && yieldVsClaimAmountsChart.options.scales?.y && yieldVsClaimAmountsChart.options.scales.y.ticks) {
				yieldVsClaimAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				yieldVsClaimAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			yieldVsClaimAmountsChart.update();
		}
	}

	onMount(() => {

		// Chart.js Registrations:
		Chart.register(...registerables, ChartDataLabels);

		// Initializing Charts:
		cumulativeYieldAmountsChart = new Chart('cumulativeYieldAmountsChart', structuredClone(lineChartConfig));
		yieldVsClaimAmountsChart = new Chart('yieldVsClaimAmountsChart', structuredClone(lineChartConfig));
		
		// Setting Chart Data:
		setCumulativeYieldAmountsChartData();
		setYieldVsClaimAmountsChartData();

	});
	
</script>

<!-- #################################################################################################### -->

<section id="yield">

	<!-- Section Title -->
	<h2>Yield Stats</h2>

	<!-- Cumulative Yield Amounts Over Time Chart -->
	<span><strong>${totalYieldAmount.toLocaleString(undefined)}</strong>	in yield has been captured in <strong>{getChainName(selectedChain)}</strong> thus far.</span>
	<canvas id="cumulativeYieldAmountsChart" />

	<!-- Uncaptured Yield -->
	<div>
		<span>What about any uncaptured yield?</span>
		<span>As of <strong>{getTimestamp()}</strong>, there is <strong>{supply ? supply.aToken.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0} USDC</strong> deposited on Aave.</span>
		<span>There is <strong>${supply ? (supply.aToken - supply.ticket).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}</strong> of yield available to be claimed!</span>
	</div>

	<!-- Yield Vs Claim Amounts Chart -->
	<span>There is a <strong>{(totalYieldAmount - totalClaimAmount) > 0 ? 'surplus' : 'deficit'}</strong> of <strong>${Math.abs(totalYieldAmount - totalClaimAmount).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong> between yield captured and prize claims.</span>
	<canvas id="yieldVsClaimAmountsChart" />

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
	
</style>