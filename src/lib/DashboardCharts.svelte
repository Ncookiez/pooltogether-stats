<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { ethData, polyData, avaxData, opData, aggregatedData, startTimestamp, endTimestamp } from '$lib/stores';
	import { getRangeArray, timestampsToDates, getDepositsOverTime, getWithdrawalsOverTime, getClaimsOverTime, getDelegationsOverTime, getYieldOverTime, getTVLOverTime } from '$lib/functions';
	import PieChart from '$lib/PieChart.svelte';
	import LineChart from '$lib/LineChart.svelte';
	import Highlight from '$lib/Highlight.svelte';

	// Type Imports:
	import type { Hash, LineChartInfo, PieChartInfo, Line, BalanceData } from '$lib/types';

	// Initializations:
	const ticks = 50;
	const defaultMaxTimestamp = 9_999_999_999;

	// Charts:
	const tvlChart: LineChartInfo = { name: `tvlChart`, title: 'TVL Over Time', xAxisValues: [], data: [{ label: 'TVL', data: [] }], dollarValues: true };
	// <TODO> stacked chart over time
	// const chainDistributionChart: LineChartInfo = {};
	const cumulativeDepositAmountsChart: LineChartInfo = { name: `cumulativeDepositAmountsChart`, title: 'Cumulative Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };
	const cumulativeDepositCountsChart: LineChartInfo = { name: `cumulativeDepositCountsChart`, title: 'Cumulative Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }] };
	const depositAmountsChart: LineChartInfo = { name: `depositAmountsChart`, title: 'Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };
	const depositCountsChart: LineChartInfo = { name: `depositCountsChart`, title: 'Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }] };
	const avgDepositAmountsChart: LineChartInfo = { name: `avgDepositAmountsChart`, title: 'Average Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Average Deposit Amount', data: [] }], dollarValues: true };
	const cumulativeUniqueWalletsChart: LineChartInfo = { name: `cumulativeUniqueWalletsChart`, title: 'Cumulative Unique Wallets Over Time', xAxisValues: [], data: [{ label: 'Wallets', data: [] }] };
	const tvlDistributionChart: PieChartInfo = { name: `tvlDistributionsChart`, title: 'TVL Distribution By User Balances', sectionLabels: [], data: [], dollarValues: true };
	// <TODO>
	// const multichainUsers: PieChartInfo = {};
	const cumulativeDepositDistributionsChart: LineChartInfo = { name: `cumulativeDepositDistributionsChart`, title: 'Cumulative Deposit Amount Frequency Over Time', xAxisValues: [], data: [] };
	const depositDistributionsChart: LineChartInfo = { name: `depositDistributionsChart`, title: 'Deposit Amount Frequency Over Time', xAxisValues: [], data: [] };
	const cumulativeWithdrawalAmountsChart: LineChartInfo = { name: `cumulativeWithdrawalAmountsChart`, title: 'Cumulative Withdrawal Amounts Over Time', xAxisValues: [], data: [{ label: 'Withdrawal Amounts', data: [] }], dollarValues: true };
	const cumulativeWithdrawalCountsChart: LineChartInfo = { name: `cumulativeWithdrawalCountsChart`, title: 'Cumulative Withdrawals Over Time', xAxisValues: [], data: [{ label: 'Withdrawals', data: [] }] };
	const withdrawalAmountsChart: LineChartInfo = { name: `withdrawalAmountsChart`, title: 'Withdrawal Amounts Over Time', xAxisValues: [], data: [{ label: 'Withdrawal Amounts', data: [] }], dollarValues: true };
	const withdrawalCountsChart: LineChartInfo = { name: `withdrawalCountsChart`, title: 'Withdrawals Over Time', xAxisValues: [], data: [{ label: 'Withdrawals', data: [] }] };
	const cumulativeClaimAmountsChart: LineChartInfo = { name: `cumulativeClaimAmountsChart`, title: 'Cumulative Claim Amounts Over Time', xAxisValues: [], data: [{ label: 'Claim Amounts', data: [] }], dollarValues: true };
	const cumulativeClaimCountsChart: LineChartInfo = { name: `cumulativeClaimCountsChart`, title: 'Cumulative Claims Over Time', xAxisValues: [], data: [{ label: 'Claims', data: [] }] };
	const claimAmountsChart: LineChartInfo = { name: `claimAmountsChart`, title: 'Claim Amounts Over Time', xAxisValues: [], data: [{ label: 'Claim Amounts', data: [] }], dollarValues: true };
	const claimCountsChart: LineChartInfo = { name: `claimCountsChart`, title: 'Claims Over Time', xAxisValues: [], data: [{ label: 'Claims', data: [] }] };
	const avgClaimAmountsChart: LineChartInfo = { name: `avgClaimAmountsChart`, title: 'Average Claim Amounts Over Time', xAxisValues: [], data: [{ label: 'Average Claim Amount', data: [] }], dollarValues: true };
	const claimDistributionChart: PieChartInfo = { name: `claimDistributionChart`, title: 'Claim Amount Distribution', sectionLabels: [], data: [], appendedLabel: 'Claims' };
	const delegationTvlChart: LineChartInfo = { name: `delegationTvlChart`, title: 'Delegation TVL Over Time', xAxisValues: [], data: [{ label: 'TVL', data: [] }], dollarValues: true };
	const cumulativeDelegationAmountsChart: LineChartInfo = { name: `cumulativeDelegationAmountsChart`, title: 'Cumulative Delegation Amounts Over Time', xAxisValues: [], data: [{ label: 'Delegation Amounts', data: [] }], dollarValues: true };
	const cumulativeDelegationCountsChart: LineChartInfo = { name: `cumulativeDelegationCountsChart`, title: 'Cumulative Delegations Over Time', xAxisValues: [], data: [{ label: 'Delegations', data: [] }] };
	const yieldChart: LineChartInfo = { name: `yieldChart`, title: 'Yield vs Prizes', xAxisValues: [], data: [{ label: 'Yield', data: [] }, { label: 'Prizes', data: [], lineColor: '#FFB63680', backgroundColor: '#FFB636' }], dollarValues: true };

	// Reactive Depositor Count:
	$: numDepositors = getNumDepositors($ethData.balances.data, $polyData.balances.data, $avaxData.balances.data, $opData.balances.data);

	// Reactive Chart Data:
	$: setChartData($startTimestamp, $endTimestamp);

	// Function to get number of depositors:
	const getNumDepositors = (ethDepositors: BalanceData[], polyDepositors: BalanceData[], avaxDepositors: BalanceData[], opDepositors: BalanceData[]) => {

		// Initiailizations:
		const uniqueWallets: Hash[] = [];

		// Filtering Ethereum Depositors:
		[ethDepositors, polyDepositors, avaxDepositors, opDepositors].forEach(chainDepositors => {
			chainDepositors.forEach(deposit => {
				if(deposit.balance > 0) {
					if(!uniqueWallets.includes(deposit.wallet)) {
						uniqueWallets.push(deposit.wallet);
					}
				}
			});
		});

		return uniqueWallets.length;
	}

	// Function to set chart data:
	const setChartData = (startTime: number, endTime: number) => {
		if($ethData.tvlOverTime && $polyData.tvlOverTime && $avaxData.tvlOverTime && $opData.tvlOverTime) {
			if($ethData.depositsOverTime && $polyData.depositsOverTime && $avaxData.depositsOverTime && $opData.depositsOverTime) {
				if($ethData.withdrawalsOverTime && $polyData.withdrawalsOverTime && $avaxData.withdrawalsOverTime && $opData.withdrawalsOverTime) {
					if($ethData.claimsOverTime && $polyData.claimsOverTime && $avaxData.claimsOverTime && $opData.claimsOverTime) {
						if($ethData.delegationsOverTime && $polyData.delegationsOverTime && $avaxData.delegationsOverTime && $opData.delegationsOverTime) {
							if($ethData.tvlDistribution && $polyData.tvlDistribution && $avaxData.tvlDistribution && $opData.tvlDistribution) {
								if($ethData.minTimestamp && $polyData.minTimestamp && $avaxData.minTimestamp && $opData.minTimestamp) {
									if($ethData.maxTimestamp && $polyData.maxTimestamp && $avaxData.maxTimestamp && $opData.maxTimestamp) {

										// Timestamp Initializations:
										const timestamps = getRangeArray(Math.max($aggregatedData.minTimestamp, startTime), Math.min($aggregatedData.maxTimestamp, endTime), ticks);
										const dateTimestamps = timestampsToDates(timestamps);

										// Setting Ethereum's Raw Data:
										const ethDepositsOverTime = getDepositsOverTime($ethData, ticks, timestamps);
										const ethWithdrawalsOverTime = getWithdrawalsOverTime($ethData, ticks, timestamps);
										const ethClaimsOverTime = getClaimsOverTime($ethData, ticks, timestamps);
										const ethDelegationsOverTime = getDelegationsOverTime($ethData, ticks, timestamps);
										const ethTvlOverTime = getTVLOverTime(ethDepositsOverTime, ethWithdrawalsOverTime, ethClaimsOverTime);
										const ethYieldOverTime = getYieldOverTime($ethData, ticks, timestamps);
										const ethTvlDistribution = $ethData.tvlDistribution;

										// Setting Polygon's Raw Data:
										const polyDepositsOverTime = getDepositsOverTime($polyData, ticks, timestamps);
										const polyWithdrawalsOverTime = getWithdrawalsOverTime($polyData, ticks, timestamps);
										const polyClaimsOverTime = getClaimsOverTime($polyData, ticks, timestamps);
										const polyDelegationsOverTime = getDelegationsOverTime($polyData, ticks, timestamps);
										const polyTvlOverTime = getTVLOverTime(polyDepositsOverTime, polyWithdrawalsOverTime, polyClaimsOverTime);
										const polyYieldOverTime = getYieldOverTime($polyData, ticks, timestamps);
										const polyTvlDistribution = $polyData.tvlDistribution;

										// Setting Avalanche's Raw Data:
										const avaxDepositsOverTime = getDepositsOverTime($avaxData, ticks, timestamps);
										const avaxWithdrawalsOverTime = getWithdrawalsOverTime($avaxData, ticks, timestamps);
										const avaxClaimsOverTime = getClaimsOverTime($avaxData, ticks, timestamps);
										const avaxDelegationsOverTime = getDelegationsOverTime($avaxData, ticks, timestamps);
										const avaxTvlOverTime = getTVLOverTime(avaxDepositsOverTime, avaxWithdrawalsOverTime, avaxClaimsOverTime);
										const avaxYieldOverTime = getYieldOverTime($avaxData, ticks, timestamps);
										const avaxTvlDistribution = $avaxData.tvlDistribution;

										// Setting Optimism's Raw Data:
										const opDepositsOverTime = getDepositsOverTime($opData, ticks, timestamps);
										const opWithdrawalsOverTime = getWithdrawalsOverTime($opData, ticks, timestamps);
										const opClaimsOverTime = getClaimsOverTime($opData, ticks, timestamps);
										const opDelegationsOverTime = getDelegationsOverTime($opData, ticks, timestamps);
										const opTvlOverTime = getTVLOverTime(opDepositsOverTime, opWithdrawalsOverTime, opClaimsOverTime);
										const opYieldOverTime = getYieldOverTime($opData, ticks, timestamps);
										const opTvlDistribution = $opData.tvlDistribution;

										// Initializing Chart Section Labels:
										const tvlDistributionChartLabels: string[] = ['<$10', '$10-$100', '$100-$1k', '$1k-$10k', '$10k-$100k', '$100k-$1M', '>$1M'];
										const claimDistributionChartLabels: string[] = ['<$5', '$5-$10', '$10-$50', '$50-$100', '$100-$500', '$500-$1k', '>$1k'];

										// Initializing Chart Data:
										const tvlDistributionChartData: number[] = [
											ethTvlDistribution[1].amount + polyTvlDistribution[1].amount + avaxTvlDistribution[1].amount + opTvlDistribution[1].amount,
											ethTvlDistribution[10].amount + polyTvlDistribution[10].amount + avaxTvlDistribution[10].amount + opTvlDistribution[10].amount,
											ethTvlDistribution[100].amount + polyTvlDistribution[100].amount + avaxTvlDistribution[100].amount + opTvlDistribution[100].amount,
											ethTvlDistribution[1000].amount + polyTvlDistribution[1000].amount + avaxTvlDistribution[1000].amount + opTvlDistribution[1000].amount,
											ethTvlDistribution[10000].amount + polyTvlDistribution[10000].amount + avaxTvlDistribution[10000].amount + opTvlDistribution[10000].amount,
											ethTvlDistribution[100000].amount + polyTvlDistribution[100000].amount + avaxTvlDistribution[100000].amount + opTvlDistribution[100000].amount,
											ethTvlDistribution[1000000].amount + polyTvlDistribution[1000000].amount + avaxTvlDistribution[1000000].amount + opTvlDistribution[1000000].amount
										];
										const cumulativeDepositDistributionsChartData: Line[] = [
											{ label: '<$10', data: ethDepositsOverTime.cumulativeDistributions[1].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[1][i] + avaxDepositsOverTime.cumulativeDistributions[1][i] + opDepositsOverTime.cumulativeDistributions[1][i]), lineColor: '#ffb636' },
											{ label: '$10-$100', data: ethDepositsOverTime.cumulativeDistributions[10].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[10][i] + avaxDepositsOverTime.cumulativeDistributions[10][i] + opDepositsOverTime.cumulativeDistributions[10][i]), lineColor: '#ffbe4d' },
											{ label: '$100-$1k', data: ethDepositsOverTime.cumulativeDistributions[100].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[100][i] + avaxDepositsOverTime.cumulativeDistributions[100][i] + opDepositsOverTime.cumulativeDistributions[100][i]), lineColor: '#ffc766' },
											{ label: '$1k-$10k', data: ethDepositsOverTime.cumulativeDistributions[1000].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[1000][i] + avaxDepositsOverTime.cumulativeDistributions[1000][i] + opDepositsOverTime.cumulativeDistributions[1000][i]), lineColor: '#ffd080' },
											{ label: '$10k-$100k', data: ethDepositsOverTime.cumulativeDistributions[10000].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[10000][i] + avaxDepositsOverTime.cumulativeDistributions[10000][i] + opDepositsOverTime.cumulativeDistributions[10000][i]), lineColor: '#ffda99' },
											{ label: '>$100k', data: ethDepositsOverTime.cumulativeDistributions[100000].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[100000][i] + avaxDepositsOverTime.cumulativeDistributions[100000][i] + opDepositsOverTime.cumulativeDistributions[100000][i]), lineColor: '#ffe3b3' }
										];
										const depositDistributionsChartData: Line[] = [
											{ label: '<$10', data: ethDepositsOverTime.distributions[1].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[1][i] + avaxDepositsOverTime.cumulativeDistributions[1][i] + opDepositsOverTime.cumulativeDistributions[1][i]), lineColor: '#ffb636' },
											{ label: '$10-$100', data: ethDepositsOverTime.distributions[10].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[10][i] + avaxDepositsOverTime.cumulativeDistributions[10][i] + opDepositsOverTime.cumulativeDistributions[10][i]), lineColor: '#ffbe4d' },
											{ label: '$100-$1k', data: ethDepositsOverTime.distributions[100].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[100][i] + avaxDepositsOverTime.cumulativeDistributions[100][i] + opDepositsOverTime.cumulativeDistributions[100][i]), lineColor: '#ffc766' },
											{ label: '$1k-$10k', data: ethDepositsOverTime.distributions[1000].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[1000][i] + avaxDepositsOverTime.cumulativeDistributions[1000][i] + opDepositsOverTime.cumulativeDistributions[1000][i]), lineColor: '#ffd080' },
											{ label: '$10k-$100k', data: ethDepositsOverTime.distributions[10000].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[10000][i] + avaxDepositsOverTime.cumulativeDistributions[10000][i] + opDepositsOverTime.cumulativeDistributions[10000][i]), lineColor: '#ffda99' },
											{ label: '>$100k', data: ethDepositsOverTime.distributions[100000].map((val, i) => val + polyDepositsOverTime.cumulativeDistributions[100000][i] + avaxDepositsOverTime.cumulativeDistributions[100000][i] + opDepositsOverTime.cumulativeDistributions[100000][i]), lineColor: '#ffe3b3' }
										];
										const claimDistributionChartData: number[] = [
											ethClaimsOverTime.cumulativeDistributions[1][timestamps.length - 2] + polyClaimsOverTime.cumulativeDistributions[1][timestamps.length - 2] + avaxClaimsOverTime.cumulativeDistributions[1][timestamps.length - 2] + opClaimsOverTime.cumulativeDistributions[1][timestamps.length - 2],
											ethClaimsOverTime.cumulativeDistributions[5][timestamps.length - 2] + polyClaimsOverTime.cumulativeDistributions[5][timestamps.length - 2] + avaxClaimsOverTime.cumulativeDistributions[5][timestamps.length - 2] + opClaimsOverTime.cumulativeDistributions[5][timestamps.length - 2],
											ethClaimsOverTime.cumulativeDistributions[10][timestamps.length - 2] + polyClaimsOverTime.cumulativeDistributions[10][timestamps.length - 2] + avaxClaimsOverTime.cumulativeDistributions[10][timestamps.length - 2] + opClaimsOverTime.cumulativeDistributions[10][timestamps.length - 2],
											ethClaimsOverTime.cumulativeDistributions[50][timestamps.length - 2] + polyClaimsOverTime.cumulativeDistributions[50][timestamps.length - 2] + avaxClaimsOverTime.cumulativeDistributions[50][timestamps.length - 2] + opClaimsOverTime.cumulativeDistributions[50][timestamps.length - 2],
											ethClaimsOverTime.cumulativeDistributions[100][timestamps.length - 2] + polyClaimsOverTime.cumulativeDistributions[100][timestamps.length - 2] + avaxClaimsOverTime.cumulativeDistributions[100][timestamps.length - 2] + opClaimsOverTime.cumulativeDistributions[100][timestamps.length - 2],
											ethClaimsOverTime.cumulativeDistributions[500][timestamps.length - 2] + polyClaimsOverTime.cumulativeDistributions[500][timestamps.length - 2] + avaxClaimsOverTime.cumulativeDistributions[500][timestamps.length - 2] + opClaimsOverTime.cumulativeDistributions[500][timestamps.length - 2],
											ethClaimsOverTime.cumulativeDistributions[1000][timestamps.length - 2] + polyClaimsOverTime.cumulativeDistributions[1000][timestamps.length - 2] + avaxClaimsOverTime.cumulativeDistributions[1000][timestamps.length - 2] + opClaimsOverTime.cumulativeDistributions[1000][timestamps.length - 2]
										];

										// Setting Chart X Axis Values / Section Labels:
										tvlChart.xAxisValues = dateTimestamps;
										cumulativeDepositAmountsChart.xAxisValues = dateTimestamps;
										cumulativeDepositCountsChart.xAxisValues = dateTimestamps;
										depositAmountsChart.xAxisValues = dateTimestamps;
										depositCountsChart.xAxisValues = dateTimestamps;
										avgDepositAmountsChart.xAxisValues = dateTimestamps;
										cumulativeUniqueWalletsChart.xAxisValues = dateTimestamps;
										tvlDistributionChart.sectionLabels = tvlDistributionChartLabels;
										cumulativeDepositDistributionsChart.xAxisValues = dateTimestamps;
										depositDistributionsChart.xAxisValues = dateTimestamps;
										cumulativeWithdrawalAmountsChart.xAxisValues = dateTimestamps;
										cumulativeWithdrawalCountsChart.xAxisValues = dateTimestamps;
										withdrawalAmountsChart.xAxisValues = dateTimestamps;
										withdrawalCountsChart.xAxisValues = dateTimestamps;
										cumulativeClaimAmountsChart.xAxisValues = dateTimestamps;
										cumulativeClaimCountsChart.xAxisValues = dateTimestamps;
										claimAmountsChart.xAxisValues = dateTimestamps;
										claimCountsChart.xAxisValues = dateTimestamps;
										avgClaimAmountsChart.xAxisValues = dateTimestamps;
										claimDistributionChart.sectionLabels = claimDistributionChartLabels;
										delegationTvlChart.xAxisValues = dateTimestamps;
										cumulativeDelegationAmountsChart.xAxisValues = dateTimestamps;
										cumulativeDelegationCountsChart.xAxisValues = dateTimestamps;
										yieldChart.xAxisValues = dateTimestamps;
								
										// Setting Chart Data:
										tvlChart.data[0].data = ethTvlOverTime.tvls.map((val, i) => val + polyTvlOverTime.tvls[i] + avaxTvlOverTime.tvls[i] + opTvlOverTime.tvls[i]);
										cumulativeDepositAmountsChart.data[0].data = ethDepositsOverTime.cumulativeDepositAmounts.map((val, i) => val + polyDepositsOverTime.cumulativeDepositAmounts[i] + avaxDepositsOverTime.cumulativeDepositAmounts[i] + opDepositsOverTime.cumulativeDepositAmounts[i]);
										cumulativeDepositCountsChart.data[0].data = ethDepositsOverTime.cumulativeDepositCounts.map((val, i) => val + polyDepositsOverTime.cumulativeDepositCounts[i] + avaxDepositsOverTime.cumulativeDepositCounts[i] + opDepositsOverTime.cumulativeDepositCounts[i]);
										depositAmountsChart.data[0].data = ethDepositsOverTime.depositAmounts.map((val, i) => val + polyDepositsOverTime.depositAmounts[i] + avaxDepositsOverTime.depositAmounts[i] + opDepositsOverTime.depositAmounts[i]);
										depositCountsChart.data[0].data = ethDepositsOverTime.depositCounts.map((val, i) => val + polyDepositsOverTime.depositCounts[i] + avaxDepositsOverTime.depositCounts[i] + opDepositsOverTime.depositCounts[i]);
										avgDepositAmountsChart.data[0].data = ethDepositsOverTime.avgDepositAmounts.map((val, i) => val + polyDepositsOverTime.avgDepositAmounts[i] + avaxDepositsOverTime.avgDepositAmounts[i] + opDepositsOverTime.avgDepositAmounts[i]);
										cumulativeUniqueWalletsChart.data[0].data = ethDepositsOverTime.cumulativeUniqueWallets.map((val, i) => val + polyDepositsOverTime.cumulativeUniqueWallets[i] + avaxDepositsOverTime.cumulativeUniqueWallets[i] + opDepositsOverTime.cumulativeUniqueWallets[i]);
										tvlDistributionChart.data = tvlDistributionChartData;
										cumulativeDepositDistributionsChart.data = cumulativeDepositDistributionsChartData;
										depositDistributionsChart.data = depositDistributionsChartData;
										cumulativeWithdrawalAmountsChart.data[0].data = ethWithdrawalsOverTime.cumulativeWithdrawalAmounts.map((val, i) => val + polyWithdrawalsOverTime.cumulativeWithdrawalAmounts[i] + avaxWithdrawalsOverTime.cumulativeWithdrawalAmounts[i] + opWithdrawalsOverTime.cumulativeWithdrawalAmounts[i]);
										cumulativeWithdrawalCountsChart.data[0].data = ethWithdrawalsOverTime.cumulativeWithdrawalCounts.map((val, i) => val + polyWithdrawalsOverTime.cumulativeWithdrawalCounts[i] + avaxWithdrawalsOverTime.cumulativeWithdrawalCounts[i] + opWithdrawalsOverTime.cumulativeWithdrawalCounts[i]);
										withdrawalAmountsChart.data[0].data = ethWithdrawalsOverTime.withdrawalAmounts.map((val, i) => val + polyWithdrawalsOverTime.withdrawalAmounts[i] + avaxWithdrawalsOverTime.withdrawalAmounts[i] + opWithdrawalsOverTime.withdrawalAmounts[i]);
										withdrawalCountsChart.data[0].data = ethWithdrawalsOverTime.withdrawalCounts.map((val, i) => val + polyWithdrawalsOverTime.withdrawalCounts[i] + avaxWithdrawalsOverTime.withdrawalCounts[i] + opWithdrawalsOverTime.withdrawalCounts[i]);
										cumulativeClaimAmountsChart.data[0].data = ethClaimsOverTime.cumulativeClaimAmounts.map((val, i) => val + polyClaimsOverTime.cumulativeClaimAmounts[i] + avaxClaimsOverTime.cumulativeClaimAmounts[i] + opClaimsOverTime.cumulativeClaimAmounts[i]);
										cumulativeClaimCountsChart.data[0].data = ethClaimsOverTime.cumulativeClaimCounts.map((val, i) => val + polyClaimsOverTime.cumulativeClaimCounts[i] + avaxClaimsOverTime.cumulativeClaimCounts[i] + opClaimsOverTime.cumulativeClaimCounts[i]);
										claimAmountsChart.data[0].data = ethClaimsOverTime.claimAmounts.map((val, i) => val + polyClaimsOverTime.claimAmounts[i] + avaxClaimsOverTime.claimAmounts[i] + opClaimsOverTime.claimAmounts[i]);
										claimCountsChart.data[0].data = ethClaimsOverTime.claimCounts.map((val, i) => val + polyClaimsOverTime.claimCounts[i] + avaxClaimsOverTime.claimCounts[i] + opClaimsOverTime.claimCounts[i]);
										avgClaimAmountsChart.data[0].data = ethClaimsOverTime.avgClaimAmounts.map((val, i) => val + polyClaimsOverTime.avgClaimAmounts[i] + avaxClaimsOverTime.avgClaimAmounts[i] + opClaimsOverTime.avgClaimAmounts[i]);
										claimDistributionChart.data = claimDistributionChartData;
										delegationTvlChart.data[0].data = ethDelegationsOverTime.tvls.map((val, i) => val + polyDelegationsOverTime.tvls[i] + avaxDelegationsOverTime.tvls[i] + opDelegationsOverTime.tvls[i]);
										cumulativeDelegationAmountsChart.data[0].data = ethDelegationsOverTime.cumulativeDelegationAmounts.map((val, i) => val + polyDelegationsOverTime.cumulativeDelegationAmounts[i] + avaxDelegationsOverTime.cumulativeDelegationAmounts[i] + opDelegationsOverTime.cumulativeDelegationAmounts[i]);
										cumulativeDelegationCountsChart.data[0].data = ethDelegationsOverTime.cumulativeDelegationCounts.map((val, i) => val + polyDelegationsOverTime.cumulativeDelegationCounts[i] + avaxDelegationsOverTime.cumulativeDelegationCounts[i] + opDelegationsOverTime.cumulativeDelegationCounts[i]);
										yieldChart.data[0].data = ethYieldOverTime.cumulativeYieldAmounts.map((val, i) => val + polyYieldOverTime.cumulativeYieldAmounts[i] + avaxYieldOverTime.cumulativeYieldAmounts[i] + opYieldOverTime.cumulativeYieldAmounts[i]);
										yieldChart.data[1].data = ethClaimsOverTime.cumulativeClaimAmounts.map((val, i) => val + polyClaimsOverTime.cumulativeClaimAmounts[i] + avaxClaimsOverTime.cumulativeClaimAmounts[i] + opClaimsOverTime.cumulativeClaimAmounts[i]);
									}
								}
							}
						}
					}
				}
			}
		}
	}

	onMount(() => {
		setChartData($startTimestamp, $endTimestamp);
	});
	
</script>

<!-- #################################################################################################### -->

<!-- Charts & Highlights -->
<LineChart {...tvlChart} />
<Highlight hide={$endTimestamp !== defaultMaxTimestamp}>
	<span class="big">There are currently</span>
	<span class="big highlight">{numDepositors.toLocaleString(undefined)}+ Depositors</span>
	<span class="big">on PoolTogether V4!</span>
</Highlight>
<LineChart {...cumulativeDepositAmountsChart} />
<LineChart {...cumulativeDepositCountsChart} />
<LineChart {...depositAmountsChart} />
<LineChart {...depositCountsChart} />
<Highlight hide={$endTimestamp !== defaultMaxTimestamp}>
	<span class="big">Top 5 Whales:</span>
	<span class="list">
		{#each $aggregatedData.balances.data.slice(0, 5) as whale}
			<span>
				<a href="{`/${whale.wallet}`}" class="highlight" title="{whale.wallet}">{whale.wallet.slice(0, 6)}…{whale.wallet.slice(-4)}</a>
				<span>${whale.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
			</span>
		{/each}
	</span>
</Highlight>
<LineChart {...avgDepositAmountsChart} />
<LineChart {...cumulativeUniqueWalletsChart} />
<PieChart {...tvlDistributionChart} hide={$endTimestamp !== defaultMaxTimestamp} />
<LineChart {...cumulativeDepositDistributionsChart} />
<LineChart {...depositDistributionsChart} />
<LineChart {...cumulativeWithdrawalAmountsChart} />
<LineChart {...cumulativeWithdrawalCountsChart} />
<LineChart {...withdrawalAmountsChart} />
<LineChart {...withdrawalCountsChart} />
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

<!-- #################################################################################################### -->

<style>

	.highlight {
		color: var(--secondary-color);
		font-weight: bold;
		text-decoration: none;
	}

	span.big {
		font-size: 1.5em;
	}

	span.list {
		display: flex;
		flex-direction: column;
		gap: .5em;
		width: 40%;
		margin-top: .5em;
	}

	span.list > span {
		display: flex;
		justify-content: space-between;
		font-family: 'Courier Prime', monospace;
	}
	
</style>