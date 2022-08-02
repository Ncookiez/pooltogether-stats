<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { getChainName, timestampsToDates } from '$lib/functions';
	import { ethData, polyData, avaxData, opData } from '$lib/stores';
	import PieChart from '$lib/PieChart.svelte';
	import LineChart from '$lib/LineChart.svelte';
	import Highlight from '$lib/Highlight.svelte';

	// Type Imports:
	import type { Chain, LineChartInfo, PieChartInfo, Line } from '$lib/types';

	// Initializations:
	const chain: Chain = 'op';
	const chainName = getChainName(chain);

	// Charts:
	const tvlChart: LineChartInfo = { name: `${chain}TvlChart`, title: 'TVL Over Time', xAxisValues: [], data: [{ label: 'TVL', data: [] }], dollarValues: true };
	const cumulativeDepositAmountsChart: LineChartInfo = { name: `${chain}CumulativeDepositAmountsChart`, title: 'Cumulative Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };
	const cumulativeDepositCountsChart: LineChartInfo = { name: `${chain}CumulativeDepositCountsChart`, title: 'Cumulative Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }] };
	const depositAmountsChart: LineChartInfo = { name: `${chain}DepositAmountsChart`, title: 'Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };
	const depositCountsChart: LineChartInfo = { name: `${chain}DepositCountsChart`, title: 'Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }] };
	const avgDepositAmountsChart: LineChartInfo = { name: `${chain}AvgDepositAmountsChart`, title: 'Average Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Average Deposit Amount', data: [] }], dollarValues: true };
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

	onMount(() => {
		if($opData.tvlOverTime && $opData.depositsOverTime && $opData.withdrawalsOverTime && $opData.claimsOverTime && $opData.delegationsOverTime && $opData.yieldOverTime && $opData.tvlDistribution && $ethData.movingUsers && $polyData.movingUsers && $avaxData.movingUsers) {

			// Timestamp Initializations:
			const tvlOverTimeTimestamps = timestampsToDates($opData.tvlOverTime.timestamps);
			const depositsOverTimeTimestamps = timestampsToDates($opData.depositsOverTime.timestamps);
			const withdrawalsOverTimeTimestamps = timestampsToDates($opData.withdrawalsOverTime.timestamps);
			const claimsOverTimeTimestamps = timestampsToDates($opData.claimsOverTime.timestamps);
			const delegationsOverTimeTimestamps = timestampsToDates($opData.delegationsOverTime.timestamps);
			const yieldOverTimeTimestamps = timestampsToDates($opData.yieldOverTime.timestamps);

			// Section Label Initializations:
			const tvlDistributionChartLabels: string[] = ['<$10', '$10-$100', '$100-$1k', '$1k-$10k', '$10k-$100k', '$100k-$1M', '>$1M'];
			const movingUsersChartLabels: string[] = ['Ethereum', 'Polygon', 'Avalanche'];
			const claimDistributionChartLabels: string[] = ['<$5', '$5-$10', '$10-$50', '$50-$100', '$100-$500', '$500-$1k', '>$1k'];

			// Data Initializations:
			const tvlDistributionChartData: number[] = [
				$opData.tvlDistribution[1].amount,
				$opData.tvlDistribution[10].amount,
				$opData.tvlDistribution[100].amount,
				$opData.tvlDistribution[1000].amount,
				$opData.tvlDistribution[10000].amount,
				$opData.tvlDistribution[100000].amount,
				$opData.tvlDistribution[1000000].amount
			];
			const cumulativeDepositDistributionsChartData: Line[] = [
				{ label: '<$10', data: $opData.depositsOverTime.cumulativeDistributions[1], lineColor: '#ffb636' },
				{ label: '$10-$100', data: $opData.depositsOverTime.cumulativeDistributions[10], lineColor: '#ffbe4d' },
				{ label: '$100-$1k', data: $opData.depositsOverTime.cumulativeDistributions[100], lineColor: '#ffc766' },
				{ label: '$1k-$10k', data: $opData.depositsOverTime.cumulativeDistributions[1000], lineColor: '#ffd080' },
				{ label: '$10k-$100k', data: $opData.depositsOverTime.cumulativeDistributions[10000], lineColor: '#ffda99' },
				{ label: '>$100k', data: $opData.depositsOverTime.cumulativeDistributions[100000], lineColor: '#ffe3b3' }
			];
			const depositDistributionsChartData: Line[] = [
				{ label: '<$10', data: $opData.depositsOverTime.distributions[1], lineColor: '#ffb636' },
				{ label: '$10-$100', data: $opData.depositsOverTime.distributions[10], lineColor: '#ffbe4d' },
				{ label: '$100-$1k', data: $opData.depositsOverTime.distributions[100], lineColor: '#ffc766' },
				{ label: '$1k-$10k', data: $opData.depositsOverTime.distributions[1000], lineColor: '#ffd080' },
				{ label: '$10k-$100k', data: $opData.depositsOverTime.distributions[10000], lineColor: '#ffda99' },
				{ label: '>$100k', data: $opData.depositsOverTime.distributions[100000], lineColor: '#ffe3b3' }
			];
			const movingUsersChartData: number[] = [
				$ethData.movingUsers.movedToOP.amount,
				$polyData.movingUsers.movedToOP.amount,
				$avaxData.movingUsers.movedToOP.amount
			];
			const claimDistributionChartData: number[] = [
				$opData.claimsOverTime.cumulativeDistributions[1][claimsOverTimeTimestamps.length - 2],
				$opData.claimsOverTime.cumulativeDistributions[5][claimsOverTimeTimestamps.length - 2],
				$opData.claimsOverTime.cumulativeDistributions[10][claimsOverTimeTimestamps.length - 2],
				$opData.claimsOverTime.cumulativeDistributions[50][claimsOverTimeTimestamps.length - 2],
				$opData.claimsOverTime.cumulativeDistributions[100][claimsOverTimeTimestamps.length - 2],
				$opData.claimsOverTime.cumulativeDistributions[500][claimsOverTimeTimestamps.length - 2],
				$opData.claimsOverTime.cumulativeDistributions[1000][claimsOverTimeTimestamps.length - 2]
			];

			// Setting Chart X Axis Values / Section Labels:
			tvlChart.xAxisValues = tvlOverTimeTimestamps;
			cumulativeDepositAmountsChart.xAxisValues = depositsOverTimeTimestamps;
			cumulativeDepositCountsChart.xAxisValues = depositsOverTimeTimestamps;
			depositAmountsChart.xAxisValues = depositsOverTimeTimestamps;
			depositCountsChart.xAxisValues = depositsOverTimeTimestamps;
			avgDepositAmountsChart.xAxisValues = depositsOverTimeTimestamps;
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
			tvlChart.data[0].data = $opData.tvlOverTime.tvls;
			cumulativeDepositAmountsChart.data[0].data = $opData.depositsOverTime.cumulativeDepositAmounts;
			cumulativeDepositCountsChart.data[0].data = $opData.depositsOverTime.cumulativeDepositCounts;
			depositAmountsChart.data[0].data = $opData.depositsOverTime.depositAmounts;
			depositCountsChart.data[0].data = $opData.depositsOverTime.depositCounts;
			avgDepositAmountsChart.data[0].data = $opData.depositsOverTime.avgDepositAmounts;
			tvlDistributionChart.data = tvlDistributionChartData;
			cumulativeDepositDistributionsChart.data.push(...cumulativeDepositDistributionsChartData);
			depositDistributionsChart.data.push(...depositDistributionsChartData);
			movingUsersChart.data = movingUsersChartData;
			cumulativeWithdrawalAmountsChart.data[0].data = $opData.withdrawalsOverTime.cumulativeWithdrawalAmounts;
			cumulativeWithdrawalCountsChart.data[0].data = $opData.withdrawalsOverTime.cumulativeWithdrawalCounts;
			withdrawalAmountsChart.data[0].data = $opData.withdrawalsOverTime.withdrawalAmounts;
			withdrawalCountsChart.data[0].data = $opData.withdrawalsOverTime.withdrawalCounts;
			cumulativeClaimAmountsChart.data[0].data = $opData.claimsOverTime.cumulativeClaimAmounts;
			cumulativeClaimCountsChart.data[0].data = $opData.claimsOverTime.cumulativeClaimCounts;
			claimAmountsChart.data[0].data = $opData.claimsOverTime.claimAmounts;
			claimCountsChart.data[0].data = $opData.claimsOverTime.claimCounts;
			avgClaimAmountsChart.data[0].data = $opData.claimsOverTime.avgClaimAmounts;
			claimDistributionChart.data = claimDistributionChartData;
			delegationTvlChart.data[0].data = $opData.delegationsOverTime.tvls;
			cumulativeDelegationAmountsChart.data[0].data = $opData.delegationsOverTime.cumulativeDelegationAmounts;
			cumulativeDelegationCountsChart.data[0].data = $opData.delegationsOverTime.cumulativeDelegationCounts;
			yieldChart.data[0].data = $opData.yieldOverTime.cumulativeYieldAmounts;
			yieldChart.data[1].data = $opData.claimsOverTime.cumulativeClaimAmounts;
		}
	});
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats | {chainName}</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics. Check out some {chainName}-specific stats!" />
</svelte:head>

<!-- Charts & Highlights -->
<LineChart {...tvlChart} />
<Highlight>
	<span>{$opData.balances.data.filter(entry => entry.balance > 0).length.toLocaleString(undefined)} Depositors</span>
</Highlight>
<LineChart {...cumulativeDepositAmountsChart} />
<LineChart {...cumulativeDepositCountsChart} />
<LineChart {...depositAmountsChart} />
<LineChart {...depositCountsChart} />
<LineChart {...avgDepositAmountsChart} />
<!-- TODO - unique wallets over time (deposits) -->
<PieChart {...tvlDistributionChart} />
<LineChart {...cumulativeDepositDistributionsChart} />
<LineChart {...depositDistributionsChart} />
<PieChart {...movingUsersChart} />
<LineChart {...cumulativeWithdrawalAmountsChart} />
<LineChart {...cumulativeWithdrawalCountsChart} />
<LineChart {...withdrawalAmountsChart} />
<LineChart {...withdrawalCountsChart} />
<!-- TODO - winless withdrawals - bigger highlight to mess around with minimum deposit and see timespans -->
<LineChart {...cumulativeClaimAmountsChart} />
<LineChart {...cumulativeClaimCountsChart} />
<LineChart {...claimAmountsChart} />
<LineChart {...claimCountsChart} />
<LineChart {...avgClaimAmountsChart} />
<PieChart {...claimDistributionChart} />
<LineChart {...delegationTvlChart} />
<!-- TODO - current unique wallets delegating with more than 0 -->
<LineChart {...cumulativeDelegationAmountsChart} />
<LineChart {...cumulativeDelegationCountsChart} />
<LineChart {...yieldChart} />
<!-- TODO - display latest deposits, latest winners, etc. (+draw data stuff) -->

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>