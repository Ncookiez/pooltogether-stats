"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Initializations:
var defaultMaxTimestamp = 9999999999;
var ticks = 50;
/* ====================================================================================================================================================== */
// Function to react to incoming messages:
onmessage = function (event) {
    if (event.data.length === 1) {
        var chainData = event.data[0];
        var data = calculateData(chainData);
        postMessage(data);
    }
    else if (event.data.length === 4) {
        if (event.data[0].deposits) {
            var chainsData = event.data;
            var aggregatedData = getAggregatedData(chainsData[0], chainsData[1], chainsData[2], chainsData[3]);
            postMessage(aggregatedData);
        }
        else {
            var chainsBalances = event.data;
            var multichainUsersData = getMultichainUsersDistribution(chainsBalances[0], chainsBalances[1], chainsBalances[2], chainsBalances[3]);
            postMessage(multichainUsersData);
        }
    }
    else if (event.data.length === 5) {
        var movingUsers = getMovingUsers(event.data[0], event.data[1], event.data[2], event.data[3], event.data[4]);
        postMessage(movingUsers);
    }
    else {
        console.error('Invalid data sent to worker.');
    }
};
/* ====================================================================================================================================================== */
// Function to calculate extra data:
var calculateData = function (chainData) {
    var _a;
    _a = getTimestamps(chainData, true), chainData.minTimestamp = _a[0], chainData.maxTimestamp = _a[1];
    chainData.depositsOverTime = getDepositsOverTime(chainData);
    chainData.withdrawalsOverTime = getWithdrawalsOverTime(chainData);
    chainData.claimsOverTime = getClaimsOverTime(chainData);
    chainData.tvlOverTime = getTVLOverTime(chainData.depositsOverTime, chainData.withdrawalsOverTime, chainData.claimsOverTime);
    chainData.delegationsOverTime = getDelegationsOverTime(chainData);
    chainData.yieldOverTime = getYieldOverTime(chainData);
    chainData.wallets = getWalletData(chainData);
    chainData.winlessWithdrawals = getWinlessWithdrawals(chainData.wallets);
    chainData.tvlDistribution = getTVLDistribution(chainData.balances.data);
    return chainData;
};
/* ====================================================================================================================================================== */
// Function to get array of numbers:
var getRangeArray = function (start, end) {
    var range = [];
    var tick = (end - start) / ticks;
    var value = start;
    while (Math.ceil(value) < end) {
        value += tick;
        range.push(Math.ceil(value));
    }
    return range;
};
/* ====================================================================================================================================================== */
// Function to get timestamps:
var getTimestamps = function (chainData, simple) {
    var firstTimestamp = chainData.deposits.data[0].timestamp;
    var lastTimestamp = chainData.balances.timestamp;
    if (simple) {
        return [firstTimestamp, lastTimestamp];
    }
    else {
        return getRangeArray(firstTimestamp, lastTimestamp);
    }
};
/* ====================================================================================================================================================== */
// Function to get deposits over time:
var getDepositsOverTime = function (chainData) {
    // Initializations:
    var depositsOverTime = {
        timestamps: getTimestamps(chainData),
        depositAmounts: [],
        depositCounts: [],
        uniqueWallets: [],
        distributions: { 1: [], 10: [], 100: [], 1000: [], 10000: [], 100000: [] },
        avgDepositAmounts: [],
        cumulativeDepositAmounts: [],
        cumulativeDepositCounts: [],
        cumulativeUniqueWallets: [],
        cumulativeDistributions: { 1: [], 10: [], 100: [], 1000: [], 10000: [], 100000: [] }
    };
    var cumulativeDepositAmount = 0;
    var cumulativeDepositCount = 0;
    var cumulativeUniqueWallets = [];
    var cumulativeDistributions = { 1: 0, 10: 0, 100: 0, 1000: 0, 10000: 0, 100000: 0 };
    var _loop_1 = function (i) {
        var depositAmount = 0;
        var depositCount = 0;
        var newWallets = 0;
        var distributions = { 1: 0, 10: 0, 100: 0, 1000: 0, 10000: 0, 100000: 0 };
        chainData.deposits.data.forEach(function (deposit) {
            if (deposit.timestamp && deposit.timestamp <= depositsOverTime.timestamps[i]) {
                if ((i > 0 && deposit.timestamp > depositsOverTime.timestamps[i - 1]) || i === 0) {
                    depositAmount += deposit.amount;
                    depositCount++;
                    if (!cumulativeUniqueWallets.includes(deposit.wallet)) {
                        cumulativeUniqueWallets.push(deposit.wallet);
                        newWallets++;
                    }
                    if (deposit.amount >= 1) {
                        if (deposit.amount >= 10) {
                            if (deposit.amount >= 100) {
                                if (deposit.amount >= 1000) {
                                    if (deposit.amount >= 10000) {
                                        if (deposit.amount >= 100000) {
                                            distributions[100000]++;
                                        }
                                        else {
                                            distributions[10000]++;
                                        }
                                    }
                                    else {
                                        distributions[1000]++;
                                    }
                                }
                                else {
                                    distributions[100]++;
                                }
                            }
                            else {
                                distributions[10]++;
                            }
                        }
                        else {
                            distributions[1]++;
                        }
                    }
                }
            }
        });
        cumulativeDepositAmount += depositAmount;
        cumulativeDepositCount += depositCount;
        cumulativeDistributions[1] += distributions[1];
        cumulativeDistributions[10] += distributions[10];
        cumulativeDistributions[100] += distributions[100];
        cumulativeDistributions[1000] += distributions[1000];
        cumulativeDistributions[10000] += distributions[10000];
        cumulativeDistributions[100000] += distributions[100000];
        depositsOverTime.depositAmounts.push(Math.floor(depositAmount));
        depositsOverTime.depositCounts.push(depositCount);
        depositsOverTime.uniqueWallets.push(newWallets);
        depositsOverTime.distributions[1].push(distributions[1]);
        depositsOverTime.distributions[10].push(distributions[10]);
        depositsOverTime.distributions[100].push(distributions[100]);
        depositsOverTime.distributions[1000].push(distributions[1000]);
        depositsOverTime.distributions[10000].push(distributions[10000]);
        depositsOverTime.distributions[100000].push(distributions[100000]);
        depositsOverTime.avgDepositAmounts.push(depositCount > 0 ? Math.floor(depositAmount / depositCount) : 0);
        depositsOverTime.cumulativeDepositAmounts.push(Math.floor(cumulativeDepositAmount));
        depositsOverTime.cumulativeDepositCounts.push(cumulativeDepositCount);
        depositsOverTime.cumulativeUniqueWallets.push(cumulativeUniqueWallets.length);
        depositsOverTime.cumulativeDistributions[1].push(cumulativeDistributions[1]);
        depositsOverTime.cumulativeDistributions[10].push(cumulativeDistributions[10]);
        depositsOverTime.cumulativeDistributions[100].push(cumulativeDistributions[100]);
        depositsOverTime.cumulativeDistributions[1000].push(cumulativeDistributions[1000]);
        depositsOverTime.cumulativeDistributions[10000].push(cumulativeDistributions[10000]);
        depositsOverTime.cumulativeDistributions[100000].push(cumulativeDistributions[100000]);
    };
    // Filtering Data:
    for (var i = 0; i < ticks; i++) {
        _loop_1(i);
    }
    return depositsOverTime;
};
/* ====================================================================================================================================================== */
// Function to get withdrawals over time:
var getWithdrawalsOverTime = function (chainData) {
    // Initializations:
    var withdrawalsOverTime = {
        timestamps: getTimestamps(chainData),
        withdrawalAmounts: [],
        withdrawalCounts: [],
        uniqueWallets: [],
        avgWithdrawalAmounts: [],
        cumulativeWithdrawalAmounts: [],
        cumulativeWithdrawalCounts: [],
        cumulativeUniqueWallets: []
    };
    var cumulativeWithdrawalAmount = 0;
    var cumulativeWithdrawalCount = 0;
    var cumulativeUniqueWallets = [];
    var _loop_2 = function (i) {
        var withdrawalAmount = 0;
        var withdrawalCount = 0;
        var newWallets = 0;
        chainData.withdrawals.data.forEach(function (withdrawal) {
            if (withdrawal.timestamp && withdrawal.timestamp <= withdrawalsOverTime.timestamps[i]) {
                if ((i > 0 && withdrawal.timestamp > withdrawalsOverTime.timestamps[i - 1]) || i === 0) {
                    withdrawalAmount += withdrawal.amount;
                    withdrawalCount++;
                    if (!cumulativeUniqueWallets.includes(withdrawal.wallet)) {
                        cumulativeUniqueWallets.push(withdrawal.wallet);
                        newWallets++;
                    }
                }
            }
        });
        cumulativeWithdrawalAmount += withdrawalAmount;
        cumulativeWithdrawalCount += withdrawalCount;
        withdrawalsOverTime.withdrawalAmounts.push(Math.floor(withdrawalAmount));
        withdrawalsOverTime.withdrawalCounts.push(withdrawalCount);
        withdrawalsOverTime.uniqueWallets.push(newWallets);
        withdrawalsOverTime.avgWithdrawalAmounts.push(withdrawalCount > 0 ? Math.floor(withdrawalAmount / withdrawalCount) : 0);
        withdrawalsOverTime.cumulativeWithdrawalAmounts.push(Math.floor(cumulativeWithdrawalAmount));
        withdrawalsOverTime.cumulativeWithdrawalCounts.push(cumulativeWithdrawalCount);
        withdrawalsOverTime.cumulativeUniqueWallets.push(cumulativeUniqueWallets.length);
    };
    // Filtering Data:
    for (var i = 0; i < ticks; i++) {
        _loop_2(i);
    }
    return withdrawalsOverTime;
};
/* ====================================================================================================================================================== */
// Function to get claims over time:
var getClaimsOverTime = function (chainData) {
    // Initializations:
    var claimsOverTime = {
        timestamps: getTimestamps(chainData),
        claimAmounts: [],
        claimCounts: [],
        prizeCounts: [],
        uniqueWallets: [],
        distributions: { 1: [], 5: [], 10: [], 50: [], 100: [], 500: [], 1000: [] },
        avgClaimAmounts: [],
        cumulativeClaimAmounts: [],
        cumulativeClaimCounts: [],
        cumulativePrizeCounts: [],
        cumulativeUniqueWallets: [],
        cumulativeDistributions: { 1: [], 5: [], 10: [], 50: [], 100: [], 500: [], 1000: [] }
    };
    var cumulativeClaimAmount = 0;
    var cumulativeClaimCount = 0;
    var cumulativePrizeCount = 0;
    var cumulativeUniqueWallets = [];
    var cumulativeDistributions = { 1: 0, 5: 0, 10: 0, 50: 0, 100: 0, 500: 0, 1000: 0 };
    var _loop_3 = function (i) {
        var claimAmount = 0;
        var claimCount = 0;
        var prizeCount = 0;
        var newWallets = 0;
        var distributions = { 1: 0, 5: 0, 10: 0, 50: 0, 100: 0, 500: 0, 1000: 0 };
        chainData.claims.data.forEach(function (claim) {
            if (claim.timestamp && claim.timestamp <= claimsOverTime.timestamps[i]) {
                if ((i > 0 && claim.timestamp > claimsOverTime.timestamps[i - 1]) || i === 0) {
                    var totalAmountClaimed = claim.prizes.reduce(function (a, b) { return a + b; }, 0);
                    claimAmount += totalAmountClaimed;
                    claimCount++;
                    prizeCount += claim.prizes.length;
                    if (!cumulativeUniqueWallets.includes(claim.wallet)) {
                        cumulativeUniqueWallets.push(claim.wallet);
                        newWallets++;
                    }
                    if (totalAmountClaimed >= 1) {
                        if (totalAmountClaimed >= 5) {
                            if (totalAmountClaimed >= 10) {
                                if (totalAmountClaimed >= 50) {
                                    if (totalAmountClaimed >= 100) {
                                        if (totalAmountClaimed >= 500) {
                                            if (totalAmountClaimed >= 1000) {
                                                distributions[1000]++;
                                            }
                                            else {
                                                distributions[500]++;
                                            }
                                        }
                                        else {
                                            distributions[100]++;
                                        }
                                    }
                                    else {
                                        distributions[50]++;
                                    }
                                }
                                else {
                                    distributions[10]++;
                                }
                            }
                            else {
                                distributions[5]++;
                            }
                        }
                        else {
                            distributions[1]++;
                        }
                    }
                }
            }
        });
        cumulativeClaimAmount += claimAmount;
        cumulativeClaimCount += claimCount;
        cumulativePrizeCount += prizeCount;
        cumulativeDistributions[1] += distributions[1];
        cumulativeDistributions[5] += distributions[5];
        cumulativeDistributions[10] += distributions[10];
        cumulativeDistributions[50] += distributions[50];
        cumulativeDistributions[100] += distributions[100];
        cumulativeDistributions[500] += distributions[500];
        cumulativeDistributions[1000] += distributions[1000];
        claimsOverTime.claimAmounts.push(Math.floor(claimAmount));
        claimsOverTime.claimCounts.push(claimCount);
        claimsOverTime.prizeCounts.push(prizeCount);
        claimsOverTime.uniqueWallets.push(newWallets);
        claimsOverTime.distributions[1].push(distributions[1]);
        claimsOverTime.distributions[5].push(distributions[5]);
        claimsOverTime.distributions[10].push(distributions[10]);
        claimsOverTime.distributions[50].push(distributions[50]);
        claimsOverTime.distributions[100].push(distributions[100]);
        claimsOverTime.distributions[500].push(distributions[500]);
        claimsOverTime.distributions[1000].push(distributions[1000]);
        claimsOverTime.avgClaimAmounts.push(claimCount > 0 ? Math.floor(claimAmount / claimCount) : 0);
        claimsOverTime.cumulativeClaimAmounts.push(Math.floor(cumulativeClaimAmount));
        claimsOverTime.cumulativeClaimCounts.push(cumulativeClaimCount);
        claimsOverTime.cumulativePrizeCounts.push(cumulativePrizeCount);
        claimsOverTime.cumulativeUniqueWallets.push(cumulativeUniqueWallets.length);
        claimsOverTime.cumulativeDistributions[1].push(cumulativeDistributions[1]);
        claimsOverTime.cumulativeDistributions[5].push(cumulativeDistributions[5]);
        claimsOverTime.cumulativeDistributions[10].push(cumulativeDistributions[10]);
        claimsOverTime.cumulativeDistributions[50].push(cumulativeDistributions[50]);
        claimsOverTime.cumulativeDistributions[100].push(cumulativeDistributions[100]);
        claimsOverTime.cumulativeDistributions[500].push(cumulativeDistributions[500]);
        claimsOverTime.cumulativeDistributions[1000].push(cumulativeDistributions[1000]);
    };
    // Filtering Data:
    for (var i = 0; i < ticks; i++) {
        _loop_3(i);
    }
    return claimsOverTime;
};
/* ====================================================================================================================================================== */
// Function to get TVL over time:
var getTVLOverTime = function (deposits, withdrawals, claims) {
    // Initializations:
    var tvlOverTime = {
        timestamps: deposits.timestamps,
        tvls: []
    };
    // Calculating TVL Over Time:
    for (var i = 0; i < tvlOverTime.timestamps.length; i++) {
        var tvl = deposits.cumulativeDepositAmounts[i] + claims.cumulativeClaimAmounts[i] - withdrawals.cumulativeWithdrawalAmounts[i];
        tvlOverTime.tvls.push(tvl);
    }
    return tvlOverTime;
};
/* ====================================================================================================================================================== */
// Function to get delegations over time:
var getDelegationsOverTime = function (chainData) {
    // Initializations:
    var delegationsOverTime = {
        timestamps: getTimestamps(chainData),
        delegationAmounts: [],
        delegationCounts: [],
        delegationWithdrawalAmounts: [],
        delegationWithdrawalCounts: [],
        uniqueWallets: [],
        avgDelegationAmounts: [],
        cumulativeDelegationAmounts: [],
        cumulativeDelegationCounts: [],
        cumulativeDelegationWithdrawalAmounts: [],
        cumulativeDelegationWithdrawalCounts: [],
        cumulativeUniqueWallets: [],
        tvls: []
    };
    var cumulativeDelegationAmount = 0;
    var cumulativeDelegationCount = 0;
    var cumulativeDelegationWithdrawalAmount = 0;
    var cumulativeDelegationWithdrawalCount = 0;
    var cumulativeUniqueWallets = [];
    var _loop_4 = function (i) {
        var delegationAmount = 0;
        var delegationCount = 0;
        var delegationWithdrawalAmount = 0;
        var delegationWithdrawalCount = 0;
        var newWallets = 0;
        chainData.delegationsCreated.data.forEach(function (delegation) {
            if (delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
                if ((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || i === 0) {
                    delegationCount++;
                    if (!cumulativeUniqueWallets.includes(delegation.delegator)) {
                        cumulativeUniqueWallets.push(delegation.delegator);
                        newWallets++;
                    }
                }
            }
        });
        chainData.delegationsFunded.data.forEach(function (delegation) {
            if (delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
                if ((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || i === 0) {
                    delegationAmount += delegation.amount;
                }
            }
        });
        chainData.delegationsWithdrawn.data.forEach(function (delegation) {
            if (delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
                if ((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || i === 0) {
                    delegationWithdrawalAmount += delegation.amount;
                    delegationWithdrawalCount++;
                }
            }
        });
        cumulativeDelegationAmount += delegationAmount;
        cumulativeDelegationCount += delegationCount;
        cumulativeDelegationWithdrawalAmount += delegationWithdrawalAmount;
        cumulativeDelegationWithdrawalCount += delegationWithdrawalCount;
        delegationsOverTime.delegationAmounts.push(Math.floor(delegationAmount));
        delegationsOverTime.delegationCounts.push(delegationCount);
        delegationsOverTime.delegationWithdrawalAmounts.push(Math.floor(delegationWithdrawalAmount));
        delegationsOverTime.delegationWithdrawalCounts.push(delegationWithdrawalCount);
        delegationsOverTime.uniqueWallets.push(newWallets);
        delegationsOverTime.avgDelegationAmounts.push(delegationCount > 0 ? Math.floor(delegationAmount / delegationCount) : 0);
        delegationsOverTime.cumulativeDelegationAmounts.push(Math.floor(cumulativeDelegationAmount));
        delegationsOverTime.cumulativeDelegationCounts.push(cumulativeDelegationCount);
        delegationsOverTime.cumulativeDelegationWithdrawalAmounts.push(Math.floor(cumulativeDelegationWithdrawalAmount));
        delegationsOverTime.cumulativeDelegationWithdrawalCounts.push(cumulativeDelegationWithdrawalCount);
        delegationsOverTime.cumulativeUniqueWallets.push(cumulativeUniqueWallets.length);
        delegationsOverTime.tvls.push(Math.floor(cumulativeDelegationAmount - cumulativeDelegationWithdrawalAmount));
    };
    // Filtering Data:
    for (var i = 0; i < ticks; i++) {
        _loop_4(i);
    }
    return delegationsOverTime;
};
/* ====================================================================================================================================================== */
// Function to get yield captures over time:
var getYieldOverTime = function (chainData) {
    // Initializations:
    var yieldOverTime = {
        timestamps: getTimestamps(chainData),
        yieldAmounts: [],
        yieldCounts: [],
        cumulativeYieldAmounts: [],
        cumulativeYieldCounts: []
    };
    var cumulativeYieldAmount = 0;
    var cumulativeYieldCount = 0;
    var _loop_5 = function (i) {
        var yieldAmount = 0;
        var yieldCount = 0;
        chainData.yields.data.forEach(function (yieldTX) {
            if (yieldTX.timestamp && yieldTX.timestamp <= yieldOverTime.timestamps[i]) {
                if ((i > 0 && yieldTX.timestamp > yieldOverTime.timestamps[i - 1]) || i === 0) {
                    yieldAmount += yieldTX.amount;
                    yieldCount++;
                }
            }
        });
        cumulativeYieldAmount += yieldAmount;
        cumulativeYieldCount += yieldCount;
        yieldOverTime.yieldAmounts.push(Math.floor(yieldAmount));
        yieldOverTime.yieldCounts.push(yieldCount);
        yieldOverTime.cumulativeYieldAmounts.push(Math.floor(cumulativeYieldAmount));
        yieldOverTime.cumulativeYieldCounts.push(cumulativeYieldCount);
    };
    // Filtering Data:
    for (var i = 0; i < ticks; i++) {
        _loop_5(i);
    }
    return yieldOverTime;
};
/* ====================================================================================================================================================== */
// Function to get wallet-specific data:
var getWalletData = function (chainData) {
    // Initializations:
    var wallets = {};
    // Adding Data:
    chainData.balances.data.forEach(function (entry) {
        wallets[entry.wallet] = { txs: [], currentBalance: entry.balance };
    });
    chainData.deposits.data.forEach(function (deposit) {
        if (deposit.timestamp) {
            wallets[deposit.wallet].txs.push({ type: 'deposit', data: deposit });
        }
    });
    chainData.withdrawals.data.forEach(function (withdrawal) {
        if (withdrawal.timestamp) {
            wallets[withdrawal.wallet].txs.push({ type: 'withdrawal', data: withdrawal });
        }
    });
    chainData.claims.data.forEach(function (claim) {
        if (claim.timestamp) {
            wallets[claim.wallet].txs.push({ type: 'claim', data: claim });
        }
    });
    chainData.delegationsCreated.data.forEach(function (delegation) {
        if (wallets[delegation.delegator] && delegation.timestamp) {
            wallets[delegation.delegator].txs.push({ type: 'delegationCreated', data: delegation });
        }
    });
    chainData.delegationsFunded.data.forEach(function (delegation) {
        if (wallets[delegation.delegator] && delegation.timestamp) {
            wallets[delegation.delegator].txs.push({ type: 'delegationFunded', data: delegation });
        }
    });
    chainData.delegationsUpdated.data.forEach(function (delegation) {
        if (wallets[delegation.delegator] && delegation.timestamp) {
            wallets[delegation.delegator].txs.push({ type: 'delegationUpdated', data: delegation });
        }
    });
    chainData.delegationsWithdrawn.data.forEach(function (delegation) {
        if (wallets[delegation.delegator] && delegation.timestamp) {
            wallets[delegation.delegator].txs.push({ type: 'delegationWithdrawn', data: delegation });
        }
    });
    // Sorting Transactions:
    for (var stringWallet in wallets) {
        var wallet = stringWallet;
        wallets[wallet].txs.sort(function (a, b) { return a.data.timestamp - b.data.timestamp; });
    }
    return wallets;
};
/* ====================================================================================================================================================== */
// Function to get winless withdrawals:
var getWinlessWithdrawals = function (wallets) {
    // Initializations:
    var winlessWithdrawals = [];
    var _loop_6 = function (stringWallet) {
        var wallet = stringWallet;
        var walletData = wallets[wallet];
        if (walletData.currentBalance === 0) {
            var claimTXs = walletData.txs.filter(function (tx) { return tx.type === 'claim'; });
            if (claimTXs.length === 0) {
                var virtualBalance_1 = 0;
                var maxVirtualBalance_1 = 0;
                var firstDepositTimestamp_1 = 0;
                var lastWithdrawalTimestamp_1 = 0;
                walletData.txs.forEach(function (tx) {
                    if (tx.type === 'deposit') {
                        virtualBalance_1 += tx.data.amount;
                        if (virtualBalance_1 > maxVirtualBalance_1) {
                            maxVirtualBalance_1 = virtualBalance_1;
                        }
                        if (firstDepositTimestamp_1 === 0 && tx.data.timestamp) {
                            firstDepositTimestamp_1 = tx.data.timestamp;
                        }
                    }
                    else if (tx.type === 'withdrawal') {
                        virtualBalance_1 -= tx.data.amount;
                        if (tx.data.timestamp) {
                            lastWithdrawalTimestamp_1 = tx.data.timestamp;
                        }
                    }
                });
                if (virtualBalance_1 <= 0 && firstDepositTimestamp_1 > 0 && lastWithdrawalTimestamp_1 > 0) {
                    winlessWithdrawals.push({ wallet: wallet, maxBalance: maxVirtualBalance_1, firstDepositTimestamp: firstDepositTimestamp_1, lastWithdrawalTimestamp: lastWithdrawalTimestamp_1 });
                }
            }
        }
    };
    // Filtering Wallets:
    for (var stringWallet in wallets) {
        _loop_6(stringWallet);
    }
    return winlessWithdrawals;
};
/* ====================================================================================================================================================== */
// Function to get TVL distribution:
var getTVLDistribution = function (balances) {
    // Initializations:
    var tvlDistribution = {
        1: { amount: 0, count: 0 },
        10: { amount: 0, count: 0 },
        100: { amount: 0, count: 0 },
        1000: { amount: 0, count: 0 },
        10000: { amount: 0, count: 0 },
        100000: { amount: 0, count: 0 },
        1000000: { amount: 0, count: 0 }
    };
    // Filtering Balances:
    balances.forEach(function (entry) {
        if (entry.balance >= 1) {
            if (entry.balance >= 10) {
                if (entry.balance >= 100) {
                    if (entry.balance >= 1000) {
                        if (entry.balance >= 10000) {
                            if (entry.balance >= 100000) {
                                if (entry.balance >= 1000000) {
                                    tvlDistribution[1000000].amount += entry.balance;
                                    tvlDistribution[1000000].count++;
                                }
                                else {
                                    tvlDistribution[100000].amount += entry.balance;
                                    tvlDistribution[100000].count++;
                                }
                            }
                            else {
                                tvlDistribution[10000].amount += entry.balance;
                                tvlDistribution[10000].count++;
                            }
                        }
                        else {
                            tvlDistribution[1000].amount += entry.balance;
                            tvlDistribution[1000].count++;
                        }
                    }
                    else {
                        tvlDistribution[100].amount += entry.balance;
                        tvlDistribution[100].count++;
                    }
                }
                else {
                    tvlDistribution[10].amount += entry.balance;
                    tvlDistribution[10].count++;
                }
            }
            else {
                tvlDistribution[1].amount += entry.balance;
                tvlDistribution[1].count++;
            }
        }
    });
    return tvlDistribution;
};
/* ====================================================================================================================================================== */
// Function to get users moving to a new chain:
var getMovingUsers = function (withdrawals, ethDeposits, polyDeposits, avaxDeposits, opDeposits) {
    // Initializations:
    var movingUsers = {
        totalWithdrawn: { amount: 0, users: 0 },
        movedToETH: { amount: 0, users: 0 },
        movedToPOLY: { amount: 0, users: 0 },
        movedToAVAX: { amount: 0, users: 0 },
        movedToOP: { amount: 0, users: 0 }
    };
    var uniqueWallets = [];
    // Finding Data:
    withdrawals.forEach(function (withdrawal) {
        var wallet = withdrawal.wallet;
        var timestamp = withdrawal.timestamp;
        if (timestamp && !uniqueWallets.includes(wallet)) {
            uniqueWallets.push(wallet);
            movingUsers.totalWithdrawn.users++;
            // Moving To Ethereum:
            var ethWalletDeposits = ethDeposits.filter(function (deposit) { return deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp; });
            if (ethWalletDeposits.length > 0) {
                ethWalletDeposits.forEach(function (deposit) {
                    movingUsers.movedToETH.amount += deposit.amount;
                });
                movingUsers.movedToETH.users++;
            }
            // Moving To Polygon:
            var polyWalletDeposits = polyDeposits.filter(function (deposit) { return deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp; });
            if (polyWalletDeposits.length > 0) {
                polyWalletDeposits.forEach(function (deposit) {
                    movingUsers.movedToPOLY.amount += deposit.amount;
                });
                movingUsers.movedToPOLY.users++;
            }
            // Moving To Avalanche:
            var avaxWalletDeposits = avaxDeposits.filter(function (deposit) { return deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp; });
            if (avaxWalletDeposits.length > 0) {
                avaxWalletDeposits.forEach(function (deposit) {
                    movingUsers.movedToAVAX.amount += deposit.amount;
                });
                movingUsers.movedToAVAX.users++;
            }
            // Moving To Optimism:
            var opWalletDeposits = opDeposits.filter(function (deposit) { return deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp; });
            if (opWalletDeposits.length > 0) {
                opWalletDeposits.forEach(function (deposit) {
                    movingUsers.movedToOP.amount += deposit.amount;
                });
                movingUsers.movedToOP.users++;
            }
        }
        movingUsers.totalWithdrawn.amount += withdrawal.amount;
    });
    return movingUsers;
};
/* ====================================================================================================================================================== */
// Function to get aggregated data:
var getAggregatedData = function (ethData, polyData, avaxData, opData) {
    var _a, _b;
    // Initializations:
    var aggregatedData = {
        deposits: { data: [] },
        withdrawals: { data: [] },
        claims: { data: [] },
        delegationsCreated: { data: [] },
        delegationsFunded: { data: [] },
        delegationsUpdated: { data: [] },
        delegationsWithdrawn: { data: [] },
        yields: { data: [] },
        balances: { timestamp: 0, data: [] },
        draws: { data: [] },
        minTimestamp: (_a = ethData.minTimestamp) !== null && _a !== void 0 ? _a : 0,
        maxTimestamp: (_b = ethData.maxTimestamp) !== null && _b !== void 0 ? _b : defaultMaxTimestamp
    };
    var chains = ['eth', 'poly', 'avax', 'op'];
    // Aggregating Data:
    [ethData, polyData, avaxData, opData].forEach(function (chainData, chainNum) {
        // Deposits:
        chainData.deposits.data.forEach(function (deposit) {
            aggregatedData.deposits.data.push(__assign(__assign({}, deposit), { chain: chains[chainNum] }));
        });
        // Withdrawals:
        chainData.withdrawals.data.forEach(function (withdrawal) {
            aggregatedData.withdrawals.data.push(__assign(__assign({}, withdrawal), { chain: chains[chainNum] }));
        });
        // Claims:
        chainData.claims.data.forEach(function (claim) {
            aggregatedData.claims.data.push(__assign(__assign({}, claim), { chain: chains[chainNum] }));
        });
        // Delegations Created:
        chainData.delegationsCreated.data.forEach(function (delegation) {
            aggregatedData.delegationsCreated.data.push(__assign(__assign({}, delegation), { chain: chains[chainNum] }));
        });
        // Delegations Funded:
        chainData.delegationsFunded.data.forEach(function (delegation) {
            aggregatedData.delegationsFunded.data.push(__assign(__assign({}, delegation), { chain: chains[chainNum] }));
        });
        // Delegations Updated:
        chainData.delegationsUpdated.data.forEach(function (delegation) {
            aggregatedData.delegationsUpdated.data.push(__assign(__assign({}, delegation), { chain: chains[chainNum] }));
        });
        // Delegations Withdrawn:
        chainData.delegationsWithdrawn.data.forEach(function (delegation) {
            aggregatedData.delegationsWithdrawn.data.push(__assign(__assign({}, delegation), { chain: chains[chainNum] }));
        });
        // Yields:
        chainData.yields.data.forEach(function (yieldTX) {
            aggregatedData.yields.data.push(__assign(__assign({}, yieldTX), { chain: chains[chainNum] }));
        });
        // Balances:
        if (chainData.balances.timestamp && aggregatedData.balances.timestamp && chainData.balances.timestamp > aggregatedData.balances.timestamp) {
            aggregatedData.balances.timestamp = chainData.balances.timestamp;
        }
        chainData.balances.data.forEach(function (entry) {
            var foundEntry = aggregatedData.balances.data.find(function (oldEntry) { return oldEntry.wallet === entry.wallet; });
            if (foundEntry) {
                foundEntry.balance += entry.balance;
            }
            else {
                aggregatedData.balances.data.push(entry);
            }
        });
        // Draws:
        if (aggregatedData.draws.data.length === 0) {
            chainData.draws.data.forEach(function (draw) {
                aggregatedData.draws.data.push({ draw: draw.draw, timestamp: draw.timestamp, result: [] });
            });
        }
        chainData.draws.data.forEach(function (draw, i) {
            var _a;
            if (draw.draw === aggregatedData.draws.data[i].draw) {
                (_a = aggregatedData.draws.data[i].result).push.apply(_a, draw.result.map(function (result) { return (__assign(__assign({}, result), { chain: chains[chainNum] })); }));
            }
            else {
                console.warn('Aggregating Data Error: Draw Number Mismatch!');
            }
        });
        // Timestamps:
        if (chainData.minTimestamp && (chainData.minTimestamp < aggregatedData.minTimestamp || aggregatedData.minTimestamp === 0)) {
            aggregatedData.minTimestamp = chainData.minTimestamp;
        }
        if (chainData.maxTimestamp && (chainData.maxTimestamp > aggregatedData.maxTimestamp || aggregatedData.maxTimestamp === defaultMaxTimestamp)) {
            aggregatedData.maxTimestamp = chainData.maxTimestamp;
        }
    });
    // Sorting Data:
    aggregatedData.deposits.data.sort(function (a, b) { return a.timestamp - b.timestamp; });
    aggregatedData.withdrawals.data.sort(function (a, b) { return a.timestamp - b.timestamp; });
    aggregatedData.claims.data.sort(function (a, b) { return a.timestamp - b.timestamp; });
    aggregatedData.delegationsCreated.data.sort(function (a, b) { return a.timestamp - b.timestamp; });
    aggregatedData.delegationsFunded.data.sort(function (a, b) { return a.timestamp - b.timestamp; });
    aggregatedData.delegationsUpdated.data.sort(function (a, b) { return a.timestamp - b.timestamp; });
    aggregatedData.delegationsWithdrawn.data.sort(function (a, b) { return a.timestamp - b.timestamp; });
    aggregatedData.yields.data.sort(function (a, b) { return a.timestamp - b.timestamp; });
    aggregatedData.balances.data.sort(function (a, b) { return b.balance - a.balance; });
    aggregatedData.draws.data.forEach(function (draw) {
        draw.result.sort(function (a, b) { return b.claimable.reduce(function (a, b) { return a + b; }, 0) - a.claimable.reduce(function (a, b) { return a + b; }, 0); });
    });
    return aggregatedData;
};
/* ====================================================================================================================================================== */
// Function to get multichain users' distribution:
var getMultichainUsersDistribution = function (ethBalances, polyBalances, avaxBalances, opBalances) {
    // Initializations:
    var multichainDistribution = {
        totalUsers: 0,
        oneChain: 0,
        twoChains: 0,
        threeChains: 0,
        fourChains: 0
    };
    var wallets = {};
    // Filtering Balances:
    ethBalances.forEach(function (entry) {
        if (entry.balance > 0) {
            if (wallets[entry.wallet]) {
                wallets[entry.wallet]++;
            }
            else {
                wallets[entry.wallet] = 1;
            }
        }
    });
    polyBalances.forEach(function (entry) {
        if (entry.balance > 0) {
            if (wallets[entry.wallet]) {
                wallets[entry.wallet]++;
            }
            else {
                wallets[entry.wallet] = 1;
            }
        }
    });
    avaxBalances.forEach(function (entry) {
        if (entry.balance > 0) {
            if (wallets[entry.wallet]) {
                wallets[entry.wallet]++;
            }
            else {
                wallets[entry.wallet] = 1;
            }
        }
    });
    opBalances.forEach(function (entry) {
        if (entry.balance > 0) {
            if (wallets[entry.wallet]) {
                wallets[entry.wallet]++;
            }
            else {
                wallets[entry.wallet] = 1;
            }
        }
    });
    // Updating Data:
    for (var stringWallet in wallets) {
        var wallet = stringWallet;
        if (wallets[wallet] === 1) {
            multichainDistribution.oneChain++;
        }
        else if (wallets[wallet] === 2) {
            multichainDistribution.twoChains++;
        }
        else if (wallets[wallet] === 3) {
            multichainDistribution.threeChains++;
        }
        else if (wallets[wallet] === 4) {
            multichainDistribution.fourChains++;
        }
        multichainDistribution.totalUsers++;
    }
    return multichainDistribution;
};
