<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { getChainName, timestampsToDates, getShortWallet } from '$lib/functions';
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
	const chainDistributionChart: LineChartInfo = { name: `chainDistributionChart`, title: 'TVL Chain Distribution Over Time', xAxisValues: [], data: [], stacked: true };
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
	$: numChainsSelected = Object.values($selectedChains).reduce((a: number, b: boolean) => a + (b ? 1 : 0), 0) as number;

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
		if(mounted && $ethStats && $polyStats && $avaxStats && $opStats) {

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
			chainDistributionChart.data = [];

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

			// Setting Stats:
			const [ethTVLs, polyTVLs, avaxTVLs, opTVLs] = [$ethStats.tvlOverTime.tvls, $polyStats.tvlOverTime.tvls, $avaxStats.tvlOverTime.tvls, $opStats.tvlOverTime.tvls];
			const [ethDepositsOverTime, polyDepositsOverTime, avaxDepositsOverTime, opDepositsOverTime] = [$ethStats.depositsOverTime, $polyStats.depositsOverTime, $avaxStats.depositsOverTime, $opStats.depositsOverTime];
			const [ethWithdrawalsOverTime, polyWithdrawalsOverTime, avaxWithdrawalsOverTime, opWithdrawalsOverTime] = [$ethStats.withdrawalsOverTime, $polyStats.withdrawalsOverTime, $avaxStats.withdrawalsOverTime, $opStats.withdrawalsOverTime];
			const [ethClaimsOverTime, polyClaimsOverTime, avaxClaimsOverTime, opClaimsOverTime] = [$ethStats.claimsOverTime, $polyStats.claimsOverTime, $avaxStats.claimsOverTime, $opStats.claimsOverTime];
			const [ethDelegationsOverTime, polyDelegationsOverTime, avaxDelegationsOverTime, opDelegationsOverTime] = [$ethStats.delegationsOverTime, $polyStats.delegationsOverTime, $avaxStats.delegationsOverTime, $opStats.delegationsOverTime];
			const [ethYieldOverTime, polyYieldOverTime, avaxYieldOverTime, opYieldOverTime] = [$ethStats.yieldOverTime, $polyStats.yieldOverTime, $avaxStats.yieldOverTime, $opStats.yieldOverTime];
	
			// Setting Chart Data:
			tvlChart.data[0].data = ethTVLs.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyTVLs[i] : 0) + ($selectedChains.avax ? avaxTVLs[i] : 0) + ($selectedChains.op ? opTVLs[i] : 0));
			if($selectedChains.eth) { chainDistributionChart.data.push({ label: 'Ethereum', data: ethTVLs, lineColor: '#627ee980', backgroundColor: '#627ee9' }); };
			if($selectedChains.avax) { chainDistributionChart.data.push({ label: 'Avalanche', data: avaxTVLs, lineColor: '#e7404280', backgroundColor: '#e74042' }); };
			if($selectedChains.poly) { chainDistributionChart.data.push({ label: 'Polygon', data: polyTVLs, lineColor: '#7a3ee380', backgroundColor: '#7a3ee3' }); };
			if($selectedChains.op) { chainDistributionChart.data.push({ label: 'Optimism', data: opTVLs, lineColor: '#ff042080', backgroundColor: '#ff0420' }); };
			cumulativeDepositAmountsChart.data[0].data = ethDepositsOverTime.cumulativeDepositAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDepositsOverTime.cumulativeDepositAmounts[i] : 0) + ($selectedChains.avax ? avaxDepositsOverTime.cumulativeDepositAmounts[i] : 0) + ($selectedChains.op ? opDepositsOverTime.cumulativeDepositAmounts[i] : 0));
			cumulativeDepositCountsChart.data[0].data = ethDepositsOverTime.cumulativeDepositCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDepositsOverTime.cumulativeDepositCounts[i] : 0) + ($selectedChains.avax ? avaxDepositsOverTime.cumulativeDepositCounts[i] : 0) + ($selectedChains.op ? opDepositsOverTime.cumulativeDepositCounts[i] : 0));
			depositAmountsChart.data[0].data = ethDepositsOverTime.depositAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDepositsOverTime.depositAmounts[i] : 0) + ($selectedChains.avax ? avaxDepositsOverTime.depositAmounts[i] : 0) + ($selectedChains.op ? opDepositsOverTime.depositAmounts[i] : 0));
			depositCountsChart.data[0].data = ethDepositsOverTime.depositCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDepositsOverTime.depositCounts[i] : 0) + ($selectedChains.avax ? avaxDepositsOverTime.depositCounts[i] : 0) + ($selectedChains.op ? opDepositsOverTime.depositCounts[i] : 0));
			avgDepositAmountsChart.data[0].data = ethDepositsOverTime.avgDepositAmounts.map((val, i) => (($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDepositsOverTime.avgDepositAmounts[i] : 0) + ($selectedChains.avax ? avaxDepositsOverTime.avgDepositAmounts[i] : 0) + ($selectedChains.op ? opDepositsOverTime.avgDepositAmounts[i] : 0)) / numChainsSelected);
			cumulativeUniqueWalletsChart.data[0].data = ethDepositsOverTime.cumulativeUniqueWallets.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDepositsOverTime.cumulativeUniqueWallets[i] : 0) + ($selectedChains.avax ? avaxDepositsOverTime.cumulativeUniqueWallets[i] : 0) + ($selectedChains.op ? opDepositsOverTime.cumulativeUniqueWallets[i] : 0));
			tvlDistributionChart.data = tvlDistributionChartData;
			multichainUsersChart.data = multichainUsersChartData;
			cumulativeDepositDistributionsChart.data = cumulativeDepositDistributionsChartData;
			depositDistributionsChart.data = depositDistributionsChartData;
			cumulativeWithdrawalAmountsChart.data[0].data = ethWithdrawalsOverTime.cumulativeWithdrawalAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyWithdrawalsOverTime.cumulativeWithdrawalAmounts[i] : 0) + ($selectedChains.avax ? avaxWithdrawalsOverTime.cumulativeWithdrawalAmounts[i] : 0) + ($selectedChains.op ? opWithdrawalsOverTime.cumulativeWithdrawalAmounts[i] : 0));
			cumulativeWithdrawalCountsChart.data[0].data = ethWithdrawalsOverTime.cumulativeWithdrawalCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyWithdrawalsOverTime.cumulativeWithdrawalCounts[i] : 0) + ($selectedChains.avax ? avaxWithdrawalsOverTime.cumulativeWithdrawalCounts[i] : 0) + ($selectedChains.op ? opWithdrawalsOverTime.cumulativeWithdrawalCounts[i] : 0));
			withdrawalAmountsChart.data[0].data = ethWithdrawalsOverTime.withdrawalAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyWithdrawalsOverTime.withdrawalAmounts[i] : 0) + ($selectedChains.avax ? avaxWithdrawalsOverTime.withdrawalAmounts[i] : 0) + ($selectedChains.op ? opWithdrawalsOverTime.withdrawalAmounts[i] : 0));
			withdrawalCountsChart.data[0].data = ethWithdrawalsOverTime.withdrawalCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyWithdrawalsOverTime.withdrawalCounts[i] : 0) + ($selectedChains.avax ? avaxWithdrawalsOverTime.withdrawalCounts[i] : 0) + ($selectedChains.op ? opWithdrawalsOverTime.withdrawalCounts[i] : 0));
			cumulativeClaimAmountsChart.data[0].data = ethClaimsOverTime.cumulativeClaimAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyClaimsOverTime.cumulativeClaimAmounts[i] : 0) + ($selectedChains.avax ? avaxClaimsOverTime.cumulativeClaimAmounts[i] : 0) + ($selectedChains.op ? opClaimsOverTime.cumulativeClaimAmounts[i] : 0));
			cumulativeClaimCountsChart.data[0].data = ethClaimsOverTime.cumulativeClaimCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyClaimsOverTime.cumulativeClaimCounts[i] : 0) + ($selectedChains.avax ? avaxClaimsOverTime.cumulativeClaimCounts[i] : 0) + ($selectedChains.op ? opClaimsOverTime.cumulativeClaimCounts[i] : 0));
			claimAmountsChart.data[0].data = ethClaimsOverTime.claimAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyClaimsOverTime.claimAmounts[i] : 0) + ($selectedChains.avax ? avaxClaimsOverTime.claimAmounts[i] : 0) + ($selectedChains.op ? opClaimsOverTime.claimAmounts[i] : 0));
			claimCountsChart.data[0].data = ethClaimsOverTime.claimCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyClaimsOverTime.claimCounts[i] : 0) + ($selectedChains.avax ? avaxClaimsOverTime.claimCounts[i] : 0) + ($selectedChains.op ? opClaimsOverTime.claimCounts[i] : 0));
			avgClaimAmountsChart.data[0].data = ethClaimsOverTime.avgClaimAmounts.map((val, i) => (($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyClaimsOverTime.avgClaimAmounts[i] : 0) + ($selectedChains.avax ? avaxClaimsOverTime.avgClaimAmounts[i] : 0) + ($selectedChains.op ? opClaimsOverTime.avgClaimAmounts[i] : 0)) / numChainsSelected);
			claimDistributionChart.data = claimDistributionChartData;
			delegationTvlChart.data[0].data = ethDelegationsOverTime.tvls.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDelegationsOverTime.tvls[i] : 0) + ($selectedChains.avax ? avaxDelegationsOverTime.tvls[i] : 0) + ($selectedChains.op ? opDelegationsOverTime.tvls[i] : 0));
			cumulativeDelegationAmountsChart.data[0].data = ethDelegationsOverTime.cumulativeDelegationAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDelegationsOverTime.cumulativeDelegationAmounts[i] : 0) + ($selectedChains.avax ? avaxDelegationsOverTime.cumulativeDelegationAmounts[i] : 0) + ($selectedChains.op ? opDelegationsOverTime.cumulativeDelegationAmounts[i] : 0));
			cumulativeDelegationCountsChart.data[0].data = ethDelegationsOverTime.cumulativeDelegationCounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDelegationsOverTime.cumulativeDelegationCounts[i] : 0) + ($selectedChains.avax ? avaxDelegationsOverTime.cumulativeDelegationCounts[i] : 0) + ($selectedChains.op ? opDelegationsOverTime.cumulativeDelegationCounts[i] : 0));
			yieldChart.data[0].data = ethYieldOverTime.cumulativeYieldAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyYieldOverTime.cumulativeYieldAmounts[i] : 0) + ($selectedChains.avax ? avaxYieldOverTime.cumulativeYieldAmounts[i] : 0) + ($selectedChains.op ? opYieldOverTime.cumulativeYieldAmounts[i] : 0));
			yieldChart.data[1].data = ethClaimsOverTime.cumulativeClaimAmounts.map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyClaimsOverTime.cumulativeClaimAmounts[i] : 0) + ($selectedChains.avax ? avaxClaimsOverTime.cumulativeClaimAmounts[i] : 0) + ($selectedChains.op ? opClaimsOverTime.cumulativeClaimAmounts[i] : 0));

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
			{ label: '$10-$100', data: [], lineColor: '#ff4336' },
			{ label: '$100-$1k', data: [], lineColor: '#ffda36' },
			{ label: '$1k-$10k', data: [], lineColor: '#d782aa' },
			{ label: '$10k-$100k', data: [], lineColor: '#9f82d7' },
			{ label: '>$100k', data: [], lineColor: '#35f0d0' }
		];

		// Setting Stats:
		const ethDistributions = $ethStats.depositsOverTime.cumulativeDistributions;
		const polyDistributions = $polyStats.depositsOverTime.cumulativeDistributions;
		const avaxDistributions = $avaxStats.depositsOverTime.cumulativeDistributions;
		const opDistributions = $opStats.depositsOverTime.cumulativeDistributions;

		// Adding Cumulative Deposit Distributions:
		cumulativeDepositDistributions[0].data = ethDistributions[1].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[1][i] : 0) + ($selectedChains.avax ? avaxDistributions[1][i] : 0) + ($selectedChains.op ? opDistributions[1][i] : 0));
		cumulativeDepositDistributions[1].data = ethDistributions[10].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[10][i] : 0) + ($selectedChains.avax ? avaxDistributions[10][i] : 0) + ($selectedChains.op ? opDistributions[10][i] : 0));
		cumulativeDepositDistributions[2].data = ethDistributions[100].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[100][i] : 0) + ($selectedChains.avax ? avaxDistributions[100][i] : 0) + ($selectedChains.op ? opDistributions[100][i] : 0));
		cumulativeDepositDistributions[3].data = ethDistributions[1000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[1000][i] : 0) + ($selectedChains.avax ? avaxDistributions[1000][i] : 0) + ($selectedChains.op ? opDistributions[1000][i] : 0));
		cumulativeDepositDistributions[4].data = ethDistributions[10000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[10000][i] : 0) + ($selectedChains.avax ? avaxDistributions[10000][i] : 0) + ($selectedChains.op ? opDistributions[10000][i] : 0));
		cumulativeDepositDistributions[5].data = ethDistributions[100000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[100000][i] : 0) + ($selectedChains.avax ? avaxDistributions[100000][i] : 0) + ($selectedChains.op ? opDistributions[100000][i] : 0));
		
		return cumulativeDepositDistributions;
	}

	// Function to calculate deposit distributions:
	const calculateDepositDistributions = () => {

		// Initializations:
		const depositDistributions: Line[] = [
			{ label: '<$10', data: [], lineColor: '#ffb636' },
			{ label: '$10-$100', data: [], lineColor: '#ff4336' },
			{ label: '$100-$1k', data: [], lineColor: '#ffda36' },
			{ label: '$1k-$10k', data: [], lineColor: '#d782aa' },
			{ label: '$10k-$100k', data: [], lineColor: '#9f82d7' },
			{ label: '>$100k', data: [], lineColor: '#35f0d0' }
		];

		// Setting Stats:
		const ethDistributions = $ethStats.depositsOverTime.distributions;
		const polyDistributions = $polyStats.depositsOverTime.distributions;
		const avaxDistributions = $avaxStats.depositsOverTime.distributions;
		const opDistributions = $opStats.depositsOverTime.distributions;

		// Adding Deposit Distributions:
		depositDistributions[0].data = ethDistributions[1].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[1][i] : 0) + ($selectedChains.avax ? avaxDistributions[1][i] : 0) + ($selectedChains.op ? opDistributions[1][i] : 0));
		depositDistributions[1].data = ethDistributions[10].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[10][i] : 0) + ($selectedChains.avax ? avaxDistributions[10][i] : 0) + ($selectedChains.op ? opDistributions[10][i] : 0));
		depositDistributions[2].data = ethDistributions[100].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[100][i] : 0) + ($selectedChains.avax ? avaxDistributions[100][i] : 0) + ($selectedChains.op ? opDistributions[100][i] : 0));
		depositDistributions[3].data = ethDistributions[1000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[1000][i] : 0) + ($selectedChains.avax ? avaxDistributions[1000][i] : 0) + ($selectedChains.op ? opDistributions[1000][i] : 0));
		depositDistributions[4].data = ethDistributions[10000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[10000][i] : 0) + ($selectedChains.avax ? avaxDistributions[10000][i] : 0) + ($selectedChains.op ? opDistributions[10000][i] : 0));
		depositDistributions[5].data = ethDistributions[100000].map((val, i) => ($selectedChains.eth ? val : 0) + ($selectedChains.poly ? polyDistributions[100000][i] : 0) + ($selectedChains.avax ? avaxDistributions[100000][i] : 0) + ($selectedChains.op ? opDistributions[100000][i] : 0));

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
<LineChart {...chainDistributionChart} hide={numChainsSelected < 2} />
<LineChart {...cumulativeDepositAmountsChart} />
<LineChart {...cumulativeDepositCountsChart} />
<LineChart {...depositAmountsChart} />
<LineChart {...depositCountsChart} />
<Highlight>
	<span class="big">Top 5 Whales:</span>
	<span class="list">
		{#each topWhales as whale}
			<span>
				<a href="{`/${whale.wallet}`}" class="highlight" title="{whale.wallet}">{getShortWallet(whale.wallet)}</a>
				<span>${whale.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
			</span>
		{/each}
	</span>
</Highlight>
<LineChart {...avgDepositAmountsChart} />
<LineChart {...cumulativeUniqueWalletsChart} />
<PieChart {...tvlDistributionChart} />
<PieChart {...multichainUsersChart} hide={numChainsSelected < 2} />
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