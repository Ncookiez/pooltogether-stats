"use strict";
// Initializations:
var ticks = 50;
/* ====================================================================================================================================================== */
// Function to react to incoming messages:
onmessage = function (event) {
    // Initializations:
    var data = event.data[0];
    var advancedStats = event.data[1];
    var minTimestamp = event.data[2];
    var maxTimestamp = event.data[3];
    // Getting Timestamps:
    var timestamps = getTimestamps(minTimestamp, maxTimestamp);
    if (data) {
        // Calculating Advanced Stats:
        var depositsOverTime = calcDepositsOverTime(data, timestamps);
        var withdrawalsOverTime = calcWithdrawalsOverTime(data, timestamps);
        var claimsOverTime = calcClaimsOverTime(data, timestamps);
        var tvlOverTime = calcTVLOverTime(data, timestamps, depositsOverTime, withdrawalsOverTime, claimsOverTime);
        var delegationsOverTime = calcDelegationsOverTime(data, timestamps);
        var yieldOverTime = calcYieldOverTime(data, timestamps);
        var wallets = advancedStats ? advancedStats.wallets : getWalletData(data);
        var winlessWithdrawals = advancedStats ? advancedStats.winlessWithdrawals : calcWinlessWithdrawals(wallets);
        var tvlDistribution = advancedStats ? advancedStats.tvlDistribution : calcTVLDistribution(data.balances.data);
        // Setting Advanced Stats:
        var newAdvancedStats = { minTimestamp: minTimestamp, maxTimestamp: maxTimestamp, depositsOverTime: depositsOverTime, withdrawalsOverTime: withdrawalsOverTime, claimsOverTime: claimsOverTime, tvlOverTime: tvlOverTime, delegationsOverTime: delegationsOverTime, yieldOverTime: yieldOverTime, wallets: wallets, winlessWithdrawals: winlessWithdrawals, tvlDistribution: tvlDistribution };
        postMessage(newAdvancedStats);
        // Resetting Memory:
        data = undefined;
        advancedStats = undefined;
        timestamps = [];
        depositsOverTime = undefined;
        withdrawalsOverTime = undefined;
        claimsOverTime = undefined;
        tvlOverTime = undefined;
        delegationsOverTime = undefined;
        yieldOverTime = undefined;
        wallets = {};
        winlessWithdrawals = [];
        tvlDistribution = undefined;
        newAdvancedStats = undefined;
    }
};
/* ====================================================================================================================================================== */
// Function to calculate deposits over time:
var calcDepositsOverTime = function (chainData, timestamps) {
    // Initializations:
    var depositsOverTime = {
        timestamps: timestamps,
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
    var preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
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
                if ((i > 0 && deposit.timestamp > depositsOverTime.timestamps[i - 1]) || (i === 0 && deposit.timestamp >= preTick)) {
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
// Function to calculate withdrawals over time:
var calcWithdrawalsOverTime = function (chainData, timestamps) {
    // Initializations:
    var withdrawalsOverTime = {
        timestamps: timestamps,
        withdrawalAmounts: [],
        withdrawalCounts: [],
        uniqueWallets: [],
        avgWithdrawalAmounts: [],
        cumulativeWithdrawalAmounts: [],
        cumulativeWithdrawalCounts: [],
        cumulativeUniqueWallets: []
    };
    var preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
    var cumulativeWithdrawalAmount = 0;
    var cumulativeWithdrawalCount = 0;
    var cumulativeUniqueWallets = [];
    var _loop_2 = function (i) {
        var withdrawalAmount = 0;
        var withdrawalCount = 0;
        var newWallets = 0;
        chainData.withdrawals.data.forEach(function (withdrawal) {
            if (withdrawal.timestamp && withdrawal.timestamp <= withdrawalsOverTime.timestamps[i]) {
                if ((i > 0 && withdrawal.timestamp > withdrawalsOverTime.timestamps[i - 1]) || (i === 0 && withdrawal.timestamp >= preTick)) {
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
// Function to calculate claims over time:
var calcClaimsOverTime = function (chainData, timestamps) {
    // Initializations:
    var claimsOverTime = {
        timestamps: timestamps,
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
    var preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
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
                if ((i > 0 && claim.timestamp > claimsOverTime.timestamps[i - 1]) || (i === 0 && claim.timestamp >= preTick)) {
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
// Function to calculate TVL over time:
var calcTVLOverTime = function (chainData, timestamps, depositsOverTime, withdrawalsOverTime, claimsOverTime) {
    // Initializations:
    var tvlOverTime = {
        timestamps: timestamps,
        tvls: []
    };
    var preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
    // Calculating Past Cumulative Deposit Amount:
    var depositIndex = 0;
    var lastDepositTimestamp = 0;
    var pastCumulativeDepositAmount = 0;
    var reversedDeposits = chainData.deposits.data.slice().reverse();
    while (lastDepositTimestamp < preTick && depositIndex < chainData.deposits.data.length) {
        var deposit = reversedDeposits[depositIndex];
        if (deposit.timestamp) {
            if (deposit.timestamp < preTick) {
                pastCumulativeDepositAmount += deposit.amount;
            }
            lastDepositTimestamp = deposit.timestamp;
        }
        depositIndex++;
    }
    // Calculating Past Cumulative Withdrawal Amount:
    var withdrawalIndex = 0;
    var lastWithdrawalTimestamp = 0;
    var pastCumulativeWithdrawalAmount = 0;
    var reversedWithdrawals = chainData.withdrawals.data.slice().reverse();
    while (lastWithdrawalTimestamp < preTick && withdrawalIndex < chainData.withdrawals.data.length) {
        var withdrawal = reversedWithdrawals[withdrawalIndex];
        if (withdrawal.timestamp) {
            if (withdrawal.timestamp < preTick) {
                pastCumulativeWithdrawalAmount += withdrawal.amount;
            }
            lastWithdrawalTimestamp = withdrawal.timestamp;
        }
        withdrawalIndex++;
    }
    // Calculating Past Cumulative Claim Amount:
    var claimIndex = 0;
    var lastClaimTimestamp = 0;
    var pastCumulativeClaimAmount = 0;
    var reversedClaims = chainData.claims.data.slice().reverse();
    while (lastClaimTimestamp < preTick && claimIndex < chainData.claims.data.length) {
        var claim = reversedClaims[claimIndex];
        if (claim.timestamp) {
            if (claim.timestamp < preTick) {
                pastCumulativeClaimAmount += claim.prizes.reduce(function (a, b) { return a + b; }, 0);
            }
            lastClaimTimestamp = claim.timestamp;
        }
        claimIndex++;
    }
    // Calculating Past TVL:
    var pastTVL = pastCumulativeDepositAmount + pastCumulativeClaimAmount - pastCumulativeWithdrawalAmount;
    // Calculating TVL Over Time:
    for (var i = 0; i < tvlOverTime.timestamps.length; i++) {
        var tvl = pastTVL + depositsOverTime.cumulativeDepositAmounts[i] + claimsOverTime.cumulativeClaimAmounts[i] - withdrawalsOverTime.cumulativeWithdrawalAmounts[i];
        tvlOverTime.tvls.push(tvl);
    }
    return tvlOverTime;
};
/* ====================================================================================================================================================== */
// Function to calculate delegations over time:
var calcDelegationsOverTime = function (chainData, timestamps) {
    // Initializations:
    var delegationsOverTime = {
        timestamps: timestamps,
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
    var preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
    var cumulativeDelegationAmount = 0;
    var cumulativeDelegationCount = 0;
    var cumulativeDelegationWithdrawalAmount = 0;
    var cumulativeDelegationWithdrawalCount = 0;
    var cumulativeUniqueWallets = [];
    // Calculating Past Cumulative Funded Delegation Amount:
    var fundedDelegationsIndex = 0;
    var lastFundedDelegationTimestamp = 0;
    var pastCumulativeFundedDelegationAmount = 0;
    var reversedFundedDelegations = chainData.delegationsFunded.data.slice().reverse();
    while (lastFundedDelegationTimestamp < preTick && fundedDelegationsIndex < chainData.delegationsFunded.data.length) {
        var delegation = reversedFundedDelegations[fundedDelegationsIndex];
        if (delegation.timestamp) {
            if (delegation.timestamp < preTick) {
                pastCumulativeFundedDelegationAmount += delegation.amount;
            }
            lastFundedDelegationTimestamp = delegation.timestamp;
        }
        fundedDelegationsIndex++;
    }
    // Calculating Past Cumulative Delegation Withdrawal Amount:
    var delegationWithdrawalIndex = 0;
    var lastDelegationWithdrawalTimestamp = 0;
    var pastCumulativeDelegationWithdrawalAmount = 0;
    var reversedDelegationWithdrawals = chainData.delegationsWithdrawn.data.slice().reverse();
    while (lastDelegationWithdrawalTimestamp < preTick && delegationWithdrawalIndex < chainData.delegationsWithdrawn.data.length) {
        var delegation = reversedDelegationWithdrawals[delegationWithdrawalIndex];
        if (delegation.timestamp) {
            if (delegation.timestamp < preTick) {
                pastCumulativeDelegationWithdrawalAmount += delegation.amount;
            }
            lastDelegationWithdrawalTimestamp = delegation.timestamp;
        }
        delegationWithdrawalIndex++;
    }
    // Calculating Past Delegation TVL:
    var pastDelegationTVL = pastCumulativeFundedDelegationAmount - pastCumulativeDelegationWithdrawalAmount;
    var _loop_4 = function (i) {
        var delegationAmount = 0;
        var delegationCount = 0;
        var delegationWithdrawalAmount = 0;
        var delegationWithdrawalCount = 0;
        var newWallets = 0;
        chainData.delegationsCreated.data.forEach(function (delegation) {
            if (delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
                if ((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && delegation.timestamp >= preTick)) {
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
                if ((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && delegation.timestamp >= preTick)) {
                    delegationAmount += delegation.amount;
                }
            }
        });
        chainData.delegationsWithdrawn.data.forEach(function (delegation) {
            if (delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
                if ((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && delegation.timestamp >= preTick)) {
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
        delegationsOverTime.tvls.push(Math.floor(pastDelegationTVL + cumulativeDelegationAmount - cumulativeDelegationWithdrawalAmount));
    };
    // Filtering Data:
    for (var i = 0; i < ticks; i++) {
        _loop_4(i);
    }
    return delegationsOverTime;
};
/* ====================================================================================================================================================== */
// Function to calculate yield captures over time:
var calcYieldOverTime = function (chainData, timestamps) {
    // Initializations:
    var yieldOverTime = {
        timestamps: timestamps,
        yieldAmounts: [],
        yieldCounts: [],
        cumulativeYieldAmounts: [],
        cumulativeYieldCounts: []
    };
    var preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
    var cumulativeYieldAmount = 0;
    var cumulativeYieldCount = 0;
    var _loop_5 = function (i) {
        var yieldAmount = 0;
        var yieldCount = 0;
        chainData.yields.data.forEach(function (yieldTX) {
            if (yieldTX.timestamp && yieldTX.timestamp <= yieldOverTime.timestamps[i]) {
                if ((i > 0 && yieldTX.timestamp > yieldOverTime.timestamps[i - 1]) || (i === 0 && yieldTX.timestamp >= preTick)) {
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
        if (wallets[deposit.wallet] && deposit.timestamp) {
            wallets[deposit.wallet].txs.push({ type: 'deposit', data: deposit });
        }
    });
    chainData.withdrawals.data.forEach(function (withdrawal) {
        if (wallets[withdrawal.wallet] && withdrawal.timestamp) {
            wallets[withdrawal.wallet].txs.push({ type: 'withdrawal', data: withdrawal });
        }
    });
    chainData.claims.data.forEach(function (claim) {
        if (wallets[claim.wallet] && claim.timestamp) {
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
// Function to calculate winless withdrawals:
var calcWinlessWithdrawals = function (wallets) {
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
// Function to calculate TVL distribution:
var calcTVLDistribution = function (balances) {
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
// Helper function to get timestamps:
var getTimestamps = function (start, end) {
    var timestamps = [];
    var timespan = end - start;
    var tick = timespan / ticks;
    var value = start;
    while (Math.ceil(value) < end) {
        value += tick;
        timestamps.push(Math.ceil(value));
    }
    return timestamps;
};
