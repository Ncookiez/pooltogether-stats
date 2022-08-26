
// Type Imports:
import type { Chain, Hash, ChainData, DepositData, WithdrawalData, WalletData, DepositsOverTime, WithdrawalsOverTime, ClaimsOverTime, TVLOverTime, DelegationsOverTime, YieldOverTime, MovingUsers, PlayerData } from './types';

// Initializations:
const defaultMaxTimestamp = 9_999_999_999;
const dayInSeconds = 86400;

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
export const getRangeArray = (start: number, end: number, ticks: number, includeFirstValue?: boolean) => {
  const range: number[] = [];
  const timespan = end - start;
  const tick = includeFirstValue ? (timespan / ticks) + (timespan / ticks / ticks) : timespan / ticks;
  if(includeFirstValue) { range.push(Math.ceil(start)); };
  let value = start;
  while(Math.ceil(value) < end) {
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

// Function to get block explorer links:
export const getBlockExplorerLink = (chain: Chain | undefined, hash: Hash) => {
  let link = '';
  if(chain === 'eth') {
    link = hash.length === 42 ? `https://etherscan.io/address/${hash}` : `https://etherscan.io/tx/${hash}`;
  } else if(chain === 'poly') {
    link = hash.length === 42 ? `https://polygonscan.com/address/${hash}` : `https://polygonscan.com/tx/${hash}`;
  } else if(chain === 'avax') {
    link = hash.length === 42 ? `https://snowtrace.io/address/${hash}` : `https://snowtrace.io/tx/${hash}`;
  } else if(chain === 'op') {
    link = hash.length === 42 ? `https://optimistic.etherscan.io/address/${hash}` : `https://optimistic.etherscan.io/tx/${hash}`;
  }
  return link;
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
    const tvl = deposits.cumulativeDepositAmounts[i] + claims.cumulativeClaimAmounts[i] - withdrawals.cumulativeWithdrawalAmounts[i];
    tvlOverTime.tvls.push(tvl);
  }

  return tvlOverTime;
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
      let ethWalletDeposits = ethDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp && deposit.timestamp < (timeFilters?.end ?? defaultMaxTimestamp));
      if(ethWalletDeposits.length > 0) {
        ethWalletDeposits.forEach(deposit => {
          movingUsers.movedToETH.amount += deposit.amount;
        });
        movingUsers.movedToETH.users++;
      }

      // Moving To Polygon:
      let polyWalletDeposits = polyDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp && deposit.timestamp < (timeFilters?.end ?? defaultMaxTimestamp));
      if(polyWalletDeposits.length > 0) {
        polyWalletDeposits.forEach(deposit => {
          movingUsers.movedToPOLY.amount += deposit.amount;
        });
        movingUsers.movedToPOLY.users++;
      }

      // Moving To Avalanche:
      let avaxWalletDeposits = avaxDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp && deposit.timestamp < (timeFilters?.end ?? defaultMaxTimestamp));
      if(avaxWalletDeposits.length > 0) {
        avaxWalletDeposits.forEach(deposit => {
          movingUsers.movedToAVAX.amount += deposit.amount;
        });
        movingUsers.movedToAVAX.users++;
      }

      // Moving To Optimism:
      let opWalletDeposits = opDeposits.filter(deposit => deposit.wallet === wallet && deposit.timestamp && deposit.timestamp > timestamp && deposit.timestamp < (timeFilters?.end ?? defaultMaxTimestamp));
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

// Function to get multi-chain, wallet-specific data:
export const getPlayerData = (wallet: Hash | undefined, ethData: ChainData, polyData: ChainData, avaxData: ChainData, opData: ChainData, ticks: number) => {
  if(wallet && ethData?.wallets && polyData?.wallets && avaxData?.wallets && opData?.wallets) {

    // Initializations:
    const playerData: PlayerData = {
      txs: [],
      timestamps: [],
      depositsOverTime: [],
      claimsOverTime: [],
      withdrawalsOverTime: [],
      balancesOverTime: [],
      balances: { eth: 0, poly: 0, avax: 0, op: 0 }
    }
    const ethWallet: WalletData | undefined = ethData.wallets[wallet];
    const polyWallet: WalletData | undefined = polyData.wallets[wallet];
    const avaxWallet: WalletData | undefined = avaxData.wallets[wallet];
    const opWallet: WalletData | undefined = opData.wallets[wallet];
    let cumulativeDepositAmount = 0;
    let cumulativeClaimAmount = 0;
    let cumulativeWithdrawalAmount = 0;
  
    // Getting Basic Chain Data:
    if(ethWallet) {
      playerData.balances.eth = ethWallet.currentBalance;
      ethWallet.txs.forEach(tx => tx.chain = 'eth');
      playerData.txs.push(...ethWallet.txs);
    }
    if(polyWallet) {
      playerData.balances.poly = polyWallet.currentBalance;
      polyWallet.txs.forEach(tx => tx.chain = 'poly');
      playerData.txs.push(...polyWallet.txs);
    }
    if(avaxWallet) {
      playerData.balances.avax = avaxWallet.currentBalance;
      avaxWallet.txs.forEach(tx => tx.chain = 'avax');
      playerData.txs.push(...avaxWallet.txs);
    }
    if(opWallet) {
      playerData.balances.op = opWallet.currentBalance;
      opWallet.txs.forEach(tx => tx.chain = 'op');
      playerData.txs.push(...opWallet.txs);
    }

    // Filtering Delegations Created:
    const ethDelegationsCreated = ethData.delegationsCreated.data.filter(delegation => delegation.delegatee === wallet);
    const polyDelegationsCreated = polyData.delegationsCreated.data.filter(delegation => delegation.delegatee === wallet);
    const avaxDelegationsCreated = avaxData.delegationsCreated.data.filter(delegation => delegation.delegatee === wallet);
    const opDelegationsCreated = opData.delegationsCreated.data.filter(delegation => delegation.delegatee === wallet);

    // Filtering Delegations Updated:
    const ethDelegationsUpdated = ethData.delegationsUpdated.data.filter(delegation => delegation.newDelegatee === wallet);
    const polyDelegationsUpdated = polyData.delegationsUpdated.data.filter(delegation => delegation.newDelegatee === wallet);
    const avaxDelegationsUpdated = avaxData.delegationsUpdated.data.filter(delegation => delegation.newDelegatee === wallet);
    const opDelegationsUpdated = opData.delegationsUpdated.data.filter(delegation => delegation.newDelegatee === wallet);

    // Adding Any Created Delegations:
    if(ethDelegationsCreated.length > 0) {
      ethDelegationsCreated.forEach(delegation => {
        playerData.txs.push({ chain: 'eth', type: 'delegationCreated', data: delegation });
      });
    }
    if(polyDelegationsCreated.length > 0) {
      polyDelegationsCreated.forEach(delegation => {
        playerData.txs.push({ chain: 'poly', type: 'delegationCreated', data: delegation });
      });
    }
    if(avaxDelegationsCreated.length > 0) {
      avaxDelegationsCreated.forEach(delegation => {
        playerData.txs.push({ chain: 'avax', type: 'delegationCreated', data: delegation });
      });
    }
    if(opDelegationsCreated.length > 0) {
      opDelegationsCreated.forEach(delegation => {
        playerData.txs.push({ chain: 'op', type: 'delegationCreated', data: delegation });
      });
    }

    // Adding Any Updated Delegations:
    if(ethDelegationsUpdated.length > 0) {
      ethDelegationsUpdated.forEach(delegation => {
        playerData.txs.push({ chain: 'eth', type: 'delegationUpdated', data: delegation });
      });
    }
    if(polyDelegationsUpdated.length > 0) {
      polyDelegationsUpdated.forEach(delegation => {
        playerData.txs.push({ chain: 'poly', type: 'delegationUpdated', data: delegation });
      });
    }
    if(avaxDelegationsUpdated.length > 0) {
      avaxDelegationsUpdated.forEach(delegation => {
        playerData.txs.push({ chain: 'avax', type: 'delegationUpdated', data: delegation });
      });
    }
    if(opDelegationsUpdated.length > 0) {
      opDelegationsUpdated.forEach(delegation => {
        playerData.txs.push({ chain: 'op', type: 'delegationUpdated', data: delegation });
      });
    }

    if(playerData.txs.length > 0) {

      // Sorting Transactions:
      playerData.txs.sort((a, b) => (a.data.timestamp as number) - (b.data.timestamp as number));
  
      // Getting Timestamps:
      const firstTimestamp = playerData.txs[0].data.timestamp as number;
      const lastTimestamp = playerData.txs[playerData.txs.length - 1].data.timestamp as number;
      playerData.timestamps = getRangeArray(firstTimestamp, lastTimestamp, ticks, true);
  
      // Getting Data Over Time:
      for(let i = 0; i < ticks; i++) {
        let depositAmount = 0;
        let claimAmount = 0;
        let withdrawalAmount = 0;
        playerData.txs.forEach(tx => {
          if(tx.data.timestamp && tx.data.timestamp <= playerData.timestamps[i]) {
            if((1 > 0 && tx.data.timestamp > playerData.timestamps[i - 1]) || i === 0) {
              if(tx.type === 'deposit') {
                depositAmount += tx.data.amount;
              } else if(tx.type === 'claim') {
                claimAmount += tx.data.prizes.reduce((a, b) => a + b, 0);
              } else if(tx.type === 'withdrawal') {
                withdrawalAmount += tx.data.amount;
              }
            }
          }
        });
        cumulativeDepositAmount += depositAmount;
        cumulativeClaimAmount += claimAmount;
        cumulativeWithdrawalAmount += withdrawalAmount;
        playerData.depositsOverTime.push(Math.floor(cumulativeDepositAmount));
        playerData.claimsOverTime.push(Math.floor(cumulativeClaimAmount));
        playerData.withdrawalsOverTime.push(Math.floor(cumulativeWithdrawalAmount));
        playerData.balancesOverTime.push(Math.floor(cumulativeDepositAmount + cumulativeClaimAmount - cumulativeWithdrawalAmount));
      }
  
      // Re-Sorting Transactions:
      playerData.txs.sort((a, b) => (b.data.timestamp as number) - (a.data.timestamp as number));
    }

    return playerData;
  }
}

/* ====================================================================================================================================================== */

// Function to get 'time ago' string:
export const getTimeDisplay = (timestamp: number, shorten?: boolean) => {
  const now = Date.now() / 1000;
  const secondsSinceEvent = now - timestamp;
  if(secondsSinceEvent > 0) {
    if(secondsSinceEvent < dayInSeconds) {
      if(secondsSinceEvent >= dayInSeconds / 24) {
        const hours = Math.floor(secondsSinceEvent / (dayInSeconds / 24));
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if(secondsSinceEvent >= dayInSeconds / 24 / 60) {
        const mins = Math.floor(secondsSinceEvent / (dayInSeconds / 24 / 60));
        return `${mins} minute${mins > 1 ? 's' : ''} ago`;
      } else {
        const secs = Math.floor(secondsSinceEvent / (dayInSeconds / 24 / 60 / 60));
        return `${secs} second${secs > 1 ? 's' : ''} ago`;
      }
    } else {
      const date = new Date(timestamp * 1000);
      const currentYear = (new Date(now * 1000)).getFullYear();
      if(currentYear === date.getFullYear()) {
        return (shorten ? '' : 'on ') + date.toLocaleString(undefined, {month: 'short', day: 'numeric'});
      } else {
        return (shorten ? '' : 'on ') + date.toLocaleString(undefined, {month: 'short', day: 'numeric', year: 'numeric'});
      }
    }
  } else {
    return '?';
  }
}

/* ====================================================================================================================================================== */

// Function to get shortened wallet string:
export const getShortWallet = (address: string) => {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}