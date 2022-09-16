
// Initializations:
const ticks = 50;

/* ====================================================================================================================================================== */

// Function to react to incoming messages:
onmessage = (event) => {

  // Initializations:
  let data: ChainData | undefined = event.data[0];
  let advancedStats: AdvancedChainStats | undefined = event.data[1];
  let minTimestamp: number = event.data[2];
  let maxTimestamp: number = event.data[3];

  // Getting Timestamps:
  let timestamps = getTimestamps(minTimestamp, maxTimestamp);

  if(data) {

    // Calculating Advanced Stats:
    let depositsOverTime: DepositsOverTime | undefined = calcDepositsOverTime(data, timestamps);
    let withdrawalsOverTime: WithdrawalsOverTime | undefined = calcWithdrawalsOverTime(data, timestamps);
    let claimsOverTime: ClaimsOverTime | undefined = calcClaimsOverTime(data, timestamps);
    let tvlOverTime: TVLOverTime | undefined = calcTVLOverTime(data, timestamps, depositsOverTime, withdrawalsOverTime, claimsOverTime);
    let delegationsOverTime: DelegationsOverTime | undefined = calcDelegationsOverTime(data, timestamps);
    let yieldOverTime: YieldOverTime | undefined = calcYieldOverTime(data, timestamps);
    let wallets = advancedStats ? advancedStats.wallets : getWalletData(data);
    let winlessWithdrawals = advancedStats ? advancedStats.winlessWithdrawals : calcWinlessWithdrawals(wallets);
    let tvlDistribution: TVLDistribution | undefined = advancedStats ? advancedStats.tvlDistribution : calcTVLDistribution(data.balances.data);
  
    // Setting Advanced Stats:
    let newAdvancedStats: AdvancedChainStats | undefined = { minTimestamp, maxTimestamp, depositsOverTime, withdrawalsOverTime, claimsOverTime, tvlOverTime, delegationsOverTime, yieldOverTime, wallets, winlessWithdrawals, tvlDistribution };
  
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
}

/* ====================================================================================================================================================== */

// Function to calculate deposits over time:
const calcDepositsOverTime = (chainData: ChainData, timestamps: number[]) => {

  // Initializations:
  const depositsOverTime: DepositsOverTime = {
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
  }
  const preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
  let cumulativeDepositAmount = 0;
  let cumulativeDepositCount = 0;
  let cumulativeUniqueWallets: Hash[] = [];
  let cumulativeDistributions = { 1: 0, 10: 0, 100: 0, 1000: 0, 10000: 0, 100000: 0 };
  
  // Filtering Data:
  for(let i = 0; i < ticks; i++) {
    let depositAmount = 0;
    let depositCount = 0;
    let newWallets = 0;
    let distributions = { 1: 0, 10: 0, 100: 0, 1000: 0, 10000: 0, 100000: 0 };
    chainData.deposits.data.forEach(deposit => {
      if(deposit.timestamp && deposit.timestamp <= depositsOverTime.timestamps[i]) {
        if((i > 0 && deposit.timestamp > depositsOverTime.timestamps[i - 1]) || (i === 0 && deposit.timestamp >= preTick)) {
          depositAmount += deposit.amount;
          depositCount++;
          if(!cumulativeUniqueWallets.includes(deposit.wallet)) {
            cumulativeUniqueWallets.push(deposit.wallet);
            newWallets++;
          }
          if(deposit.amount >= 1) {
            if(deposit.amount >= 10) {
              if(deposit.amount >= 100) {
                if(deposit.amount >= 1000) {
                  if(deposit.amount >= 10000) {
                    if(deposit.amount >= 100000) {
                      distributions[100000]++;
                    } else {
                      distributions[10000]++;
                    }
                  } else {
                    distributions[1000]++;
                  }
                } else {
                  distributions[100]++;
                }
              } else {
                distributions[10]++;
              }
            } else {
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
  }

  return depositsOverTime;
}

/* ====================================================================================================================================================== */

// Function to calculate withdrawals over time:
const calcWithdrawalsOverTime = (chainData: ChainData, timestamps: number[]) => {

  // Initializations:
  const withdrawalsOverTime: WithdrawalsOverTime = {
    timestamps: timestamps,
    withdrawalAmounts: [],
    withdrawalCounts: [],
    uniqueWallets: [],
    avgWithdrawalAmounts: [],
    cumulativeWithdrawalAmounts: [],
    cumulativeWithdrawalCounts: [],
    cumulativeUniqueWallets: []
  }
  const preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
  let cumulativeWithdrawalAmount = 0;
  let cumulativeWithdrawalCount = 0;
  let cumulativeUniqueWallets: Hash[] = [];
  
  // Filtering Data:
  for(let i = 0; i < ticks; i++) {
    let withdrawalAmount = 0;
    let withdrawalCount = 0;
    let newWallets = 0;
    chainData.withdrawals.data.forEach(withdrawal => {
      if(withdrawal.timestamp && withdrawal.timestamp <= withdrawalsOverTime.timestamps[i]) {
        if((i > 0 && withdrawal.timestamp > withdrawalsOverTime.timestamps[i - 1]) || (i === 0 && withdrawal.timestamp >= preTick)) {
          withdrawalAmount += withdrawal.amount;
          withdrawalCount++;
          if(!cumulativeUniqueWallets.includes(withdrawal.wallet)) {
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
  }

  return withdrawalsOverTime;
}

/* ====================================================================================================================================================== */

// Function to calculate claims over time:
const calcClaimsOverTime = (chainData: ChainData, timestamps: number[]) => {

  // Initializations:
  const claimsOverTime: ClaimsOverTime = {
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
  }
  const preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
  let cumulativeClaimAmount = 0;
  let cumulativeClaimCount = 0;
  let cumulativePrizeCount = 0;
  let cumulativeUniqueWallets: Hash[] = [];
  let cumulativeDistributions = { 1: 0, 5: 0, 10: 0, 50: 0, 100: 0, 500: 0, 1000: 0 };
  
  // Filtering Data:
  for(let i = 0; i < ticks; i++) {
    let claimAmount = 0;
    let claimCount = 0;
    let prizeCount = 0;
    let newWallets = 0;
    let distributions = { 1: 0, 5: 0, 10: 0, 50: 0, 100: 0, 500: 0, 1000: 0 };
    chainData.claims.data.forEach(claim => {
      if(claim.timestamp && claim.timestamp <= claimsOverTime.timestamps[i]) {
        if((i > 0 && claim.timestamp > claimsOverTime.timestamps[i - 1]) || (i === 0 && claim.timestamp >= preTick)) {
          const totalAmountClaimed = claim.prizes.reduce((a, b) => a + b, 0);
          claimAmount += totalAmountClaimed;
          claimCount++;
          prizeCount += claim.prizes.length;
          if(!cumulativeUniqueWallets.includes(claim.wallet)) {
            cumulativeUniqueWallets.push(claim.wallet);
            newWallets++;
          }
          if(totalAmountClaimed >= 1) {
            if(totalAmountClaimed >= 5) {
              if(totalAmountClaimed >= 10) {
                if(totalAmountClaimed >= 50) {
                  if(totalAmountClaimed >= 100) {
                    if(totalAmountClaimed >= 500) {
                      if(totalAmountClaimed >= 1000) {
                        distributions[1000]++;
                      } else {
                        distributions[500]++;
                      }
                    } else {
                      distributions[100]++;
                    }
                  } else {
                    distributions[50]++;
                  }
                } else {
                  distributions[10]++;
                }
              } else {
                distributions[5]++;
              }
            } else {
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
  }

  return claimsOverTime;
}

/* ====================================================================================================================================================== */

// Function to calculate TVL over time:
const calcTVLOverTime = (chainData: ChainData, timestamps: number[], depositsOverTime: DepositsOverTime, withdrawalsOverTime: WithdrawalsOverTime, claimsOverTime: ClaimsOverTime) => {

  // Initializations:
  const tvlOverTime: TVLOverTime = {
    timestamps: timestamps,
    tvls: []
  }
  const preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
  
  // Calculating Past Cumulative Deposit Amount:
  let depositIndex = 0;
  let lastDepositTimestamp = 0;
  let pastCumulativeDepositAmount = 0;
  let reversedDeposits = chainData.deposits.data.slice().reverse();
  while(lastDepositTimestamp < preTick && depositIndex < chainData.deposits.data.length) {
    const deposit = reversedDeposits[depositIndex];
    if(deposit.timestamp) {
      if(deposit.timestamp < preTick) {
        pastCumulativeDepositAmount += deposit.amount;
      }
      lastDepositTimestamp = deposit.timestamp;
    }
    depositIndex++;
  }

  // Calculating Past Cumulative Withdrawal Amount:
  let withdrawalIndex = 0;
  let lastWithdrawalTimestamp = 0;
  let pastCumulativeWithdrawalAmount = 0;
  let reversedWithdrawals = chainData.withdrawals.data.slice().reverse();
  while(lastWithdrawalTimestamp < preTick && withdrawalIndex < chainData.withdrawals.data.length) {
    const withdrawal = reversedWithdrawals[withdrawalIndex];
    if(withdrawal.timestamp) {
      if(withdrawal.timestamp < preTick) {
        pastCumulativeWithdrawalAmount += withdrawal.amount;
      }
      lastWithdrawalTimestamp = withdrawal.timestamp;
    }
    withdrawalIndex++;
  }

  // Calculating Past Cumulative Claim Amount:
  let claimIndex = 0;
  let lastClaimTimestamp = 0;
  let pastCumulativeClaimAmount = 0;
  let reversedClaims = chainData.claims.data.slice().reverse();
  while(lastClaimTimestamp < preTick && claimIndex < chainData.claims.data.length) {
    const claim = reversedClaims[claimIndex];
    if(claim.timestamp) {
      if(claim.timestamp < preTick) {
        pastCumulativeClaimAmount += claim.prizes.reduce((a, b) => a + b, 0);
      }
      lastClaimTimestamp = claim.timestamp;
    }
    claimIndex++;
  }

  // Calculating Past TVL:
  const pastTVL = pastCumulativeDepositAmount + pastCumulativeClaimAmount - pastCumulativeWithdrawalAmount;

  // Calculating TVL Over Time:
  for(let i = 0; i < tvlOverTime.timestamps.length; i++) {
    const tvl = pastTVL + depositsOverTime.cumulativeDepositAmounts[i] + claimsOverTime.cumulativeClaimAmounts[i] - withdrawalsOverTime.cumulativeWithdrawalAmounts[i];
    tvlOverTime.tvls.push(tvl);
  }

  return tvlOverTime;
}

/* ====================================================================================================================================================== */

// Function to calculate delegations over time:
const calcDelegationsOverTime = (chainData: ChainData, timestamps: number[]) => {

  // Initializations:
  const delegationsOverTime: DelegationsOverTime = {
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
  }
  const preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
  let cumulativeDelegationAmount = 0;
  let cumulativeDelegationCount = 0;
  let cumulativeDelegationWithdrawalAmount = 0;
  let cumulativeDelegationWithdrawalCount = 0;
  let cumulativeUniqueWallets: Hash[] = [];
  
  // Filtering Data:
  for(let i = 0; i < ticks; i++) {
    let delegationAmount = 0;
    let delegationCount = 0;
    let delegationWithdrawalAmount = 0;
    let delegationWithdrawalCount = 0;
    let newWallets = 0;
    chainData.delegationsCreated.data.forEach(delegation => {
      if(delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && delegation.timestamp >= preTick)) {
          delegationCount++;
          if(!cumulativeUniqueWallets.includes(delegation.delegator)) {
            cumulativeUniqueWallets.push(delegation.delegator);
            newWallets++;
          }
        }
      }
    });
    chainData.delegationsFunded.data.forEach(delegation => {
      if(delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && delegation.timestamp >= preTick)) {
          delegationAmount += delegation.amount;
        }
      }
    });
    chainData.delegationsWithdrawn.data.forEach(delegation => {
      if(delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && delegation.timestamp >= preTick)) {
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
  }

  return delegationsOverTime;
}

/* ====================================================================================================================================================== */

// Function to calculate yield captures over time:
const calcYieldOverTime = (chainData: ChainData, timestamps: number[]) => {

  // Initializations:
  const yieldOverTime: YieldOverTime = {
    timestamps: timestamps,
    yieldAmounts: [],
    yieldCounts: [],
    cumulativeYieldAmounts: [],
    cumulativeYieldCounts: []
  }
  const preTick = timestamps[0] - (timestamps[1] - timestamps[0]);
  let cumulativeYieldAmount = 0;
  let cumulativeYieldCount = 0;
  
  // Filtering Data:
  for(let i = 0; i < ticks; i++) {
    let yieldAmount = 0;
    let yieldCount = 0;
    chainData.yields.data.forEach(yieldTX => {
      if(yieldTX.timestamp && yieldTX.timestamp <= yieldOverTime.timestamps[i]) {
        if((i > 0 && yieldTX.timestamp > yieldOverTime.timestamps[i - 1]) || (i === 0 && yieldTX.timestamp >= preTick)) {
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
  }

  return yieldOverTime;
}

/* ====================================================================================================================================================== */

// Function to get wallet-specific data:
const getWalletData = (chainData: ChainData) => {

  // Initializations:
  const wallets: Record<Hash, WalletData> = {};

  // Adding Data:
  chainData.balances.data.forEach(entry => {
    wallets[entry.wallet] = { txs: [], currentBalance: entry.balance };
  });
  chainData.deposits.data.forEach(deposit => {
    if(wallets[deposit.wallet] && deposit.timestamp) {
      wallets[deposit.wallet].txs.push({ type: 'deposit', data: deposit });
    }
  });
  chainData.withdrawals.data.forEach(withdrawal => {
    if(wallets[withdrawal.wallet] && withdrawal.timestamp) {
      wallets[withdrawal.wallet].txs.push({ type: 'withdrawal', data: withdrawal });
    }
  });
  chainData.claims.data.forEach(claim => {
    if(wallets[claim.wallet] && claim.timestamp) {
      wallets[claim.wallet].txs.push({ type: 'claim', data: claim });
    }
  });
  chainData.delegationsCreated.data.forEach(delegation => {
    if(wallets[delegation.delegator] && delegation.timestamp) {
      wallets[delegation.delegator].txs.push({ type: 'delegationCreated', data: delegation });
    }
  });
  chainData.delegationsFunded.data.forEach(delegation => {
    if(wallets[delegation.delegator] && delegation.timestamp) {
      wallets[delegation.delegator].txs.push({ type: 'delegationFunded', data: delegation });
    }
  });
  chainData.delegationsUpdated.data.forEach(delegation => {
    if(wallets[delegation.delegator] && delegation.timestamp) {
      wallets[delegation.delegator].txs.push({ type: 'delegationUpdated', data: delegation });
    }
  });
  chainData.delegationsWithdrawn.data.forEach(delegation => {
    if(wallets[delegation.delegator] && delegation.timestamp) {
      wallets[delegation.delegator].txs.push({ type: 'delegationWithdrawn', data: delegation });
    }
  });

  // Sorting Transactions:
  for(let stringWallet in wallets) {
    const wallet = stringWallet as Hash;
    wallets[wallet].txs.sort((a, b) => (a.data.timestamp as number) - (b.data.timestamp as number));
  }

  return wallets;
}

/* ====================================================================================================================================================== */

// Function to calculate winless withdrawals:
const calcWinlessWithdrawals = (wallets: Record<Hash, WalletData>) => {

  // Initializations:
  const winlessWithdrawals: WinlessWithdrawals[] = [];

  // Filtering Wallets:
  for(let stringWallet in wallets) {
    const wallet = stringWallet as Hash;
    const walletData = wallets[wallet];
    if(walletData.currentBalance === 0) {
      const claimTXs = walletData.txs.filter(tx => tx.type === 'claim');
      if(claimTXs.length === 0) {
        let virtualBalance = 0;
        let maxVirtualBalance = 0;
        let firstDepositTimestamp = 0;
        let lastWithdrawalTimestamp = 0;
        walletData.txs.forEach(tx => {
          if(tx.type === 'deposit') {
            virtualBalance += tx.data.amount;
            if(virtualBalance > maxVirtualBalance) {
              maxVirtualBalance = virtualBalance;
            }
            if(firstDepositTimestamp === 0 && tx.data.timestamp) {
              firstDepositTimestamp = tx.data.timestamp;
            }
          } else if(tx.type === 'withdrawal') {
            virtualBalance -= tx.data.amount;
            if(tx.data.timestamp) {
              lastWithdrawalTimestamp = tx.data.timestamp;
            }
          }
        });
        if(virtualBalance <= 0 && firstDepositTimestamp > 0 && lastWithdrawalTimestamp > 0) {
          winlessWithdrawals.push({ wallet, maxBalance: maxVirtualBalance, firstDepositTimestamp, lastWithdrawalTimestamp });
        }
      }
    }
  }

  return winlessWithdrawals;
}

/* ====================================================================================================================================================== */

// Function to calculate TVL distribution:
const calcTVLDistribution = (balances: BalanceData[]) => {

  // Initializations:
  const tvlDistribution: TVLDistribution = {
    1: { amount: 0, count: 0 },
    10: { amount: 0, count: 0 },
    100: { amount: 0, count: 0 },
    1000: { amount: 0, count: 0 },
    10000: { amount: 0, count: 0 },
    100000: { amount: 0, count: 0 },
    1000000: { amount: 0, count: 0 }
  };

  // Filtering Balances:
  balances.forEach(entry => {
    if(entry.balance >= 1) {
      if(entry.balance >= 10) {
        if(entry.balance >= 100) {
          if(entry.balance >= 1000) {
            if(entry.balance >= 10000) {
              if(entry.balance >= 100000) {
                if(entry.balance >= 1000000) {
                  tvlDistribution[1000000].amount += entry.balance;
                  tvlDistribution[1000000].count++;
                } else {
                  tvlDistribution[100000].amount += entry.balance;
                  tvlDistribution[100000].count++;
                }
              } else {
                tvlDistribution[10000].amount += entry.balance;
                tvlDistribution[10000].count++;
              }
            } else {
              tvlDistribution[1000].amount += entry.balance;
              tvlDistribution[1000].count++;
            }
          } else {
            tvlDistribution[100].amount += entry.balance;
            tvlDistribution[100].count++;
          }
        } else {
          tvlDistribution[10].amount += entry.balance;
          tvlDistribution[10].count++;
        }
      } else {
        tvlDistribution[1].amount += entry.balance;
        tvlDistribution[1].count++;
      }
    }
  });

  return tvlDistribution;
}

/* ====================================================================================================================================================== */

// Helper function to get timestamps:
const getTimestamps = (start: number, end: number) => {
  const timestamps: number[] = [];
  const timespan = end - start;
  const tick = timespan / ticks;
  let value = start;
  while(Math.ceil(value) < end) {
    value += tick;
    timestamps.push(Math.ceil(value));
  }
  return timestamps;
}