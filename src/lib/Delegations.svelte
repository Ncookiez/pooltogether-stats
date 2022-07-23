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
	let cumulativeDelegationCountsChart: Chart;
	let cumulativeDelegationAmountsChart: Chart;
	let aggregatedDelegationValuesChart: Chart;

	// JSON Files:
	let delegationsOverTime: { timestamps: number[], delegationAmounts: number[], delegationCounts: number[], delegationWithdrawalAmounts: number[], delegationWithdrawalCounts: number[], avgDelegationAmounts: number[], cumulativeDelegationAmounts: number[], cumulativeDelegationCounts: number[], cumulativeDelegationWithdrawalAmounts: number[], cumulativeDelegationWithdrawalCounts: number[] }[] | undefined;
	let delegationsUpdated: { txHash: string, block: number, delegator: string, newDelegatee: string }[] | undefined;

	// Reactive Data:
	$: getDelegationsOverTime(selectedChain);
	$: getDelegationsUpdated(selectedChain);
	$: timestamps = delegationsOverTime ? delegationsOverTime[0].timestamps.map(time => (new Date(time * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })) : [];
	$: totalDelegationCount = delegationsOverTime ? delegationsOverTime[0].cumulativeDelegationCounts[delegationsOverTime[0].cumulativeDelegationCounts.length - 1] : 0;
	$: totalDelegationAmount = delegationsOverTime ? delegationsOverTime[0].cumulativeDelegationAmounts[delegationsOverTime[0].cumulativeDelegationAmounts.length - 1] : 0;
	$: avgDelegationAmount = totalDelegationCount > 0 ? Math.ceil(totalDelegationAmount / totalDelegationCount) : 0;

	// Reactive Chart Data:
	$: delegationsOverTime, setCumulativeDelegationCountsChartData();
	$: delegationsOverTime, setCumulativeDelegationAmountsChartData();
	$: delegationsOverTime, setAggregatedDelegationValuesChartData();

	// Function to find appropriate delegations over time data:
	const getDelegationsOverTime = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		delegationsOverTime = (await import(`./data/${chain}/delegationsOverTime.json`)).default;
	}

	// Function to find appropriate delegations over time data:
	const getDelegationsUpdated = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		try {
			delegationsUpdated = (await import(`./data/${chain}/delegationsUpdated.json`)).default;
		} catch {
			delegationsUpdated = [];
		}
	}

	// Function to set cumulative delegation counts chart data:
	const setCumulativeDelegationCountsChartData = () => {
		if(cumulativeDelegationCountsChart && delegationsOverTime) {
			cumulativeDelegationCountsChart.data.labels = timestamps;
			cumulativeDelegationCountsChart.data.datasets = [{
				label: 'Delegations',
				data: delegationsOverTime[0].cumulativeDelegationCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			cumulativeDelegationCountsChart.update();
		}
	}

	// Function to set cumulative delegation amounts chart data:
	const setCumulativeDelegationAmountsChartData = () => {
		if(cumulativeDelegationAmountsChart && delegationsOverTime) {
			cumulativeDelegationAmountsChart.data.labels = timestamps;
			cumulativeDelegationAmountsChart.data.datasets = [{
				label: 'Delegation Amount',
				data: delegationsOverTime[0].cumulativeDelegationAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(cumulativeDelegationAmountsChart.options.plugins?.tooltip && cumulativeDelegationAmountsChart.options.scales?.y && cumulativeDelegationAmountsChart.options.scales.y.ticks) {
				cumulativeDelegationAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				cumulativeDelegationAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			cumulativeDelegationAmountsChart.update();
		}
	}

	// Function to set aggregated delegation values chart data:
	const setAggregatedDelegationValuesChartData = () => {
		if(aggregatedDelegationValuesChart && delegationsOverTime) {
			let aggregatedData: number[] = [];
			for(let i = 0; i < delegationsOverTime[0].timestamps.length; i++) {
				let delegationsFunded = delegationsOverTime[0].cumulativeDelegationAmounts[i];
				let delegationsWithdrawn = delegationsOverTime[0].cumulativeDelegationWithdrawalAmounts[i];
				aggregatedData.push(delegationsFunded - delegationsWithdrawn);
			}
			aggregatedDelegationValuesChart.data.labels = timestamps;
			aggregatedDelegationValuesChart.data.datasets = [{
				label: 'Delegation Value',
				data: aggregatedData,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(aggregatedDelegationValuesChart.options.plugins?.tooltip && aggregatedDelegationValuesChart.options.scales?.y && aggregatedDelegationValuesChart.options.scales.y.ticks) {
				aggregatedDelegationValuesChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				aggregatedDelegationValuesChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			aggregatedDelegationValuesChart.update();
		}
	}

	onMount(() => {

		// Chart.js Registrations:
		Chart.register(...registerables, ChartDataLabels);

		// Initializing Charts:
		cumulativeDelegationCountsChart = new Chart('cumulativeDelegationCountsChart', structuredClone(lineChartConfig));
		cumulativeDelegationAmountsChart = new Chart('cumulativeDelegationAmountsChart', structuredClone(lineChartConfig));
		aggregatedDelegationValuesChart = new Chart('aggregatedDelegationValuesChart', structuredClone(lineChartConfig));
		
		// Setting Chart Data:
		setCumulativeDelegationCountsChartData();
		setCumulativeDelegationAmountsChartData();
		setAggregatedDelegationValuesChartData();

	});
	
</script>

<!-- #################################################################################################### -->

<section id="delegations">

	<!-- Section Title -->
	<h2>Delegation Stats</h2>

	<!-- Cumulative Delegation Counts Over Time Chart -->
	<span>Users have delegated to others over <strong>{totalDelegationCount.toLocaleString(undefined)}</strong> times!</span>
	<canvas id="cumulativeDelegationCountsChart" />

	<!-- Cumulative Delegation Amounts Over Time Chart -->
	<span>This amounts to over <strong>${totalDelegationAmount.toLocaleString(undefined)}</strong> delegated over time, with an average delegation of <strong>${avgDelegationAmount.toLocaleString(undefined)}</strong>!</span>
	<canvas id="cumulativeDelegationAmountsChart" />

	<!-- Updating Users -->
	<div>
		<span>You can change who you are delegating to at any time, without having to make any deposits or withdrawals!</span>
		<span>This makes a bit trickier to track delegations, but is an amazing feature.</span>
		{#if delegationsUpdated === undefined || delegationsUpdated.length === 0}
			<span>Unfortunately, on <strong>{getChainName(selectedChain)}</strong> this was never utilized.</span>
		{:else}
			<span>On <strong>{getChainName(selectedChain)}</strong>, users have done this <strong>{delegationsUpdated.length}</strong> times!</span>
		{/if}
	</div>

	<!-- Aggregated Delegation Values Over Time Chart -->
	<span>By subtracting withdrawals from delegation funding transactions, we can get essentially a "delegations TVL":</span>
	<canvas id="aggregatedDelegationValuesChart" />

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