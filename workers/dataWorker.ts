
// Initializations:
const defaultMaxTimestamp = 9_999_999_999;
const ticks = 50;

/* ====================================================================================================================================================== */

// Function to react to incoming messages:
onmessage = (event) => {
  if(event.data.length === 1) {
    const chainData: ChainData = event.data[0];
    const data = calculateData(chainData);
    postMessage(data);
  } else if(event.data.length === 4) {
    if(event.data[0].deposits) {
      const chainsData: ChainData[] = event.data;
      const aggregatedData = getAggregatedData(chainsData[0], chainsData[1], chainsData[2], chainsData[3]);
      postMessage(aggregatedData);
    } else {
      const chainsBalances: BalanceData[][] = event.data;
      const multichainUsersData = getMultichainUsersDistribution(chainsBalances[0], chainsBalances[1], chainsBalances[2], chainsBalances[3]);
      postMessage(multichainUsersData);
    }
  } else if(event.data.length === 5) {
    const movingUsers = getMovingUsers(event.data[0], event.data[1], event.data[2], event.data[3], event.data[4]);
    postMessage(movingUsers);
  } else {
    console.error('Invalid data sent to worker.');
  }
}

/* ====================================================================================================================================================== */

// Function to calculate extra data:
const calculateData = (chainData: ChainData) => {
  [chainData.minTimestamp, chainData.maxTimestamp] = getTimestamps(chainData, true);
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
}

/* ====================================================================================================================================================== */

// Function to get array of numbers:
const getRangeArray = (start: number, end: number) => {
  const range: number[] = [];
  const tick = (end - start) / ticks;
  let value = start;
  while(Math.ceil(value) < end) {
    value += tick;
    range.push(Math.ceil(value));
  }
  return range;
}

/* ====================================================================================================================================================== */

// Function to get timestamps:
const getTimestamps = (chainData: ChainData, simple?: boolean) => {
  const firstTimestamp = chainData.deposits.data[0].timestamp as number;
  const lastTimestamp = chainData.balances.timestamp as number;
  if(simple) {
    return [firstTimestamp, lastTimestamp];
  } else {
    return getRangeArray(firstTimestamp, lastTimestamp);
  }
}

/* ====================================================================================================================================================== */

// Function to get deposits over time:
const getDepositsOverTime = (chainData: ChainData) => {

  // Initializations:
  const depositsOverTime: DepositsOverTime = {
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
  }
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
        if((i > 0 && deposit.timestamp > depositsOverTime.timestamps[i - 1]) || i === 0) {
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

// Function to get withdrawals over time:
const getWithdrawalsOverTime = (chainData: ChainData) => {

  // Initializations:
  const withdrawalsOverTime: WithdrawalsOverTime = {
    timestamps: getTimestamps(chainData),
    withdrawalAmounts: [],
    withdrawalCounts: [],
    uniqueWallets: [],
    avgWithdrawalAmounts: [],
    cumulativeWithdrawalAmounts: [],
    cumulativeWithdrawalCounts: [],
    cumulativeUniqueWallets: []
  }
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
        if((i > 0 && withdrawal.timestamp > withdrawalsOverTime.timestamps[i - 1]) || i === 0) {
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

// Function to get claims over time:
const getClaimsOverTime = (chainData: ChainData) => {

  // Initializations:
  const claimsOverTime: ClaimsOverTime = {
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
  }
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
        if((i > 0 && claim.timestamp > claimsOverTime.timestamps[i - 1]) || i === 0) {
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

// Function to get TVL over time:
const getTVLOverTime = (deposits: DepositsOverTime, withdrawals: WithdrawalsOverTime, claims: ClaimsOverTime) => {

  // Initializations:
  const tvlOverTime: TVLOverTime = {
    timestamps: deposits.timestamps,
    tvls: []
  }

  // Calculating TVL Over Time:
  for(let i = 0; i < tvlOverTime.timestamps.length; i++) {
    const tvl = deposits.cumulativeDepositAmounts[i] + claims.cumulativeClaimAmounts[i] - withdrawals.cumulativeWithdrawalAmounts[i];
    tvlOverTime.tvls.push(tvl);
  }

  return tvlOverTime;
}

/* ====================================================================================================================================================== */

// Function to get delegations over time:
const getDelegationsOverTime = (chainData: ChainData) => {

  // Initializations:
  const delegationsOverTime: DelegationsOverTime = {
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
  }
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
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || i === 0) {
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
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || i === 0) {
          delegationAmount += delegation.amount;
        }
      }
    });
    chainData.delegationsWithdrawn.data.forEach(delegation => {
      if(delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || i === 0) {
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

// Function to get yield captures over time:
const getYieldOverTime = (chainData: ChainData) => {

  // Initializations:
  const yieldOverTime: YieldOverTime = {
    timestamps: getTimestamps(chainData),
    yieldAmounts: [],
    yieldCounts: [],
    cumulativeYieldAmounts: [],
    cumulativeYieldCounts: []
  }
  let cumulativeYieldAmount = 0;
  let cumulativeYieldCount = 0;
  
  // Filtering Data:
  for(let i = 0; i < ticks; i++) {
    let yieldAmount = 0;
    let yieldCount = 0;
    chainData.yields.data.forEach(yieldTX => {
      if(yieldTX.timestamp && yieldTX.timestamp <= yieldOverTime.timestamps[i]) {
        if((i > 0 && yieldTX.timestamp > yieldOverTime.timestamps[i - 1]) || i === 0) {
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
    if(deposit.timestamp) {
      wallets[deposit.wallet].txs.push({ type: 'deposit', data: deposit });
    }
  });
  chainData.withdrawals.data.forEach(withdrawal => {
    if(withdrawal.timestamp) {
      wallets[withdrawal.wallet].txs.push({ type: 'withdrawal', data: withdrawal });
    }
  });
  chainData.claims.data.forEach(claim => {
    if(claim.timestamp) {
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

// Function to get winless withdrawals:
const getWinlessWithdrawals = (wallets: Record<Hash, WalletData>) => {

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

// Function to get TVL distribution:
const getTVLDistribution = (balances: BalanceData[]) => {

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

// Function to get users moving to a new chain:
const getMovingUsers = (withdrawals: WithdrawalData[], ethDeposits: DepositData[], polyDeposits: DepositData[], avaxDeposits: DepositData[], opDeposits: DepositData[]) => {

  // Initializations:
  const movingUsers: MovingUsers = {
    totalWithdrawn: { amount: 0, users: 0 },
    movedToETH: { amount: 0, users: 0 },
    movedToPOLY: { amount: 0, users: 0 },
    movedToAVAX: { amount: 0, users: 0 },
    movedToOP: { amount: 0, users: 0 }
  }
  const uniqueWallets: Hash[] = [];

  // Finding Data:
  withdrawals.forEach(withdrawal => {
    const wallet = withdrawal.wallet;
    const timestamp = withdrawal.timestamp;
    if(timestamp && !uniqueWallets.includes(wallet)) {
      uniqueWallets.push(wallet);
      movingUsers.totalWithdrawn.users++;

      // Moving To Ethereum:
      let ethWalletDeposits = ethDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp);
      if(ethWalletDeposits.length > 0) {
        ethWalletDeposits.forEach(deposit => {
          movingUsers.movedToETH.amount += deposit.amount;
        });
        movingUsers.movedToETH.users++;
      }

      // Moving To Polygon:
      let polyWalletDeposits = polyDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp);
      if(polyWalletDeposits.length > 0) {
        polyWalletDeposits.forEach(deposit => {
          movingUsers.movedToPOLY.amount += deposit.amount;
        });
        movingUsers.movedToPOLY.users++;
      }

      // Moving To Avalanche:
      let avaxWalletDeposits = avaxDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp);
      if(avaxWalletDeposits.length > 0) {
        avaxWalletDeposits.forEach(deposit => {
          movingUsers.movedToAVAX.amount += deposit.amount;
        });
        movingUsers.movedToAVAX.users++;
      }

      // Moving To Optimism:
      let opWalletDeposits = opDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp);
      if(opWalletDeposits.length > 0) {
        opWalletDeposits.forEach(deposit => {
          movingUsers.movedToOP.amount += deposit.amount;
        });
        movingUsers.movedToOP.users++;
      }
    }
    movingUsers.totalWithdrawn.amount += withdrawal.amount;
  });

  return movingUsers;
}

/* ====================================================================================================================================================== */

// Function to get aggregated data:
const getAggregatedData = (ethData: ChainData, polyData: ChainData, avaxData: ChainData, opData: ChainData) => {

  // Initializations:
  const aggregatedData: AggregatedData = {
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
    minTimestamp: ethData.minTimestamp ?? 0,
    maxTimestamp: ethData.maxTimestamp ?? defaultMaxTimestamp
  }
  const chains: Chain[] = ['eth', 'poly', 'avax', 'op'];

  // Aggregating Data:
  [ethData, polyData, avaxData, opData].forEach((chainData, chainNum) => {

    // Deposits:
    chainData.deposits.data.forEach(deposit => {
      aggregatedData.deposits.data.push({ ...deposit, chain: chains[chainNum] });
    });

    // Withdrawals:
    chainData.withdrawals.data.forEach(withdrawal => {
      aggregatedData.withdrawals.data.push({ ...withdrawal, chain: chains[chainNum] });
    });

    // Claims:
    chainData.claims.data.forEach(claim => {
      aggregatedData.claims.data.push({ ...claim, chain: chains[chainNum] });
    });

    // Delegations Created:
    chainData.delegationsCreated.data.forEach(delegation => {
      aggregatedData.delegationsCreated.data.push({ ...delegation, chain: chains[chainNum] });
    });

    // Delegations Funded:
    chainData.delegationsFunded.data.forEach(delegation => {
      aggregatedData.delegationsFunded.data.push({ ...delegation, chain: chains[chainNum] });
    });

    // Delegations Updated:
    chainData.delegationsUpdated.data.forEach(delegation => {
      aggregatedData.delegationsUpdated.data.push({ ...delegation, chain: chains[chainNum] });
    });

    // Delegations Withdrawn:
    chainData.delegationsWithdrawn.data.forEach(delegation => {
      aggregatedData.delegationsWithdrawn.data.push({ ...delegation, chain: chains[chainNum] });
    });

    // Yields:
    chainData.yields.data.forEach(yieldTX => {
      aggregatedData.yields.data.push({ ...yieldTX, chain: chains[chainNum] });
    });

    // Balances:
    if(chainData.balances.timestamp && aggregatedData.balances.timestamp && chainData.balances.timestamp > aggregatedData.balances.timestamp) {
      aggregatedData.balances.timestamp = chainData.balances.timestamp;
    }
    chainData.balances.data.forEach(entry => {
      const foundEntry = aggregatedData.balances.data.find(oldEntry => oldEntry.wallet === entry.wallet);
      if(foundEntry) {
        foundEntry.balance += entry.balance;
      } else {
        aggregatedData.balances.data.push(entry);
      }
    });

    // Draws:
    if(aggregatedData.draws.data.length === 0) {
      chainData.draws.data.forEach(draw => {
        aggregatedData.draws.data.push({ draw: draw.draw, timestamp: draw.timestamp, result: [] });
      });
    }
    chainData.draws.data.forEach((draw, i) => {
      if(draw.draw === aggregatedData.draws.data[i].draw) {
        aggregatedData.draws.data[i].result.push(...draw.result.map(result => ({ ...result, chain: chains[chainNum] })));
      } else {
        console.warn('Aggregating Data Error: Draw Number Mismatch!');
      }
    });

    // Timestamps:
    if(chainData.minTimestamp && (chainData.minTimestamp < aggregatedData.minTimestamp || aggregatedData.minTimestamp === 0)) {
      aggregatedData.minTimestamp = chainData.minTimestamp;
    }
    if(chainData.maxTimestamp && (chainData.maxTimestamp > aggregatedData.maxTimestamp || aggregatedData.maxTimestamp === defaultMaxTimestamp)) {
      aggregatedData.maxTimestamp = chainData.maxTimestamp;
    }
  });

  // Sorting Data:
  aggregatedData.deposits.data.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  aggregatedData.withdrawals.data.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  aggregatedData.claims.data.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  aggregatedData.delegationsCreated.data.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  aggregatedData.delegationsFunded.data.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  aggregatedData.delegationsUpdated.data.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  aggregatedData.delegationsWithdrawn.data.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  aggregatedData.yields.data.sort((a, b) => (a.timestamp as number) - (b.timestamp as number));
  aggregatedData.balances.data.sort((a, b) => b.balance - a.balance);
  aggregatedData.draws.data.forEach(draw => {
    draw.result.sort((a, b) => b.claimable.reduce((a, b) => a + b, 0) - a.claimable.reduce((a, b) => a + b, 0));
  });

  return aggregatedData;
}

/* ====================================================================================================================================================== */

// Function to get multichain users' distribution:
const getMultichainUsersDistribution = (ethBalances: BalanceData[], polyBalances: BalanceData[], avaxBalances: BalanceData[], opBalances: BalanceData[]) => {

  // Initializations:
  const multichainDistribution: MultichainDistribution = {
    totalUsers: 0,
    oneChain: 0,
    twoChains: 0,
    threeChains: 0,
    fourChains: 0
  }
  const wallets: Record<Hash, number> = {};

  // Filtering Balances:
  ethBalances.forEach(entry => {
    if(entry.balance > 0) {
      if(wallets[entry.wallet]) {
        wallets[entry.wallet]++;
      } else {
        wallets[entry.wallet] = 1;
      }
    }
  });
  polyBalances.forEach(entry => {
    if(entry.balance > 0) {
      if(wallets[entry.wallet]) {
        wallets[entry.wallet]++;
      } else {
        wallets[entry.wallet] = 1;
      }
    }
  });
  avaxBalances.forEach(entry => {
    if(entry.balance > 0) {
      if(wallets[entry.wallet]) {
        wallets[entry.wallet]++;
      } else {
        wallets[entry.wallet] = 1;
      }
    }
  });
  opBalances.forEach(entry => {
    if(entry.balance > 0) {
      if(wallets[entry.wallet]) {
        wallets[entry.wallet]++;
      } else {
        wallets[entry.wallet] = 1;
      }
    }
  });

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

  return multichainDistribution;
}

/* ====================================================================================================================================================== */

// Chain Type:
type Chain = 'eth' | 'poly' | 'avax' | 'op';

// Hash Type:
type Hash = `0x${string}`;

// Transaction Type:
type TX = DepositTX | WithdrawalTX | ClaimTX | DelegationCreatedTX | DelegationFundedTX | DelegationUpdatedTX | DelegationWithdrawnTX;

// Chain Data Type:
interface ChainData {
  deposits: { lastQueriedBlock: number, data: DepositData[] }
  withdrawals: { lastQueriedBlock: number, data: WithdrawalData[] }
  claims: { lastQueriedBlock: number, data: ClaimData[] }
  delegationsCreated: { lastQueriedBlock: number, data: DelegationCreatedData[] }
  delegationsFunded: { lastQueriedBlock: number, data: DelegationFundedData[] }
  delegationsUpdated: { lastQueriedBlock: number, data: DelegationUpdatedData[] }
  delegationsWithdrawn: { lastQueriedBlock: number, data: DelegationWithdrawnData[] }
  yields: { lastQueriedBlock: number, data: YieldData[] }
  supply: { lastQueriedBlock: number, data: SupplyData[] }
  balances: { lastQueriedBlock: number, timestamp: number | undefined, data: BalanceData[] }
  draws: { data: DrawData[] }
  minTimestamp?: number
  maxTimestamp?: number
  depositsOverTime?: DepositsOverTime
  withdrawalsOverTime?: WithdrawalsOverTime
  claimsOverTime?: ClaimsOverTime
  tvlOverTime?: TVLOverTime
  delegationsOverTime?: DelegationsOverTime
  yieldOverTime?: YieldOverTime
  wallets?: Record<Hash, WalletData>
  winlessWithdrawals?: WinlessWithdrawals[]
  tvlDistribution?: TVLDistribution
  movingUsers?: MovingUsers
}

// Data Type Interfaces:
interface DepositData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  amount: number
}
interface WithdrawalData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  amount: number
}
interface ClaimData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  prizes: number[]
}
interface DelegationCreatedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  delegatee: Hash
}
interface DelegationFundedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  amount: number
}
interface DelegationUpdatedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  newDelegatee: Hash
}
interface DelegationWithdrawnData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  amount: number
}
interface YieldData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  amount: number
}
interface SupplyData {
  block: number
  timestamp: number | undefined
  aave: number
  tickets: number
}
interface BalanceData {
  wallet: Hash
  balance: number
}
interface DrawData {
  draw: number
  timestamp: number
  result: {
    chain?: Chain
    wallet: Hash
    claimable: number[]
    dropped: number[]
    avgBalance: number | null
  }[]
}

// Winless Withdrawals Interface:
interface WinlessWithdrawals {
  wallet: Hash
  maxBalance: number
  firstDepositTimestamp: number
  lastWithdrawalTimestamp: number
}

// Over Time Interfaces:
interface DepositsOverTime {
  timestamps: number[]
  depositAmounts: number[]
  depositCounts: number[]
  uniqueWallets: number[]
  distributions: DepositDistribution
  avgDepositAmounts: number[]
  cumulativeDepositAmounts: number[]
  cumulativeDepositCounts: number[]
  cumulativeUniqueWallets: number[]
  cumulativeDistributions: DepositDistribution
}
interface WithdrawalsOverTime {
  timestamps: number[]
  withdrawalAmounts: number[]
  withdrawalCounts: number[]
  uniqueWallets: number[]
  avgWithdrawalAmounts: number[]
  cumulativeWithdrawalAmounts: number[]
  cumulativeWithdrawalCounts: number[]
  cumulativeUniqueWallets: number[]
}
interface ClaimsOverTime {
  timestamps: number[]
  claimAmounts: number[]
  claimCounts: number[]
  prizeCounts: number[]
  uniqueWallets: number[]
  distributions: ClaimDistribution
  avgClaimAmounts: number[]
  cumulativeClaimAmounts: number[]
  cumulativeClaimCounts: number[]
  cumulativePrizeCounts: number[]
  cumulativeUniqueWallets: number[]
  cumulativeDistributions: ClaimDistribution
}
interface TVLOverTime {
  timestamps: number[]
  tvls: number[]
}
interface DelegationsOverTime {
  timestamps: number[]
  delegationAmounts: number[]
  delegationCounts: number[]
  delegationWithdrawalAmounts: number[]
  delegationWithdrawalCounts: number[]
  uniqueWallets: number[]
  avgDelegationAmounts: number[]
  cumulativeDelegationAmounts: number[]
  cumulativeDelegationCounts: number[]
  cumulativeDelegationWithdrawalAmounts: number[]
  cumulativeDelegationWithdrawalCounts: number[]
  cumulativeUniqueWallets: number[]
  tvls: number[]
}
interface YieldOverTime {
  timestamps: number[]
  yieldAmounts: number[]
  yieldCounts: number[]
  cumulativeYieldAmounts: number[]
  cumulativeYieldCounts: number[]
}

// Distribution Interfaces:
interface DepositDistribution {
  1: number[]
  10: number[]
  100: number[]
  1000: number[]
  10000: number[]
  100000: number[]
}
interface ClaimDistribution {
  1: number[]
  5: number[]
  10: number[]
  50: number[]
  100: number[]
  500: number[]
  1000: number[]
}
interface TVLDistribution {
  1: { amount: number, count: number }
  10: { amount: number, count: number }
  100: { amount: number, count: number }
  1000: { amount: number, count: number }
  10000: { amount: number, count: number }
  100000: { amount: number, count: number }
  1000000: { amount: number, count: number }
}
interface MultichainDistribution {
  totalUsers: number
  oneChain: number
  twoChains: number
  threeChains: number
  fourChains: number
}

// Wallet Data Interface:
interface WalletData {
  txs: TX[]
  currentBalance: number
}

// Transaction Interfaces:
interface DepositTX {
  chain?: Chain
  type: 'deposit'
  data: DepositData
}
interface WithdrawalTX {
  chain?: Chain
  type: 'withdrawal'
  data: WithdrawalData
}
interface ClaimTX {
  chain?: Chain
  type: 'claim'
  data: ClaimData
}
interface DelegationCreatedTX {
  chain?: Chain
  type: 'delegationCreated'
  data: DelegationCreatedData
}
interface DelegationFundedTX {
  chain?: Chain
  type: 'delegationFunded'
  data: DelegationFundedData
}
interface DelegationUpdatedTX {
  chain?: Chain
  type: 'delegationUpdated'
  data: DelegationUpdatedData
}
interface DelegationWithdrawnTX {
  chain?: Chain
  type: 'delegationWithdrawn'
  data: DelegationWithdrawnData
}

// Moving Users Interface:
interface MovingUsers {
  totalWithdrawn: { amount: number, users: number }
  movedToETH: { amount: number, users: number }
  movedToPOLY: { amount: number, users: number }
  movedToAVAX: { amount: number, users: number }
  movedToOP: { amount: number, users: number }
}

// Aggregated Data Interface:
interface AggregatedData {
  deposits: { data: (DepositData & { chain: Chain })[] }
  withdrawals: { data: (WithdrawalData & { chain: Chain })[] }
  claims: { data: (ClaimData & { chain: Chain })[] }
  delegationsCreated: { data: (DelegationCreatedData & { chain: Chain })[] }
  delegationsFunded: { data: (DelegationFundedData & { chain: Chain })[] }
  delegationsUpdated: { data: (DelegationUpdatedData & { chain: Chain })[] }
  delegationsWithdrawn: { data: (DelegationWithdrawnData & { chain: Chain })[] }
  yields: { data: (YieldData & { chain: Chain })[] }
  balances: { timestamp: number | undefined, data: BalanceData[] }
  draws: { data: DrawData[] }
  minTimestamp: number
  maxTimestamp: number
}