<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { getChainName, timestampsToDates } from '$lib/functions';
	import { ethStats, polyStats, avaxStats, opStats, selectedChains } from '$lib/stores';
	import PieChart from '$lib/PieChart.svelte';
	import LineChart from '$lib/LineChart.svelte';
	import Highlight from '$lib/Highlight.svelte';

	// Type Imports:
	import type { Chain, Hash, LineChartInfo, PieChartInfo, Line, BalanceData, MultichainDistribution } from '$lib/types';

	// Initializations:
	const ticks: number = 50;
	let mounted: boolean = false;
	let numDepositors: number = 0;
	let topWhales: BalanceData[] = [];

	// Charts:
	const tvlChart: LineChartInfo = { name: `tvlChart`, title: 'TVL Over Time', xAxisValues: [], data: [{ label: 'TVL', data: [] }], dollarValues: true };
	const chainDistributionChart: LineChartInfo = { name: `chainDistributionChart`, title: 'TVL Chain Distribution Over Time', xAxisValues: [], data: [{ label: 'Ethereum', data: [], lineColor: '#627ee980', backgroundColor: '#627ee9' }, { label: 'Avalanche', data: [], lineColor: '#e7404280', backgroundColor: '#e74042' }, { label: 'Polygon', data: [], lineColor: '#7a3ee380', backgroundColor: '#7a3ee3' }, { label: 'Optimism', data: [], lineColor: '#ff042080', backgroundColor: '#ff0420' }], stacked: true };
	const cumulativeDepositAmountsChart: LineChartInfo = { name: `cumulativeDepositAmountsChart`, title: 'Cumulative Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };
	const cumulativeDepositCountsChart: LineChartInfo = { name: `cumulativeDepositCountsChart`, title: 'Cumulative Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }] };
	const depositAmountsChart: LineChartInfo = { name: `depositAmountsChart`, title: 'Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };
	const depositCountsChart: LineChartInfo = { name: `depositCountsChart`, title: 'Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }] };
	const avgDepositAmountsChart: LineChartInfo = { name: `avgDepositAmountsChart`, title: 'Average Deposit Amounts Over Time', xAxisValues: [], data: [{ label: 'Average Deposit Amount', data: [] }], dollarValues: true };
	const cumulativeUniqueWalletsChart: LineChartInfo = { name: `cumulativeUniqueWalletsChart`, title: 'Cumulative Unique Wallets Over Time', xAxisValues: [], data: [{ label: 'Wallets', data: [] }] };
	const tvlDistributionChart: PieChartInfo = { name: `tvlDistributionsChart`, title: 'TVL Distribution By User Balances', sectionLabels: [], data: [], dollarValues: true };
	const multichainUsersChart: PieChartInfo = { name: `multichainUsersChart`, title: 'Multichain Users', sectionLabels: [], data: [], appendedLabel: 'Users' };
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

	// Reactive Chain Selections:
	$: numChainsSelected = Object.values($selectedChains).reduce((a: boolean, b: boolean) => (a ? 1 : 0) + (b ? 1 : 0), 0) as number;

	// Reactive Data:
	$: $selectedChains, getNumDepositors();
	$: $selectedChains, getTopWhales();
	$: $selectedChains, setChartData();

	// Function to get number of depositors:
	const getNumDepositors = () => {
		if(mounted) {

			// Initializations:
			const uniqueWallets: Hash[] = [];
	
			// Filtering Depositors:
			if($selectedChains.eth) {
				$ethStats.currentUsers.forEach(wallet => {
					uniqueWallets.push(wallet);
				});
			}
			if($selectedChains.poly) {
				$polyStats.currentUsers.forEach(wallet => {
					if(!uniqueWallets.includes(wallet)) {
						uniqueWallets.push(wallet);
					}
				});
			}
			if($selectedChains.avax) {
				$avaxStats.currentUsers.forEach(wallet => {
					if(!uniqueWallets.includes(wallet)) {
						uniqueWallets.push(wallet);
					}
				});
			}
			if($selectedChains.op) {
				$opStats.currentUsers.forEach(wallet => {
					if(!uniqueWallets.includes(wallet)) {
						uniqueWallets.push(wallet);
					}
				});
			}
	
			numDepositors = uniqueWallets.length;
		}
	}

	// Function to get top whales:
	const getTopWhales = () => {
		if(mounted) {

			// Initializations:
			const whales: BalanceData[] = [];
	
			// Filtering Whales:
			if($selectedChains.eth) {
				$ethStats.topWhales.forEach(whale => {
					whales.push(whale);
				});
			}
			if($selectedChains.poly) {
				$polyStats.topWhales.forEach(whale => {
					const foundWhale = whales.find(entry => entry.wallet === whale.wallet);
					foundWhale ? foundWhale.balance += whale.balance : whales.push(whale);
				});
			}
			if($selectedChains.avax) {
				$avaxStats.topWhales.forEach(whale => {
					const foundWhale = whales.find(entry => entry.wallet === whale.wallet);
					foundWhale ? foundWhale.balance += whale.balance : whales.push(whale);
				});
			}
			if($selectedChains.op) {
				$opStats.topWhales.forEach(whale => {
					const foundWhale = whales.find(entry => entry.wallet === whale.wallet);
					foundWhale ? foundWhale.balance += whale.balance : whales.push(whale);
				});
			}
	
			topWhales = whales.sort((a, b) => b.balance - a.balance).slice(0, 5);
		}
	}

	// Function to set chart data:
	const setChartData = () => {
		if(mounted) {

			// Initializations:
			const dateTimestamps = timestampsToDates($ethStats.depositsOverTime.timestamps);

			// Initializing Chart Section Labels:
			const tvlDistributionChartLabels: string[] = ['<$10', '$10-$100', '$100-$1k', '$1k-$10k', '$10k-$100k', '$100k-$1M', '>$1M'];
			const multichainUsersChartLabels: string[] = ['1 Chain', '2 Chains', '3 Chains', '4 Chains'];
			const claimDistributionChartLabels: string[] = ['<$5', '$5-$10', '$10-$50', '$50-$100', '$100-$500', '$500-$1k', '>$1k'];

			// Initializing Chart Data:
			const tvlDistributionChartData = calculateTVLDistribution();
			const multichainUsersChartData = calculateMultichainDistribution();
			const cumulativeDepositDistributionsChartData = calculateCumulativeDepositDistributions();
			const depositDistributionsChartData = calculateDepositDistributions();
			const claimDistributionChartData = calculateClaimDistributions();

			// Setting Chart X Axis Values / Section Labels:
			tvlChart.xAxisValues = dateTimestamps;
			chainDistributionChart.xAxisValues = dateTimestamps;
			cumulativeDepositAmountsChart.xAxisValues = dateTimestamps;
			cumulativeDepositCountsChart.xAxisValues = dateTimestamps;
			depositAmountsChart.xAxisValues = dateTimestamps;
			depositCountsChart.xAxisValues = dateTimestamps;
			avgDepositAmountsChart.xAxisValues = dateTimestamps;
			cumulativeUniqueWalletsChart.xAxisValues = dateTimestamps;
			tvlDistributionChart.sectionLabels = tvlDistributionChartLabels;
			multichainUsersChart.sectionLabels = multichainUsersChartLabels;
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
			tvlChart.data[0].data = $ethStats.tvlOverTime.tvls.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.tvlOverTime.tvls[i] : 0) + ($selectedChains.avax ? $avaxStats.tvlOverTime.tvls[i] : 0) + ($selectedChains.op ? $opStats.tvlOverTime.tvls[i] : 0));
			chainDistributionChart.data[0].data = $ethStats.tvlOverTime.tvls.map((val, i) => $selectedChains.eth ? (val / tvlChart.data[0].data[i]) * 100 : 0);
			chainDistributionChart.data[1].data = $avaxStats.tvlOverTime.tvls.map((val, i) => $selectedChains.avax ? (val / tvlChart.data[0].data[i]) * 100 : 0);
			chainDistributionChart.data[2].data = $polyStats.tvlOverTime.tvls.map((val, i) => $selectedChains.poly ? (val / tvlChart.data[0].data[i]) * 100 : 0);
			chainDistributionChart.data[3].data = $opStats.tvlOverTime.tvls.map((val, i) => $selectedChains.op ? (val / tvlChart.data[0].data[i]) * 100 : 0);
			cumulativeDepositAmountsChart.data[0].data = $ethStats.depositsOverTime.cumulativeDepositAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeDepositAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeDepositAmounts[i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeDepositAmounts[i] : 0));
			cumulativeDepositCountsChart.data[0].data = $ethStats.depositsOverTime.cumulativeDepositCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeDepositCounts[i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeDepositCounts[i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeDepositCounts[i] : 0));
			depositAmountsChart.data[0].data = $ethStats.depositsOverTime.depositAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.depositAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.depositAmounts[i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.depositAmounts[i] : 0));
			depositCountsChart.data[0].data = $ethStats.depositsOverTime.depositCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.depositCounts[i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.depositCounts[i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.depositCounts[i] : 0));
			avgDepositAmountsChart.data[0].data = $ethStats.depositsOverTime.avgDepositAmounts.map((val, i) => (($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.avgDepositAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.avgDepositAmounts[i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.avgDepositAmounts[i] : 0)) / numChainsSelected);
			cumulativeUniqueWalletsChart.data[0].data = $ethStats.depositsOverTime.cumulativeUniqueWallets.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeUniqueWallets[i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeUniqueWallets[i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeUniqueWallets[i] : 0));
			tvlDistributionChart.data = tvlDistributionChartData;
			multichainUsersChart.data = multichainUsersChartData;
			cumulativeDepositDistributionsChart.data = cumulativeDepositDistributionsChartData;
			depositDistributionsChart.data = depositDistributionsChartData;
			cumulativeWithdrawalAmountsChart.data[0].data = $ethStats.withdrawalsOverTime.cumulativeWithdrawalAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.withdrawalsOverTime.cumulativeWithdrawalAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.withdrawalsOverTime.cumulativeWithdrawalAmounts[i] : 0) + ($selectedChains.op ? $opStats.withdrawalsOverTime.cumulativeWithdrawalAmounts[i] : 0));
			cumulativeWithdrawalCountsChart.data[0].data = $ethStats.withdrawalsOverTime.cumulativeWithdrawalCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.withdrawalsOverTime.cumulativeWithdrawalCounts[i] : 0) + ($selectedChains.avax ? $avaxStats.withdrawalsOverTime.cumulativeWithdrawalCounts[i] : 0) + ($selectedChains.op ? $opStats.withdrawalsOverTime.cumulativeWithdrawalCounts[i] : 0));
			withdrawalAmountsChart.data[0].data = $ethStats.withdrawalsOverTime.withdrawalAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.withdrawalsOverTime.withdrawalAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.withdrawalsOverTime.withdrawalAmounts[i] : 0) + ($selectedChains.op ? $opStats.withdrawalsOverTime.withdrawalAmounts[i] : 0));
			withdrawalCountsChart.data[0].data = $ethStats.withdrawalsOverTime.withdrawalCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.withdrawalsOverTime.withdrawalCounts[i] : 0) + ($selectedChains.avax ? $avaxStats.withdrawalsOverTime.withdrawalCounts[i] : 0) + ($selectedChains.op ? $opStats.withdrawalsOverTime.withdrawalCounts[i] : 0));
			cumulativeClaimAmountsChart.data[0].data = $ethStats.claimsOverTime.cumulativeClaimAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.claimsOverTime.cumulativeClaimAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.claimsOverTime.cumulativeClaimAmounts[i] : 0) + ($selectedChains.op ? $opStats.claimsOverTime.cumulativeClaimAmounts[i] : 0));
			cumulativeClaimCountsChart.data[0].data = $ethStats.claimsOverTime.cumulativeClaimCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.claimsOverTime.cumulativeClaimCounts[i] : 0) + ($selectedChains.avax ? $avaxStats.claimsOverTime.cumulativeClaimCounts[i] : 0) + ($selectedChains.op ? $opStats.claimsOverTime.cumulativeClaimCounts[i] : 0));
			claimAmountsChart.data[0].data = $ethStats.claimsOverTime.claimAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.claimsOverTime.claimAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.claimsOverTime.claimAmounts[i] : 0) + ($selectedChains.op ? $opStats.claimsOverTime.claimAmounts[i] : 0));
			claimCountsChart.data[0].data = $ethStats.claimsOverTime.claimCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.claimsOverTime.claimCounts[i] : 0) + ($selectedChains.avax ? $avaxStats.claimsOverTime.claimCounts[i] : 0) + ($selectedChains.op ? $opStats.claimsOverTime.claimCounts[i] : 0));
			avgClaimAmountsChart.data[0].data = $ethStats.claimsOverTime.avgClaimAmounts.map((val, i) => (($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.claimsOverTime.avgClaimAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.claimsOverTime.avgClaimAmounts[i] : 0) + ($selectedChains.op ? $opStats.claimsOverTime.avgClaimAmounts[i] : 0)) / numChainsSelected);
			claimDistributionChart.data = claimDistributionChartData;
			delegationTvlChart.data[0].data = $ethStats.delegationsOverTime.tvls.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.delegationsOverTime.tvls[i] : 0) + ($selectedChains.avax ? $avaxStats.delegationsOverTime.tvls[i] : 0) + ($selectedChains.op ? $opStats.delegationsOverTime.tvls[i] : 0));
			cumulativeDelegationAmountsChart.data[0].data = $ethStats.delegationsOverTime.cumulativeDelegationAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.delegationsOverTime.cumulativeDelegationAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.delegationsOverTime.cumulativeDelegationAmounts[i] : 0) + ($selectedChains.op ? $opStats.delegationsOverTime.cumulativeDelegationAmounts[i] : 0));
			cumulativeDelegationCountsChart.data[0].data = $ethStats.delegationsOverTime.cumulativeDelegationCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.delegationsOverTime.cumulativeDelegationCounts[i] : 0) + ($selectedChains.avax ? $avaxStats.delegationsOverTime.cumulativeDelegationCounts[i] : 0) + ($selectedChains.op ? $opStats.delegationsOverTime.cumulativeDelegationCounts[i] : 0));
			yieldChart.data[0].data = $ethStats.yieldOverTime.cumulativeYieldAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.yieldOverTime.cumulativeYieldAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.yieldOverTime.cumulativeYieldAmounts[i] : 0) + ($selectedChains.op ? $opStats.yieldOverTime.cumulativeYieldAmounts[i] : 0));
			yieldChart.data[1].data = $ethStats.claimsOverTime.cumulativeClaimAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.claimsOverTime.cumulativeClaimAmounts[i] : 0) + ($selectedChains.avax ? $avaxStats.claimsOverTime.cumulativeClaimAmounts[i] : 0) + ($selectedChains.op ? $opStats.claimsOverTime.cumulativeClaimAmounts[i] : 0));

		}
	}

	// Function to calculate multichain distribution:
	const calculateMultichainDistribution = () => {

		// Initializations:
		const multichainDistribution: MultichainDistribution = { totalUsers: 0, oneChain: 0, twoChains: 0, threeChains: 0, fourChains: 0 };
		const wallets: Record<Hash, number> = {};

		// Sorting Wallets:
		if($selectedChains.eth) {
			$ethStats.currentUsers.forEach(wallet => {
				wallets[wallet] ? wallets[wallet]++ : wallets[wallet] = 1;
			});
		}
		if($selectedChains.poly) {
			$polyStats.currentUsers.forEach(wallet => {
				wallets[wallet] ? wallets[wallet]++ : wallets[wallet] = 1;
			});
		}
		if($selectedChains.avax) {
			$avaxStats.currentUsers.forEach(wallet => {
				wallets[wallet] ? wallets[wallet]++ : wallets[wallet] = 1;
			});
		}
		if($selectedChains.op) {
			$opStats.currentUsers.forEach(wallet => {
				wallets[wallet] ? wallets[wallet]++ : wallets[wallet] = 1;
			});
		}

		// Updating Data:
		for(let stringWallet in wallets) {
			const wallet = stringWallet as Hash;
			if(wallets[wallet] === 1) {
				multichainDistribution.oneChain++;
			} else if(wallets[wallet] === 2) {
				multichainDistribution.twoChains++;
			} else if(wallets[wallet] === 3) {
				multichainDistribution.threeChains++;
			} else if(wallets[wallet] === 4) {
				multichainDistribution.fourChains++;
			}
			multichainDistribution.totalUsers++;
		}

		return [multichainDistribution.oneChain, multichainDistribution.twoChains, multichainDistribution.threeChains, multichainDistribution.fourChains];
	}

	// Function to calculate TVL distribution:
	const calculateTVLDistribution = () => {

		// Initializations:
		const tvlDistribution: number[] = [0, 0, 0, 0, 0, 0, 0];

		// Adding TVL Distributions:
		if($selectedChains.eth) {
			tvlDistribution[0] += $ethStats.tvlDistribution[1].amount;
			tvlDistribution[1] += $ethStats.tvlDistribution[10].amount;
			tvlDistribution[2] += $ethStats.tvlDistribution[100].amount;
			tvlDistribution[3] += $ethStats.tvlDistribution[1000].amount;
			tvlDistribution[4] += $ethStats.tvlDistribution[10000].amount;
			tvlDistribution[5] += $ethStats.tvlDistribution[100000].amount;
			tvlDistribution[6] += $ethStats.tvlDistribution[1000000].amount;
		}
		if($selectedChains.poly) {
			tvlDistribution[0] += $polyStats.tvlDistribution[1].amount;
			tvlDistribution[1] += $polyStats.tvlDistribution[10].amount;
			tvlDistribution[2] += $polyStats.tvlDistribution[100].amount;
			tvlDistribution[3] += $polyStats.tvlDistribution[1000].amount;
			tvlDistribution[4] += $polyStats.tvlDistribution[10000].amount;
			tvlDistribution[5] += $polyStats.tvlDistribution[100000].amount;
			tvlDistribution[6] += $polyStats.tvlDistribution[1000000].amount;
		}
		if($selectedChains.avax) {
			tvlDistribution[0] += $avaxStats.tvlDistribution[1].amount;
			tvlDistribution[1] += $avaxStats.tvlDistribution[10].amount;
			tvlDistribution[2] += $avaxStats.tvlDistribution[100].amount;
			tvlDistribution[3] += $avaxStats.tvlDistribution[1000].amount;
			tvlDistribution[4] += $avaxStats.tvlDistribution[10000].amount;
			tvlDistribution[5] += $avaxStats.tvlDistribution[100000].amount;
			tvlDistribution[6] += $avaxStats.tvlDistribution[1000000].amount;
		}
		if($selectedChains.op) {
			tvlDistribution[0] += $opStats.tvlDistribution[1].amount;
			tvlDistribution[1] += $opStats.tvlDistribution[10].amount;
			tvlDistribution[2] += $opStats.tvlDistribution[100].amount;
			tvlDistribution[3] += $opStats.tvlDistribution[1000].amount;
			tvlDistribution[4] += $opStats.tvlDistribution[10000].amount;
			tvlDistribution[5] += $opStats.tvlDistribution[100000].amount;
			tvlDistribution[6] += $opStats.tvlDistribution[1000000].amount;
		}

		return tvlDistribution;
	}

	// Function to calculate cumulative deposit distributions:
	const calculateCumulativeDepositDistributions = () => {

		// Initializations:
		const cumulativeDepositDistributions: Line[] = [
			{ label: '<$10', data: [], lineColor: '#ffb636' },
			{ label: '$10-$100', data: [], lineColor: '#ffbe4d' },
			{ label: '$100-$1k', data: [], lineColor: '#ffc766' },
			{ label: '$1k-$10k', data: [], lineColor: '#ffd080' },
			{ label: '$10k-$100k', data: [], lineColor: '#ffda99' },
			{ label: '>$100k', data: [], lineColor: '#ffe3b3' }
		];

		// Adding Cumulative Deposit Distributions:
		cumulativeDepositDistributions[0].data = $ethStats.depositsOverTime.cumulativeDistributions[1].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeDistributions[1][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeDistributions[1][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeDistributions[1][i] : 0));
		cumulativeDepositDistributions[1].data = $ethStats.depositsOverTime.cumulativeDistributions[10].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeDistributions[10][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeDistributions[10][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeDistributions[10][i] : 0));
		cumulativeDepositDistributions[2].data = $ethStats.depositsOverTime.cumulativeDistributions[100].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeDistributions[100][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeDistributions[100][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeDistributions[100][i] : 0));
		cumulativeDepositDistributions[3].data = $ethStats.depositsOverTime.cumulativeDistributions[1000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeDistributions[1000][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeDistributions[1000][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeDistributions[1000][i] : 0));
		cumulativeDepositDistributions[4].data = $ethStats.depositsOverTime.cumulativeDistributions[10000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeDistributions[10000][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeDistributions[10000][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeDistributions[10000][i] : 0));
		cumulativeDepositDistributions[5].data = $ethStats.depositsOverTime.cumulativeDistributions[100000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.cumulativeDistributions[100000][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.cumulativeDistributions[100000][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.cumulativeDistributions[100000][i] : 0));
		
		return cumulativeDepositDistributions;
	}

	// Function to calculate deposit distributions:
	const calculateDepositDistributions = () => {

		// Initializations:
		const depositDistributions: Line[] = [
			{ label: '<$10', data: [], lineColor: '#ffb636' },
			{ label: '$10-$100', data: [], lineColor: '#ffbe4d' },
			{ label: '$100-$1k', data: [], lineColor: '#ffc766' },
			{ label: '$1k-$10k', data: [], lineColor: '#ffd080' },
			{ label: '$10k-$100k', data: [], lineColor: '#ffda99' },
			{ label: '>$100k', data: [], lineColor: '#ffe3b3' }
		];

		// Adding Deposit Distributions:
		depositDistributions[0].data = $ethStats.depositsOverTime.distributions[1].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.distributions[1][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.distributions[1][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.distributions[1][i] : 0));
		depositDistributions[1].data = $ethStats.depositsOverTime.distributions[10].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.distributions[10][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.distributions[10][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.distributions[10][i] : 0));
		depositDistributions[2].data = $ethStats.depositsOverTime.distributions[100].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.distributions[100][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.distributions[100][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.distributions[100][i] : 0));
		depositDistributions[3].data = $ethStats.depositsOverTime.distributions[1000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.distributions[1000][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.distributions[1000][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.distributions[1000][i] : 0));
		depositDistributions[4].data = $ethStats.depositsOverTime.distributions[10000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.distributions[10000][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.distributions[10000][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.distributions[10000][i] : 0));
		depositDistributions[5].data = $ethStats.depositsOverTime.distributions[100000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? $polyStats.depositsOverTime.distributions[100000][i] : 0) + ($selectedChains.avax ? $avaxStats.depositsOverTime.distributions[100000][i] : 0) + ($selectedChains.op ? $opStats.depositsOverTime.distributions[100000][i] : 0));

		return depositDistributions;
	}

	// Function to calculate claim distributions:
	const calculateClaimDistributions = () => {

		// Initializations:
		const claimDistribution: number[] = [0, 0, 0, 0, 0, 0, 0];

		// Adding Claim Distributions:
		if($selectedChains.eth) {
			claimDistribution[0] += $ethStats.claimsOverTime.cumulativeDistributions[1][ticks - 1];
			claimDistribution[1] += $ethStats.claimsOverTime.cumulativeDistributions[5][ticks - 1];
			claimDistribution[2] += $ethStats.claimsOverTime.cumulativeDistributions[10][ticks - 1];
			claimDistribution[3] += $ethStats.claimsOverTime.cumulativeDistributions[50][ticks - 1];
			claimDistribution[4] += $ethStats.claimsOverTime.cumulativeDistributions[100][ticks - 1];
			claimDistribution[5] += $ethStats.claimsOverTime.cumulativeDistributions[500][ticks - 1];
			claimDistribution[6] += $ethStats.claimsOverTime.cumulativeDistributions[1000][ticks - 1];
		}
		if($selectedChains.poly) {
			claimDistribution[0] += $polyStats.claimsOverTime.cumulativeDistributions[1][ticks - 1];
			claimDistribution[1] += $polyStats.claimsOverTime.cumulativeDistributions[5][ticks - 1];
			claimDistribution[2] += $polyStats.claimsOverTime.cumulativeDistributions[10][ticks - 1];
			claimDistribution[3] += $polyStats.claimsOverTime.cumulativeDistributions[50][ticks - 1];
			claimDistribution[4] += $polyStats.claimsOverTime.cumulativeDistributions[100][ticks - 1];
			claimDistribution[5] += $polyStats.claimsOverTime.cumulativeDistributions[500][ticks - 1];
			claimDistribution[6] += $polyStats.claimsOverTime.cumulativeDistributions[1000][ticks - 1];
		}
		if($selectedChains.avax) {
			claimDistribution[0] += $avaxStats.claimsOverTime.cumulativeDistributions[1][ticks - 1];
			claimDistribution[1] += $avaxStats.claimsOverTime.cumulativeDistributions[5][ticks - 1];
			claimDistribution[2] += $avaxStats.claimsOverTime.cumulativeDistributions[10][ticks - 1];
			claimDistribution[3] += $avaxStats.claimsOverTime.cumulativeDistributions[50][ticks - 1];
			claimDistribution[4] += $avaxStats.claimsOverTime.cumulativeDistributions[100][ticks - 1];
			claimDistribution[5] += $avaxStats.claimsOverTime.cumulativeDistributions[500][ticks - 1];
			claimDistribution[6] += $avaxStats.claimsOverTime.cumulativeDistributions[1000][ticks - 1];
		}
		if($selectedChains.op) {
			claimDistribution[0] += $opStats.claimsOverTime.cumulativeDistributions[1][ticks - 1];
			claimDistribution[1] += $opStats.claimsOverTime.cumulativeDistributions[5][ticks - 1];
			claimDistribution[2] += $opStats.claimsOverTime.cumulativeDistributions[10][ticks - 1];
			claimDistribution[3] += $opStats.claimsOverTime.cumulativeDistributions[50][ticks - 1];
			claimDistribution[4] += $opStats.claimsOverTime.cumulativeDistributions[100][ticks - 1];
			claimDistribution[5] += $opStats.claimsOverTime.cumulativeDistributions[500][ticks - 1];
			claimDistribution[6] += $opStats.claimsOverTime.cumulativeDistributions[1000][ticks - 1];
		}

		return claimDistribution;
	}

	// Function to get single selected chain:
	const getSingleSelectedChain = () => {
		let chainName: string = '';
		Object.keys($selectedChains).forEach(stringChain => {
			const chain = stringChain as Chain;
			if($selectedChains[chain]) {
				chainName = getChainName(chain);
			}
		});
		return chainName;
	}

	onMount(() => {
		mounted = true;
		setChartData();
		getNumDepositors();
		getTopWhales();
	});
	
</script>

<!-- #################################################################################################### -->

<!-- Charts & Highlights -->
<LineChart {...tvlChart} />
<Highlight>
	<span class="big">There are currently</span>
	<span class="big highlight">{numDepositors.toLocaleString(undefined)}+ Depositors</span>
	<span class="big">on {numChainsSelected !== 1 ? 'PoolTogether V4' : getSingleSelectedChain()}!</span>
</Highlight>
<LineChart {...chainDistributionChart} />
<LineChart {...cumulativeDepositAmountsChart} />
<LineChart {...cumulativeDepositCountsChart} />
<LineChart {...depositAmountsChart} />
<LineChart {...depositCountsChart} />
<Highlight>
	<span class="big">Top 5 Whales:</span>
	<span class="list">
		{#each topWhales as whale}
			<span>
				<a href="{`/${whale.wallet}`}" class="highlight" title="{whale.wallet}">{whale.wallet.slice(0, 6)}…{whale.wallet.slice(-4)}</a>
				<span>${whale.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
			</span>
		{/each}
	</span>
</Highlight>
<LineChart {...avgDepositAmountsChart} />
<LineChart {...cumulativeUniqueWalletsChart} />
<PieChart {...tvlDistributionChart} />
<PieChart {...multichainUsersChart} />
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
		width: max(14em, 40%);
		margin-top: .5em;
	}

	span.list > span {
		display: flex;
		justify-content: space-between;
		gap: 1em;
		font-family: 'Courier Prime', monospace;
	}
	
</style>