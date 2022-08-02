
// Type Imports:
import type { Chain, Hash, ChainData, DepositData, WithdrawalData, BalanceData, WalletData, DepositsOverTime, WithdrawalsOverTime, ClaimsOverTime, TVLOverTime, DelegationsOverTime, YieldOverTime, WinlessWithdrawals, MultichainDistribution, TVLDistribution, MovingUsers } from '$lib/types';

/* ====================================================================================================================================================== */

// Function to get chain name:
export const getChainName = (chain: Chain) => {
  if(chain === 'eth') {
    return 'Ethereum';
  } else if(chain === 'poly') {
    return 'Polygon';
  } else if(chain === 'avax') {
    return 'Avalanche';
  } else {
    return 'Optimism';
  }
}

/* ====================================================================================================================================================== */

// Function to get array of numbers:
export const getRangeArray = (start: number, end: number, ticks: number) => {
  const range: number[] = [];
  const tick = (end - start) / ticks;
  let value = start;
  while(value <= end) {
    value += tick;
    range.push(Math.ceil(value));
  }
  return range;
}

/* ====================================================================================================================================================== */

// Function to get timestamps:
export const getTimestamps = (chainData: ChainData, ticks: number) => {
  const firstTimestamp = chainData.deposits.data[0].timestamp as number;
  const lastTimestamp = chainData.balances.timestamp as number;
  if(ticks === 1) {
    return [firstTimestamp, lastTimestamp];
  } else {
    return getRangeArray(firstTimestamp, lastTimestamp, ticks);
  }
}

/* ====================================================================================================================================================== */

// Function to get multi-chain spanning timestamps:
export const getMultichainTimestamps = (ethData: ChainData, polyData: ChainData, avaxData: ChainData, opData: ChainData, ticks: number) => {

  // Initializations:
  const ethFirstTimestamp = ethData.deposits.data[0].timestamp as number;
  const ethLastTimestamp = ethData.balances.timestamp as number;
  const polyFirstTimestamp = polyData.deposits.data[0].timestamp as number;
  const polyLastTimestamp = polyData.balances.timestamp as number;
  const avaxFirstTimestamp = avaxData.deposits.data[0].timestamp as number;
  const avaxLastTimestamp = avaxData.balances.timestamp as number;
  const opFirstTimestamp = opData.deposits.data[0].timestamp as number;
  const opLastTimestamp = opData.balances.timestamp as number;

  // Getting Timestamps:
  const firstTimestamp = Math.min(ethFirstTimestamp, polyFirstTimestamp, avaxFirstTimestamp, opFirstTimestamp);
  const lastTimestamp = Math.max(ethLastTimestamp, polyLastTimestamp, avaxLastTimestamp, opLastTimestamp);
  return getRangeArray(firstTimestamp, lastTimestamp, ticks);
}

/* ====================================================================================================================================================== */

// Function to convert timestamps to dates:
export const timestampsToDates = (timestamps: number[]) => {
  const dates = timestamps.map(timestamp => (new Date(timestamp * 1000)).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
  return dates;
}

/* ====================================================================================================================================================== */

// Function to convert timestamp to ISO date:
export const timestampToISO = (timestamp: number) => {
  const isoDate = (new Date(timestamp * 1000)).toISOString().slice(0, 10);
  return isoDate;
}

/* ====================================================================================================================================================== */

// Function to get wallet-specific data:
export const getWalletData = (chainData: ChainData, timeFilters?: { start: number, end: number }) => {

  // Initializations:
  const wallets: Record<Hash, WalletData> = {};

  // Adding Data:
  chainData.balances.data.forEach(entry => {
    wallets[entry.wallet] = { txs: [], currentBalance: entry.balance };
  });
  chainData.deposits.data.forEach(deposit => {
    if(deposit.timestamp) {
      if(timeFilters) {
        if(deposit.timestamp > timeFilters.start && deposit.timestamp < timeFilters.end) {
          wallets[deposit.wallet].txs.push({ type: 'deposit', data: deposit });
        }
      } else {
        wallets[deposit.wallet].txs.push({ type: 'deposit', data: deposit });
      }
    }
  });
  chainData.withdrawals.data.forEach(withdrawal => {
    if(withdrawal.timestamp) {
      if(timeFilters) {
        if(withdrawal.timestamp > timeFilters.start && withdrawal.timestamp < timeFilters.end) {
          wallets[withdrawal.wallet].txs.push({ type: 'withdrawal', data: withdrawal });
        }
      } else {
        wallets[withdrawal.wallet].txs.push({ type: 'withdrawal', data: withdrawal });
      }
    }
  });
  chainData.claims.data.forEach(claim => {
    if(claim.timestamp) {
      if(timeFilters) {
        if(claim.timestamp > timeFilters.start && claim.timestamp < timeFilters.end) {
          wallets[claim.wallet].txs.push({ type: 'claim', data: claim });
        }
      } else {
        wallets[claim.wallet].txs.push({ type: 'claim', data: claim });
      }
    }
  });
  chainData.delegationsCreated.data.forEach(delegation => {
    if(wallets[delegation.delegator] && delegation.timestamp) {
      if(timeFilters) {
        if(delegation.timestamp > timeFilters.start && delegation.timestamp < timeFilters.end) {
          wallets[delegation.delegator].txs.push({ type: 'delegationCreated', data: delegation });
        }
      } else {
        wallets[delegation.delegator].txs.push({ type: 'delegationCreated', data: delegation });
      }
    }
  });
  chainData.delegationsFunded.data.forEach(delegation => {
    if(wallets[delegation.delegator] && delegation.timestamp) {
      if(timeFilters) {
        if(delegation.timestamp > timeFilters.start && delegation.timestamp < timeFilters.end) {
          wallets[delegation.delegator].txs.push({ type: 'delegationFunded', data: delegation });
        }
      } else {
        wallets[delegation.delegator].txs.push({ type: 'delegationFunded', data: delegation });
      }
    }
  });
  chainData.delegationsUpdated.data.forEach(delegation => {
    if(wallets[delegation.delegator] && delegation.timestamp) {
      if(timeFilters) {
        if(delegation.timestamp > timeFilters.start && delegation.timestamp < timeFilters.end) {
          wallets[delegation.delegator].txs.push({ type: 'delegationUpdated', data: delegation });
        }
      } else {
        wallets[delegation.delegator].txs.push({ type: 'delegationUpdated', data: delegation });
      }
    }
  });
  chainData.delegationsWithdrawn.data.forEach(delegation => {
    if(wallets[delegation.delegator] && delegation.timestamp) {
      if(timeFilters) {
        if(delegation.timestamp > timeFilters.start && delegation.timestamp < timeFilters.end) {
          wallets[delegation.delegator].txs.push({ type: 'delegationWithdrawn', data: delegation });
        }
      } else {
        wallets[delegation.delegator].txs.push({ type: 'delegationWithdrawn', data: delegation });
      }
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

// Function to get deposits over time:
export const getDepositsOverTime = (chainData: ChainData, ticks: number, customTimestamps?: number[]) => {

  // Initializations:
  const depositsOverTime: DepositsOverTime = {
    timestamps: customTimestamps ?? getTimestamps(chainData, ticks),
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
        if((i > 0 && deposit.timestamp > depositsOverTime.timestamps[i - 1]) || (i === 0 && customTimestamps === undefined)) {
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
export const getWithdrawalsOverTime = (chainData: ChainData, ticks: number, customTimestamps?: number[]) => {

  // Initializations:
  const withdrawalsOverTime: WithdrawalsOverTime = {
    timestamps: customTimestamps ?? getTimestamps(chainData, ticks),
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
        if((i > 0 && withdrawal.timestamp > withdrawalsOverTime.timestamps[i - 1]) || (i === 0 && customTimestamps === undefined)) {
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
export const getClaimsOverTime = (chainData: ChainData, ticks: number, customTimestamps?: number[]) => {

  // Initializations:
  const claimsOverTime: ClaimsOverTime = {
    timestamps: customTimestamps ?? getTimestamps(chainData, ticks),
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
        if((i > 0 && claim.timestamp > claimsOverTime.timestamps[i - 1]) || (i === 0 && customTimestamps === undefined)) {
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
export const getTVLOverTime = (deposits: DepositsOverTime, withdrawals: WithdrawalsOverTime, claims: ClaimsOverTime) => {

  // Initializations:
  const tvlOverTime: TVLOverTime = {
    timestamps: deposits.timestamps,
    tvls: []
  }

  // Calculating TVL Over Time:
  for(let i = 0; i < tvlOverTime.timestamps.length; i++) {
    tvlOverTime.tvls.push(deposits.cumulativeDepositAmounts[i] + claims.cumulativeClaimAmounts[i] - withdrawals.cumulativeWithdrawalAmounts[i]);
  }

  return tvlOverTime;
}

/* ====================================================================================================================================================== */

// Function to get TVL distribution:
export const getTVLDistribution = (balances: BalanceData[]) => {

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

// Function to get delegations over time:
export const getDelegationsOverTime = (chainData: ChainData, ticks: number, customTimestamps?: number[]) => {

  // Initializations:
  const delegationsOverTime: DelegationsOverTime = {
    timestamps: customTimestamps ?? getTimestamps(chainData, ticks),
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
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && customTimestamps === undefined)) {
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
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && customTimestamps === undefined)) {
          delegationAmount += delegation.amount;
        }
      }
    });
    chainData.delegationsWithdrawn.data.forEach(delegation => {
      if(delegation.timestamp && delegation.timestamp <= delegationsOverTime.timestamps[i]) {
        if((i > 0 && delegation.timestamp > delegationsOverTime.timestamps[i - 1]) || (i === 0 && customTimestamps === undefined)) {
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
export const getYieldOverTime = (chainData: ChainData, ticks: number, customTimestamps?: number[]) => {

  // Initializations:
  const yieldOverTime: YieldOverTime = {
    timestamps: customTimestamps ?? getTimestamps(chainData, ticks),
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
        if((i > 0 && yieldTX.timestamp > yieldOverTime.timestamps[i - 1]) || (i === 0 && customTimestamps === undefined)) {
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

// Function to get winless withdrawals:
export const getWinlessWithdrawals = (wallets: Record<Hash, WalletData>) => {

  // Initializations:
  const winlessWithdrawals: WinlessWithdrawals[] = [];

  // Filtering Wallets:
  for(let stringWallet in wallets) {
    const wallet = stringWallet as Hash;
    if(wallets[wallet].currentBalance > 0) {
      delete wallets[wallet];
    } else {
      const claimTXs = wallets[wallet].txs.filter(tx => tx.type === 'claim');
      if(claimTXs.length > 0) {
        delete wallets[wallet];
      } else {
        let virtualBalance = 0;
        let maxVirtualBalance = 0;
        let firstDepositTimestamp = 0;
        let lastWithdrawalTimestamp = 0;
        wallets[wallet].txs.forEach(tx => {
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
        if(virtualBalance > 0 || firstDepositTimestamp === 0 || lastWithdrawalTimestamp === 0) {
          delete wallets[wallet];
        } else {
          winlessWithdrawals.push({ wallet, maxBalance: maxVirtualBalance, firstDepositTimestamp, lastWithdrawalTimestamp });
        }
      }
    }
  }

  return winlessWithdrawals;
}

/* ====================================================================================================================================================== */

// Function to get multichain users' distribution:
export const getMultichainUsersDistribution = (ethBalances: BalanceData[], polyBalances: BalanceData[], avaxBalances: BalanceData[], opBalances: BalanceData[]) => {

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

// Function to get users moving to a new chain:
export const getMovingUsers = (withdrawals: WithdrawalData[], ethDeposits: DepositData[], polyDeposits: DepositData[], avaxDeposits: DepositData[], opDeposits: DepositData[], timeFilters?: { start: number, end: number }) => {

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
    if((timestamp && !uniqueWallets.includes(wallet) && !timeFilters) || (timestamp && !uniqueWallets.includes(wallet) && timeFilters && timestamp > timeFilters.start && timestamp < timeFilters.end)) {
      uniqueWallets.push(wallet);
      movingUsers.totalWithdrawn.users++;

      // Moving To Ethereum:
      let ethWalletDeposits = ethDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp && deposit.timestamp < (timeFilters?.end ?? 9_999_999_999));
      if(ethWalletDeposits.length > 0) {
        ethWalletDeposits.forEach(deposit => {
          movingUsers.movedToETH.amount += deposit.amount;
        });
        movingUsers.movedToETH.users++;
      }

      // Moving To Polygon:
      let polyWalletDeposits = polyDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp && deposit.timestamp < (timeFilters?.end ?? 9_999_999_999));
      if(polyWalletDeposits.length > 0) {
        polyWalletDeposits.forEach(deposit => {
          movingUsers.movedToPOLY.amount += deposit.amount;
        });
        movingUsers.movedToPOLY.users++;
      }

      // Moving To Avalanche:
      let avaxWalletDeposits = avaxDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp && deposit.timestamp < (timeFilters?.end ?? 9_999_999_999));
      if(avaxWalletDeposits.length > 0) {
        avaxWalletDeposits.forEach(deposit => {
          movingUsers.movedToAVAX.amount += deposit.amount;
        });
        movingUsers.movedToAVAX.users++;
      }

      // Moving To Optimism:
      let opWalletDeposits = opDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp && deposit.timestamp < (timeFilters?.end ?? 9_999_999_999));
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