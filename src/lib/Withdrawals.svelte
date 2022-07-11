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
	let cumulativeWithdrawalCountsChart: Chart;
	let withdrawalCountsChart: Chart;
	let cumulativeWithdrawalAmountsChart: Chart;
	let withdrawalAmountsChart: Chart;
	let avgWithdrawalAmountsChart: Chart;

	// JSON Files:
	let withdrawalsOverTime: { timestamps: number[], withdrawalAmounts: number[], withdrawalCounts: number[], avgWithdrawalAmounts: number[], cumulativeWithdrawalAmounts: number[], cumulativeWithdrawalCounts: number[] }[] | undefined;
	let winlessWithdrawals: { totalCount: number, estimatedBlockTime: number, avgBlocksDeposited: number, avgTimeDepositedInSeconds: number, avgTimeDepositedInDays: number }[] | undefined;
	let walletsOverTime: { timestamps: number[], walletCounts: number[], cumulativeWalletCounts: number[] }[] | undefined;
	let movingUsers: { totalWithdrawingUsers: number, movingUserCount: number, topDestination: 'eth' | 'poly' | 'avax' | 'op' }[] | undefined;

	// Reactive Data:
	$: getWithdrawalsOverTime(selectedChain);
	$: getWinlessWithdrawals(selectedChain);
	$: getWalletsOverTime(selectedChain);
	$: getMovingUsers(selectedChain);
	$: timestamps = withdrawalsOverTime ? withdrawalsOverTime[0].timestamps.map(time => (new Date(time * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })) : [];
	$: totalWithdrawalCount = withdrawalsOverTime ? withdrawalsOverTime[0].cumulativeWithdrawalCounts[withdrawalsOverTime[0].cumulativeWithdrawalCounts.length - 1] : 0;
	$: totalWithdrawalAmount = withdrawalsOverTime ? withdrawalsOverTime[0].cumulativeWithdrawalAmounts[withdrawalsOverTime[0].cumulativeWithdrawalAmounts.length - 1] : 0;
	$: avgWithdrawalAmount = withdrawalsOverTime ? Math.ceil((withdrawalsOverTime[0].avgWithdrawalAmounts.reduce((a, b) => a + b, 0)) / withdrawalsOverTime[0].avgWithdrawalAmounts.length) : 0;
	$: totalWallets = walletsOverTime ? walletsOverTime[0].cumulativeWalletCounts[walletsOverTime[0].cumulativeWalletCounts.length - 1] : 0;

	// Reactive Chart Data:
	$: withdrawalsOverTime, setCumulativeWithdrawalCountsChartData();
	$: withdrawalsOverTime, setWithdrawalCountsChartData();
	$: withdrawalsOverTime, setCumulativeWithdrawalAmountsChartData();
	$: withdrawalsOverTime, setWithdrawalAmountsChartData();
	$: withdrawalsOverTime, setAvgWithdrawalAmountsChartData();

	// Function to find appropriate withdrawals over time data:
	const getWithdrawalsOverTime = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		withdrawalsOverTime = (await import(`./data/${chain}/withdrawalsOverTime.json`)).default;
	}

	// Function to find appropriate winless withdrawals data:
	const getWinlessWithdrawals = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		winlessWithdrawals = (await import(`./data/${chain}/winlessWithdrawals.json`)).default;
	}

	// Function to find appropriate wallets data:
	const getWalletsOverTime = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		walletsOverTime = (await import(`./data/${chain}/walletsOverTime.json`)).default;
	}

	// Function to find appropriate moving users' data:
	const getMovingUsers = async (chain: 'eth' | 'poly' | 'avax' | 'op') => {
		movingUsers = (await import(`./data/${chain}/movingUsers.json`)).default;
	}

	// Function to set cumulative withdrawal counts chart data:
	const setCumulativeWithdrawalCountsChartData = () => {
		if(cumulativeWithdrawalCountsChart && withdrawalsOverTime) {
			cumulativeWithdrawalCountsChart.data.labels = timestamps;
			cumulativeWithdrawalCountsChart.data.datasets = [{
				label: 'Withdrawals',
				data: withdrawalsOverTime[0].cumulativeWithdrawalCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			cumulativeWithdrawalCountsChart.update();
		}
	}

	// Function to set withdrawal counts chart data:
	const setWithdrawalCountsChartData = () => {
		if(withdrawalCountsChart && withdrawalsOverTime) {
			withdrawalCountsChart.data.labels = timestamps;
			withdrawalCountsChart.data.datasets = [{
				label: 'Withdrawals',
				data: withdrawalsOverTime[0].withdrawalCounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			withdrawalCountsChart.update();
		}
	}

	// Function to set cumulative withdrawal amounts chart data:
	const setCumulativeWithdrawalAmountsChartData = () => {
		if(cumulativeWithdrawalAmountsChart && withdrawalsOverTime) {
			cumulativeWithdrawalAmountsChart.data.labels = timestamps;
			cumulativeWithdrawalAmountsChart.data.datasets = [{
				label: 'Withdrawal Amount',
				data: withdrawalsOverTime[0].cumulativeWithdrawalAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(cumulativeWithdrawalAmountsChart.options.plugins?.tooltip && cumulativeWithdrawalAmountsChart.options.scales?.y && cumulativeWithdrawalAmountsChart.options.scales.y.ticks) {
				cumulativeWithdrawalAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				cumulativeWithdrawalAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			cumulativeWithdrawalAmountsChart.update();
		}
	}

	// Function to set withdrawal amounts chart data:
	const setWithdrawalAmountsChartData = () => {
		if(withdrawalAmountsChart && withdrawalsOverTime) {
			withdrawalAmountsChart.data.labels = timestamps;
			withdrawalAmountsChart.data.datasets = [{
				label: 'Withdrawal Amount',
				data: withdrawalsOverTime[0].withdrawalAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(withdrawalAmountsChart.options.plugins?.tooltip && withdrawalAmountsChart.options.scales?.y && withdrawalAmountsChart.options.scales.y.ticks) {
				withdrawalAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				withdrawalAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			withdrawalAmountsChart.update();
		}
	}

	// Function to set average withdrawal amounts chart data:
	const setAvgWithdrawalAmountsChartData = () => {
		if(avgWithdrawalAmountsChart && withdrawalsOverTime) {
			avgWithdrawalAmountsChart.data.labels = timestamps;
			avgWithdrawalAmountsChart.data.datasets = [{
				label: 'Average Withdrawal Amount',
				data: withdrawalsOverTime[0].avgWithdrawalAmounts,
				backgroundColor: backgroundColor,
				borderColor: lineColor,
				borderWidth: lineWidth,
				pointRadius: pointSize,
				pointHoverRadius: pointHoverSize,
				tension: lineTension
			}];
			if(avgWithdrawalAmountsChart.options.plugins?.tooltip && avgWithdrawalAmountsChart.options.scales?.y && avgWithdrawalAmountsChart.options.scales.y.ticks) {
				avgWithdrawalAmountsChart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				avgWithdrawalAmountsChart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
			}
			avgWithdrawalAmountsChart.update();
		}
	}

	onMount(() => {

		// Chart.js Registrations:
		Chart.register(...registerables, ChartDataLabels);

		// Initializing Charts:
		cumulativeWithdrawalCountsChart = new Chart('cumulativeWithdrawalCountsChart', structuredClone(lineChartConfig));
		withdrawalCountsChart = new Chart('withdrawalCountsChart', structuredClone(lineChartConfig));
		cumulativeWithdrawalAmountsChart = new Chart('cumulativeWithdrawalAmountsChart', structuredClone(lineChartConfig));
		withdrawalAmountsChart = new Chart('withdrawalAmountsChart', structuredClone(lineChartConfig));
		avgWithdrawalAmountsChart = new Chart('avgWithdrawalAmountsChart', structuredClone(lineChartConfig));
		
		// Setting Chart Data:
		setCumulativeWithdrawalCountsChartData();
		setWithdrawalCountsChartData();
		setCumulativeWithdrawalAmountsChartData();
		setWithdrawalAmountsChartData();
		setAvgWithdrawalAmountsChartData();

	});
	
</script>

<!-- #################################################################################################### -->

<section id="withdrawals">

	<!-- Section Title -->
	<h2>Withdrawal Stats</h2>

	<!-- Cumulative Withdrawal Counts Over Time Chart -->
	<span>Users withdrew funds on <strong>{getChainName(selectedChain)}</strong> over <strong>{totalWithdrawalCount.toLocaleString(undefined)}</strong> times!</span>
	<canvas id="cumulativeWithdrawalCountsChart" />

	<!-- Withdrawal Counts Over Time Chart -->
	<span>Here's a more granular look at these withdrawals:</span>
	<canvas id="withdrawalCountsChart" />

	<!-- Cumulative Withdrawal Amounts Over Time Chart -->
	<span>This amounts to over <strong>${totalWithdrawalAmount.toLocaleString(undefined)}</strong> in withdrawals over time.</span>
	<canvas id="cumulativeWithdrawalAmountsChart" />

	<!-- Withdrawal Amounts Over Time Chart -->
	<span>Here's a more granular look at these amounts:</span>
	<canvas id="withdrawalAmountsChart" />

	<!-- Winless Withdrawals -->
	<div>
		<span>Some users may be dissapointed that they haven't won any prizes, resulting in a full withdrawal.</span>
		<span>This was the case with <strong>{winlessWithdrawals ? winlessWithdrawals[0].totalCount.toLocaleString(undefined) : 0}</strong> users, or <strong>{winlessWithdrawals && walletsOverTime ? ((winlessWithdrawals[0].totalCount / totalWallets) * 100).toFixed(1) : 0}%</strong> of all users on <strong>{getChainName(selectedChain)}</strong>.</span>
		<span>These users were deposited for an average of <strong>{winlessWithdrawals && winlessWithdrawals[0].avgTimeDepositedInDays ? winlessWithdrawals[0].avgTimeDepositedInDays.toLocaleString(undefined) : 0}</strong> days before fully withdrawing.</span>
	</div>

	<!-- Avg Withdrawal Amounts Over Time Chart -->
	<span>The all-time average withdrawal on <strong>{getChainName(selectedChain)}</strong> is of <strong>${avgWithdrawalAmount.toLocaleString(undefined)}</strong>:</span>
	<canvas id="avgWithdrawalAmountsChart" />

	<!-- Moving Users -->
	<div>
		<span>Out of the <strong>{movingUsers ? movingUsers[0].totalWithdrawingUsers.toLocaleString(undefined) : 0}</strong> users that completely withdrew their balances on <strong>{getChainName(selectedChain)}</strong>, how many did so only to move to another chain and deposit there?</span>
		<span>The answer is <strong>{movingUsers ? movingUsers[0].movingUserCount.toLocaleString(undefined) : 0}</strong> of them (<strong>{movingUsers ? ((movingUsers[0].movingUserCount / movingUsers[0].totalWithdrawingUsers) * 100).toFixed(1) : 0}%</strong>), with the most common destination being <strong>{movingUsers ? getChainName(movingUsers[0].topDestination) : '?'}</strong>.</span>
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
	
</style>