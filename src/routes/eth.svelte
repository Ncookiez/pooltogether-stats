<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { ethData, polyData, avaxData, opData, startTimestamp, endTimestamp } from '$lib/stores';
	import { getChainName, getRangeArray, timestampsToDates, getDepositsOverTime, getWithdrawalsOverTime, getClaimsOverTime, getDelegationsOverTime, getYieldOverTime, getMovingUsers, getTVLOverTime } from '$lib/functions';
	import History from '$lib/History.svelte';
	import PieChart from '$lib/PieChart.svelte';
	import LineChart from '$lib/LineChart.svelte';
	import Highlight from '$lib/Highlight.svelte';

	// Type Imports:
	import type { Chain, LineChartInfo, PieChartInfo, Line } from '$lib/types';

	// Initializations:
	const chain: Chain = 'eth';
	const chainName = getChainName(chain);
	const ticks = 50;
	const defaultMaxTimestamp = 9_999_999_999;
	const dayInSeconds = 86400;
	let minWinlessWithdrawalsBalance: number | undefined = undefined;

	// Charts:
	const tvlChart: LineChartInfo = { name: `${chain}TvlChart`, title: 'TVL Over Time', xAxisValues: [], data: [{ label: 'TVL', data: [] }], dollarValues: true };
	const cumulativeDepositAmountsChart: LineChartInfo = { name: `${chain}CumulativeDepositAmountsChart`, title: 'Cumulative Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };
	const cumulativeDepositCountsChart: LineChartInfo = { name: `${chain}CumulativeDepositCountsChart`, title: 'Cumulative Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }] };
	const depositAmountsChart: LineChartInfo = { name: `${chain}DepositAmountsChart`, title: 'Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };
	const depositCountsChart: LineChartInfo = { name: `${chain}DepositCountsChart`, title: 'Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }] };
	const avgDepositAmountsChart: LineChartInfo = { name: `${chain}AvgDepositAmountsChart`, title: 'Average Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Average Deposit Amount', data: [] }], dollarValues: true };
	const cumulativeUniqueWalletsChart: LineChartInfo = { name: `${chain}CumulativeUniqueWalletsChart`, title: 'Cumulative Unique Wallets Over Time', xAxisValues: [], data: [{ label: 'Wallets', data: [] }] };
	const tvlDistributionChart: PieChartInfo = { name: `${chain}TvlDistributionsChart`, title: 'TVL Distribution By User Deposit Amount', sectionLabels: [], data: [], dollarValues: true };
	const cumulativeDepositDistributionsChart: LineChartInfo = { name: `${chain}CumulativeDepositDistributionsChart`, title: 'Cumulative Deposit Amount Frequency Over Time', xAxisValues: [], data: [] };
	const depositDistributionsChart: LineChartInfo = { name: `${chain}DepositDistributionsChart`, title: 'Deposit Amount Frequency Over Time', xAxisValues: [], data: [] };
	const movingUsersChart: PieChartInfo = { name: `${chain}MovingUsersChart`, title: `Value Moved From Other Chains`, sectionLabels: [], data: [], hiddenPercentage: 10, dollarValues: true };
	const cumulativeWithdrawalAmountsChart: LineChartInfo = { name: `${chain}CumulativeWithdrawalAmountsChart`, title: 'Cumulative Withdrawal Amounts Over Time', xAxisValues: [], data: [{ label: 'Withdrawal Amounts', data: [] }], dollarValues: true };
	const cumulativeWithdrawalCountsChart: LineChartInfo = { name: `${chain}CumulativeWithdrawalCountsChart`, title: 'Cumulative Withdrawals Over Time', xAxisValues: [], data: [{ label: 'Withdrawals', data: [] }] };
	const withdrawalAmountsChart: LineChartInfo = { name: `${chain}WithdrawalAmountsChart`, title: 'Withdrawal Amounts Over Time', xAxisValues: [], data: [{ label: 'Withdrawal Amounts', data: [] }], dollarValues: true };
	const withdrawalCountsChart: LineChartInfo = { name: `${chain}WithdrawalCountsChart`, title: 'Withdrawals Over Time', xAxisValues: [], data: [{ label: 'Withdrawals', data: [] }] };
	const cumulativeClaimAmountsChart: LineChartInfo = { name: `${chain}CumulativeClaimAmountsChart`, title: 'Cumulative Claim Amounts Over Time', xAxisValues: [], data: [{ label: 'Claim Amounts', data: [] }], dollarValues: true };
	const cumulativeClaimCountsChart: LineChartInfo = { name: `${chain}CumulativeClaimCountsChart`, title: 'Cumulative Claims Over Time', xAxisValues: [], data: [{ label: 'Claims', data: [] }] };
	const claimAmountsChart: LineChartInfo = { name: `${chain}ClaimAmountsChart`, title: 'Claim Amounts Over Time', xAxisValues: [], data: [{ label: 'Claim Amounts', data: [] }], dollarValues: true };
	const claimCountsChart: LineChartInfo = { name: `${chain}ClaimCountsChart`, title: 'Claims Over Time', xAxisValues: [], data: [{ label: 'Claims', data: [] }] };
	const avgClaimAmountsChart: LineChartInfo = { name: `${chain}AvgClaimAmountsChart`, title: 'Average Claim Amounts Over Time', xAxisValues: [], data: [{ label: 'Average Claim Amount', data: [] }], dollarValues: true };
	const claimDistributionChart: PieChartInfo = { name: `${chain}ClaimDistributionChart`, title: 'Claim Amount Distribution', sectionLabels: [], data: [], appendedLabel: 'Claims' };
	const delegationTvlChart: LineChartInfo = { name: `${chain}DelegationTvlChart`, title: 'Delegation TVL Over Time', xAxisValues: [], data: [{ label: 'TVL', data: [] }], dollarValues: true };
	const cumulativeDelegationAmountsChart: LineChartInfo = { name: `${chain}CumulativeDelegationAmountsChart`, title: 'Cumulative Delegation Amounts Over Time', xAxisValues: [], data: [{ label: 'Delegation Amounts', data: [] }], dollarValues: true };
	const cumulativeDelegationCountsChart: LineChartInfo = { name: `${chain}CumulativeDelegationCountsChart`, title: 'Cumulative Delegations Over Time', xAxisValues: [], data: [{ label: 'Delegations', data: [] }] };
	const yieldChart: LineChartInfo = { name: `${chain}YieldChart`, title: 'Yield vs Prizes', xAxisValues: [], data: [{ label: 'Yield', data: [] }, { label: 'Prizes', data: [], lineColor: '#FFB63680', backgroundColor: '#FFB636' }], dollarValues: true };

	// Reactive Chart Data:
	$: setChartData($startTimestamp, $endTimestamp);

	// Reactive Winless Withdrawals Data:
	$: winlessWithdrawals = $ethData.winlessWithdrawals ? $ethData.winlessWithdrawals.filter(wallet => wallet.maxBalance > (minWinlessWithdrawalsBalance ?? 0)) : [];
	$: winlessWithdrawalsAverageDays = winlessWithdrawals.length > 0 ? (winlessWithdrawals.reduce((a, b) => a + (b.lastWithdrawalTimestamp - b.firstDepositTimestamp), 0) / winlessWithdrawals.length / dayInSeconds).toLocaleString(undefined, { maximumFractionDigits: 0 }) : undefined;
	
	// Function to set chart data:
	const setChartData = (startTime: number, endTime: number) => {
		if($ethData.tvlOverTime && $ethData.depositsOverTime && $ethData.withdrawalsOverTime && $ethData.claimsOverTime && $ethData.delegationsOverTime && $ethData.yieldOverTime && $ethData.tvlDistribution && $polyData.movingUsers && $avaxData.movingUsers && $opData.movingUsers) {

			// Timestamp Initializations:
			let timeFilters: { start: number, end: number } | undefined;
			let customTimestamps: number[] | undefined;

			// Setting Custom Timestamps:
			if(startTime !== 0 && endTime !== defaultMaxTimestamp) {
				timeFilters = { start: startTime, end: endTime };
				customTimestamps = getRangeArray(startTime, endTime, ticks);
			} else if(startTime !== 0 && $ethData.maxTimestamp) {
				timeFilters = { start: startTime, end: $ethData.maxTimestamp };
				customTimestamps = getRangeArray(startTime, $ethData.maxTimestamp, ticks);
			} else if(endTime !== defaultMaxTimestamp && $ethData.minTimestamp) {
				timeFilters = { start: $ethData.minTimestamp, end: endTime };
				customTimestamps = getRangeArray($ethData.minTimestamp, endTime, ticks);
			}

			// Setting Raw Data:
			const depositsOverTime = customTimestamps ? getDepositsOverTime($ethData, ticks, customTimestamps) : $ethData.depositsOverTime;
			const withdrawalsOverTime = customTimestamps ? getWithdrawalsOverTime($ethData, ticks, customTimestamps) : $ethData.withdrawalsOverTime;
			const claimsOverTime = customTimestamps ? getClaimsOverTime($ethData, ticks, customTimestamps) : $ethData.claimsOverTime;
			const delegationsOverTime = customTimestamps ? getDelegationsOverTime($ethData, ticks, customTimestamps) : $ethData.delegationsOverTime;
			const tvlOverTime = customTimestamps ? getTVLOverTime(depositsOverTime, withdrawalsOverTime, claimsOverTime) : $ethData.tvlOverTime;
			const yieldOverTime = customTimestamps ? getYieldOverTime($ethData, ticks, customTimestamps) : $ethData.yieldOverTime;
			const tvlDistribution = $ethData.tvlDistribution;
			const polyMovingUsers = customTimestamps ? getMovingUsers($polyData.withdrawals.data, $ethData.deposits.data, $polyData.deposits.data, $avaxData.deposits.data, $opData.deposits.data, timeFilters) : $polyData.movingUsers;
			const avaxMovingUsers = customTimestamps ? getMovingUsers($avaxData.withdrawals.data, $ethData.deposits.data, $polyData.deposits.data, $avaxData.deposits.data, $opData.deposits.data, timeFilters) : $avaxData.movingUsers;
			const opMovingUsers = customTimestamps ? getMovingUsers($opData.withdrawals.data, $ethData.deposits.data, $polyData.deposits.data, $avaxData.deposits.data, $opData.deposits.data, timeFilters) : $opData.movingUsers;

			// Initializing Chart Timestamps:
			const tvlOverTimeTimestamps = timestampsToDates(tvlOverTime.timestamps);
			const depositsOverTimeTimestamps = timestampsToDates(depositsOverTime.timestamps);
			const withdrawalsOverTimeTimestamps = timestampsToDates(withdrawalsOverTime.timestamps);
			const claimsOverTimeTimestamps = timestampsToDates(claimsOverTime.timestamps);
			const delegationsOverTimeTimestamps = timestampsToDates(delegationsOverTime.timestamps);
			const yieldOverTimeTimestamps = timestampsToDates(yieldOverTime.timestamps);

			// Initializing Chart Section Labels:
			const tvlDistributionChartLabels: string[] = ['<$10', '$10-$100', '$100-$1k', '$1k-$10k', '$10k-$100k', '$100k-$1M', '>$1M'];
			const movingUsersChartLabels: string[] = ['Ethereum', 'Avalanche', 'Optimism'];
			const claimDistributionChartLabels: string[] = ['<$5', '$5-$10', '$10-$50', '$50-$100', '$100-$500', '$500-$1k', '>$1k'];

			// Initializing Chart Data:
			const tvlDistributionChartData: number[] = [
				tvlDistribution[1].amount,
				tvlDistribution[10].amount,
				tvlDistribution[100].amount,
				tvlDistribution[1000].amount,
				tvlDistribution[10000].amount,
				tvlDistribution[100000].amount,
				tvlDistribution[1000000].amount
			];
			const cumulativeDepositDistributionsChartData: Line[] = [
				{ label: '<$10', data: depositsOverTime.cumulativeDistributions[1], lineColor: '#ffb636' },
				{ label: '$10-$100', data: depositsOverTime.cumulativeDistributions[10], lineColor: '#ffbe4d' },
				{ label: '$100-$1k', data: depositsOverTime.cumulativeDistributions[100], lineColor: '#ffc766' },
				{ label: '$1k-$10k', data: depositsOverTime.cumulativeDistributions[1000], lineColor: '#ffd080' },
				{ label: '$10k-$100k', data: depositsOverTime.cumulativeDistributions[10000], lineColor: '#ffda99' },
				{ label: '>$100k', data: depositsOverTime.cumulativeDistributions[100000], lineColor: '#ffe3b3' }
			];
			const depositDistributionsChartData: Line[] = [
				{ label: '<$10', data: depositsOverTime.distributions[1], lineColor: '#ffb636' },
				{ label: '$10-$100', data: depositsOverTime.distributions[10], lineColor: '#ffbe4d' },
				{ label: '$100-$1k', data: depositsOverTime.distributions[100], lineColor: '#ffc766' },
				{ label: '$1k-$10k', data: depositsOverTime.distributions[1000], lineColor: '#ffd080' },
				{ label: '$10k-$100k', data: depositsOverTime.distributions[10000], lineColor: '#ffda99' },
				{ label: '>$100k', data: depositsOverTime.distributions[100000], lineColor: '#ffe3b3' }
			];
			const movingUsersChartData: number[] = [
				polyMovingUsers.movedToETH.amount,
				avaxMovingUsers.movedToETH.amount,
				opMovingUsers.movedToETH.amount
			];
			const claimDistributionChartData: number[] = [
				claimsOverTime.cumulativeDistributions[1][claimsOverTimeTimestamps.length - 2],
				claimsOverTime.cumulativeDistributions[5][claimsOverTimeTimestamps.length - 2],
				claimsOverTime.cumulativeDistributions[10][claimsOverTimeTimestamps.length - 2],
				claimsOverTime.cumulativeDistributions[50][claimsOverTimeTimestamps.length - 2],
				claimsOverTime.cumulativeDistributions[100][claimsOverTimeTimestamps.length - 2],
				claimsOverTime.cumulativeDistributions[500][claimsOverTimeTimestamps.length - 2],
				claimsOverTime.cumulativeDistributions[1000][claimsOverTimeTimestamps.length - 2]
			];

			// Setting Chart X Axis Values / Section Labels:
			tvlChart.xAxisValues = tvlOverTimeTimestamps;
			cumulativeDepositAmountsChart.xAxisValues = depositsOverTimeTimestamps;
			cumulativeDepositCountsChart.xAxisValues = depositsOverTimeTimestamps;
			depositAmountsChart.xAxisValues = depositsOverTimeTimestamps;
			depositCountsChart.xAxisValues = depositsOverTimeTimestamps;
			avgDepositAmountsChart.xAxisValues = depositsOverTimeTimestamps;
			cumulativeUniqueWalletsChart.xAxisValues = depositsOverTimeTimestamps;
			tvlDistributionChart.sectionLabels = tvlDistributionChartLabels;
			cumulativeDepositDistributionsChart.xAxisValues = depositsOverTimeTimestamps;
			depositDistributionsChart.xAxisValues = depositsOverTimeTimestamps;
			movingUsersChart.sectionLabels = movingUsersChartLabels;
			cumulativeWithdrawalAmountsChart.xAxisValues = withdrawalsOverTimeTimestamps;
			cumulativeWithdrawalCountsChart.xAxisValues = withdrawalsOverTimeTimestamps;
			withdrawalAmountsChart.xAxisValues = withdrawalsOverTimeTimestamps;
			withdrawalCountsChart.xAxisValues = withdrawalsOverTimeTimestamps;
			cumulativeClaimAmountsChart.xAxisValues = claimsOverTimeTimestamps;
			cumulativeClaimCountsChart.xAxisValues = claimsOverTimeTimestamps;
			claimAmountsChart.xAxisValues = claimsOverTimeTimestamps;
			claimCountsChart.xAxisValues = claimsOverTimeTimestamps;
			avgClaimAmountsChart.xAxisValues = claimsOverTimeTimestamps;
			tvlDistributionChart.sectionLabels = tvlDistributionChartLabels;
			claimDistributionChart.sectionLabels = claimDistributionChartLabels;
			delegationTvlChart.xAxisValues = delegationsOverTimeTimestamps;
			cumulativeDelegationAmountsChart.xAxisValues = delegationsOverTimeTimestamps;
			cumulativeDelegationCountsChart.xAxisValues = delegationsOverTimeTimestamps;
			yieldChart.xAxisValues = yieldOverTimeTimestamps;

			// Setting Chart Data:
			tvlChart.data[0].data = tvlOverTime.tvls;
			cumulativeDepositAmountsChart.data[0].data = depositsOverTime.cumulativeDepositAmounts;
			cumulativeDepositCountsChart.data[0].data = depositsOverTime.cumulativeDepositCounts;
			depositAmountsChart.data[0].data = depositsOverTime.depositAmounts;
			depositCountsChart.data[0].data = depositsOverTime.depositCounts;
			avgDepositAmountsChart.data[0].data = depositsOverTime.avgDepositAmounts;
			cumulativeUniqueWalletsChart.data[0].data = depositsOverTime.cumulativeUniqueWallets;
			tvlDistributionChart.data = tvlDistributionChartData;
			cumulativeDepositDistributionsChart.data = cumulativeDepositDistributionsChartData;
			depositDistributionsChart.data = depositDistributionsChartData;
			movingUsersChart.data = movingUsersChartData;
			cumulativeWithdrawalAmountsChart.data[0].data = withdrawalsOverTime.cumulativeWithdrawalAmounts;
			cumulativeWithdrawalCountsChart.data[0].data = withdrawalsOverTime.cumulativeWithdrawalCounts;
			withdrawalAmountsChart.data[0].data = withdrawalsOverTime.withdrawalAmounts;
			withdrawalCountsChart.data[0].data = withdrawalsOverTime.withdrawalCounts;
			cumulativeClaimAmountsChart.data[0].data = claimsOverTime.cumulativeClaimAmounts;
			cumulativeClaimCountsChart.data[0].data = claimsOverTime.cumulativeClaimCounts;
			claimAmountsChart.data[0].data = claimsOverTime.claimAmounts;
			claimCountsChart.data[0].data = claimsOverTime.claimCounts;
			avgClaimAmountsChart.data[0].data = claimsOverTime.avgClaimAmounts;
			claimDistributionChart.data = claimDistributionChartData;
			delegationTvlChart.data[0].data = delegationsOverTime.tvls;
			cumulativeDelegationAmountsChart.data[0].data = delegationsOverTime.cumulativeDelegationAmounts;
			cumulativeDelegationCountsChart.data[0].data = delegationsOverTime.cumulativeDelegationCounts;
			yieldChart.data[0].data = yieldOverTime.cumulativeYieldAmounts;
			yieldChart.data[1].data = claimsOverTime.cumulativeClaimAmounts;
		}
	}

	onMount(() => {
		setChartData($startTimestamp, $endTimestamp);
	});
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>Pool Explorer | {chainName}</title>
	<meta name="description" content="An app for exploring all there is to see about PoolTogether statistics. Check out some {chainName}-specific stats!" />
</svelte:head>

<!-- Charts & Highlights -->
<LineChart {...tvlChart} />
<Highlight hide={$endTimestamp !== defaultMaxTimestamp}>
	<span class="big">There are currently</span>
	<span class="big highlight">{$ethData.balances.data.filter(entry => entry.balance > 0).length.toLocaleString(undefined)}+ Depositors</span>
	<span class="big">on {chainName}!</span>
</Highlight>
<LineChart {...cumulativeDepositAmountsChart} />
<LineChart {...cumulativeDepositCountsChart} />
<LineChart {...depositAmountsChart} />
<LineChart {...depositCountsChart} />
<LineChart {...avgDepositAmountsChart} />
<LineChart {...cumulativeUniqueWalletsChart} />
<PieChart {...tvlDistributionChart} hide={$endTimestamp !== defaultMaxTimestamp} />
<LineChart {...cumulativeDepositDistributionsChart} />
<LineChart {...depositDistributionsChart} />
<PieChart {...movingUsersChart} />
<LineChart {...cumulativeWithdrawalAmountsChart} />
<LineChart {...cumulativeWithdrawalCountsChart} />
<LineChart {...withdrawalAmountsChart} />
<LineChart {...withdrawalCountsChart} />
<Highlight>
	<span>There are <span class="highlight">{winlessWithdrawals.length.toLocaleString(undefined)} wallets</span> that have withdrawn without claiming a prize.</span>
	{#if winlessWithdrawals.length > 0}
		<span>They remained deposited for <span class="highlight">{winlessWithdrawalsAverageDays} days</span> on average.</span>
	{/if}
	<span class="small">Filter by wallets with over $<input type="number" placeholder="?" bind:value={minWinlessWithdrawalsBalance}></span>
</Highlight>
<LineChart {...cumulativeClaimAmountsChart} />
<LineChart {...cumulativeClaimCountsChart} />
<LineChart {...claimAmountsChart} />
<LineChart {...claimCountsChart} />
<LineChart {...avgClaimAmountsChart} />
<PieChart {...claimDistributionChart} />
<LineChart {...delegationTvlChart} />
<LineChart {...cumulativeDelegationAmountsChart} />
<LineChart {...cumulativeDelegationCountsChart} />
<LineChart {...yieldChart} />
<!-- <History {chain} /> -->

<!-- #################################################################################################### -->

<style>

	span.highlight {
		color: var(--secondary-color);
		font-weight: bold;
	}

	span.big {
		font-size: 1.5em;
	}

	span.small {
		position: absolute;
		bottom: 2em;
		color: var(--light-purple);
		font-size: .9em;
	}

	span.small > input {
		width: 5em;
		margin-right: -4em;
		color: var(--light-purple);
		background: transparent;
		border: none;
	}
	
	span.small > input:focus {
		outline: none;
	}
	
</style>