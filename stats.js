
// Imports:
import { writeJSON, readJSON, getRangeArray } from "./functions.js";

/* ====================================================================================================================================================== */

// JSON Files:
const ethDeposits = readJSON('eth/deposits');
const ethWithdrawals = readJSON('eth/withdrawals');
const ethClaims = readJSON('eth/claims');
const ethDelegationsCreated = readJSON('eth/delegationsCreated');
const ethDelegationsFunded = readJSON('eth/delegationsFunded');
const ethDelegationsWithdrawn = readJSON('eth/delegationsWithdrawn');
const ethWallets = readJSON('eth/wallets');
const ethYieldCaptures = readJSON('eth/yieldCaptures');
const polyDeposits = readJSON('poly/deposits');
const polyWithdrawals = readJSON('poly/withdrawals');
const polyClaims = readJSON('poly/claims');
const polyDelegationsCreated = readJSON('poly/delegationsCreated');
const polyDelegationsFunded = readJSON('poly/delegationsFunded');
const polyDelegationsWithdrawn = readJSON('poly/delegationsWithdrawn');
const polyWallets = readJSON('poly/wallets');
const polyYieldCaptures = readJSON('poly/yieldCaptures');
const avaxDeposits = readJSON('avax/deposits');
const avaxWithdrawals = readJSON('avax/withdrawals');
const avaxClaims = readJSON('avax/claims');
const avaxDelegationsCreated = readJSON('avax/delegationsCreated');
const avaxDelegationsFunded = readJSON('avax/delegationsFunded');
const avaxDelegationsWithdrawn = readJSON('avax/delegationsWithdrawn');
const avaxWallets = readJSON('avax/wallets');
const avaxYieldCaptures = readJSON('avax/yieldCaptures');
const opDeposits = readJSON('op/deposits');
const opWithdrawals = readJSON('op/withdrawals');
const opClaims = readJSON('op/claims');
const opDelegationsCreated = readJSON('op/delegationsCreated');
const opDelegationsFunded = readJSON('op/delegationsFunded');
const opDelegationsWithdrawn = readJSON('op/delegationsWithdrawn');
const opWallets = readJSON('op/wallets');
const opYieldCaptures = readJSON('op/yieldCaptures');
const snapshot = readJSON('snapshot')[0];

// Starting Block Timestamps:
const ethStart = { block: 13419900, timestamp: 1634263391 };
const polyStart = { block: 20226700, timestamp: 1634256864 };
const avaxStart = { block: 8501200, timestamp: 1640037507 };
const opStart = { block: 14043015, timestamp: 1657231225 };

// Settings:
const tickCount = 50;
const estimatedEthBlockTime = 13;
const estimatedPolyBlockTime = 2.2;
const estimatedAvaxBlockTime = 2;
const estimatedOpBlockTime = 1;

/* ====================================================================================================================================================== */

// Function to execute stats' calculations:
const calcStats = () => {

  // Chains:
  const chains = [
    'eth',
    'poly',
    'avax',
    'op'
  ];

  // Stats:
  console.log('# Calculating Stats');
  for(let chain of chains) {
    
    // Basic Stats Over Time:
    calcDepositsOverTime(chain);
    calcWithdrawalsOverTime(chain);
    calcClaimsOverTime(chain);
    calcDelegationsOverTime(chain);
    calcWalletsOverTime(chain);
    calcYieldOverTime(chain);

    // Other Interesting Stats:
    findWinlessWithdrawals(chain);
    findDepositAmountDistributions(chain);
    findClaimAmountDistributions(chain);
    findAverageClaimTime(chain);
    findConfidentUsers(chain);
    findMultichainUsers(chain);
    findMovingUsers(chain);
    
  }
}

/* ====================================================================================================================================================== */

// Function to calculate deposits over time:
const calcDepositsOverTime = (chain) => {

  // Initializations:
  const fileName = `${chain}/depositsOverTime`;
  let deposits;
  let start;
  let endBlock;
  let blocks = [];
  let depositsOverTime = {
    timestamps: [],
    depositAmounts: [],
    depositCounts: [],
    avgDepositAmounts: [],
    cumulativeDepositAmounts: [],
    cumulativeDepositCounts: []
  }

  // Selecting Data:
  if(chain === 'eth') {
    deposits = ethDeposits;
    start = ethStart;
    endBlock = snapshot.ethBlock;
  } else if(chain === 'poly') {
    deposits = polyDeposits;
    start = polyStart;
    endBlock = snapshot.polyBlock;
  } else if(chain === 'avax') {
    deposits = avaxDeposits;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
  } else {
    deposits = opDeposits;
    start = opStart;
    endBlock = snapshot.opBlock;
  }

  // Setting Arrays:
  blocks = getRangeArray(start.block, endBlock, tickCount);
  depositsOverTime.timestamps = getRangeArray(start.timestamp, snapshot.timestamp, tickCount);

  // Filtering Data:
  let cumulativeDepositAmount = 0;
  let cumulativeDepositCount = 0;
  for(let i = 0; i < tickCount; i++) {
    let depositAmount = 0;
    let depositCount = 0;
    deposits.forEach(deposit => {
      if(deposit.block <= blocks[i]) {
        if((i > 0 && deposit.block > blocks[i - 1]) || i === 0) {
          depositAmount += deposit.amount;
          depositCount++;
        }
      }
    });
    cumulativeDepositAmount += depositAmount;
    cumulativeDepositCount += depositCount;
    depositsOverTime.depositAmounts.push(Math.floor(depositAmount));
    depositsOverTime.depositCounts.push(depositCount);
    depositsOverTime.avgDepositAmounts.push(depositCount > 0 ? Math.floor(depositAmount / depositCount) : 0);
    depositsOverTime.cumulativeDepositAmounts.push(Math.floor(cumulativeDepositAmount));
    depositsOverTime.cumulativeDepositCounts.push(cumulativeDepositCount);
  }

  // Saving Data:
  writeJSON([depositsOverTime], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to calculate withdrawals over time:
const calcWithdrawalsOverTime = (chain) => {

  // Initializations:
  const fileName = `${chain}/withdrawalsOverTime`;
  let withdrawals;
  let start;
  let endBlock;
  let blocks = [];
  let withdrawalsOverTime = {
    timestamps: [],
    withdrawalAmounts: [],
    withdrawalCounts: [],
    avgWithdrawalAmounts: [],
    cumulativeWithdrawalAmounts: [],
    cumulativeWithdrawalCounts: []
  }

  // Selecting Data:
  if(chain === 'eth') {
    withdrawals = ethWithdrawals;
    start = ethStart;
    endBlock = snapshot.ethBlock;
  } else if(chain === 'poly') {
    withdrawals = polyWithdrawals;
    start = polyStart;
    endBlock = snapshot.polyBlock;
  } else if(chain === 'avax') {
    withdrawals = avaxWithdrawals;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
  } else {
    withdrawals = opWithdrawals;
    start = opStart;
    endBlock = snapshot.opBlock;
  }

  // Setting Arrays:
  blocks = getRangeArray(start.block, endBlock, tickCount);
  withdrawalsOverTime.timestamps = getRangeArray(start.timestamp, snapshot.timestamp, tickCount);

  // Filtering Data:
  let cumulativeWithdrawalAmount = 0;
  let cumulativeWithdrawalCount = 0;
  for(let i = 0; i < tickCount; i++) {
    let withdrawalAmount = 0;
    let withdrawalCount = 0;
    withdrawals.forEach(withdrawal => {
      if(withdrawal.block <= blocks[i]) {
        if((i > 0 && withdrawal.block > blocks[i - 1]) || i === 0) {
          withdrawalAmount += withdrawal.amount;
          withdrawalCount++;
        }
      }
    });
    cumulativeWithdrawalAmount += withdrawalAmount;
    cumulativeWithdrawalCount += withdrawalCount;
    withdrawalsOverTime.withdrawalAmounts.push(Math.floor(withdrawalAmount));
    withdrawalsOverTime.withdrawalCounts.push(withdrawalCount);
    withdrawalsOverTime.avgWithdrawalAmounts.push(withdrawalCount > 0 ? Math.floor(withdrawalAmount / withdrawalCount) : 0);
    withdrawalsOverTime.cumulativeWithdrawalAmounts.push(Math.floor(cumulativeWithdrawalAmount));
    withdrawalsOverTime.cumulativeWithdrawalCounts.push(cumulativeWithdrawalCount);
  }

  // Saving Data:
  writeJSON([withdrawalsOverTime], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to calculate claims over time:
const calcClaimsOverTime = (chain) => {

  // Initializations:
  const fileName = `${chain}/claimsOverTime`;
  let claims;
  let start;
  let endBlock;
  let blocks = [];
  let claimsOverTime = {
    timestamps: [],
    claimAmounts: [],
    claimCounts: [],
    prizeCounts: [],
    avgClaimAmounts: [],
    cumulativeClaimAmounts: [],
    cumulativeClaimCounts: [],
    cumulativePrizeCounts: []
  }

  // Selecting Data:
  if(chain === 'eth') {
    claims = ethClaims;
    start = ethStart;
    endBlock = snapshot.ethBlock;
  } else if(chain === 'poly') {
    claims = polyClaims;
    start = polyStart;
    endBlock = snapshot.polyBlock;
  } else if(chain === 'avax') {
    claims = avaxClaims;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
  } else {
    claims = opClaims;
    start = opStart;
    endBlock = snapshot.opBlock;
  }

  // Setting Arrays:
  blocks = getRangeArray(start.block, endBlock, tickCount);
  claimsOverTime.timestamps = getRangeArray(start.timestamp, snapshot.timestamp, tickCount);

  // Filtering Data:
  let cumulativeClaimAmount = 0;
  let cumulativeClaimCount = 0;
  let cumulativePrizeCount = 0;
  for(let i = 0; i < tickCount; i++) {
    let claimAmount = 0;
    let claimCount = 0;
    let prizeCount = 0;
    claims.forEach(claim => {
      if(claim.block <= blocks[i]) {
        if((i > 0 && claim.block > blocks[i - 1]) || i === 0) {
          claimAmount += claim.prizes.reduce((a, b) => a + b, 0);
          claimCount++;
          prizeCount += claim.prizes.length;
        }
      }
    });
    cumulativeClaimAmount += claimAmount;
    cumulativeClaimCount += claimCount;
    cumulativePrizeCount += prizeCount;
    claimsOverTime.claimAmounts.push(Math.floor(claimAmount));
    claimsOverTime.claimCounts.push(claimCount);
    claimsOverTime.prizeCounts.push(prizeCount);
    claimsOverTime.avgClaimAmounts.push(claimCount > 0 ? Math.floor(claimAmount / claimCount) : 0);
    claimsOverTime.cumulativeClaimAmounts.push(Math.floor(cumulativeClaimAmount));
    claimsOverTime.cumulativeClaimCounts.push(cumulativeClaimCount);
    claimsOverTime.cumulativePrizeCounts.push(cumulativePrizeCount);
  }

  // Saving Data:
  writeJSON([claimsOverTime], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to calculate delegations over time:
const calcDelegationsOverTime = (chain) => {

  // Initializations:
  const fileName = `${chain}/delegationsOverTime`;
  let delegationsCreated;
  let delegationsFunded;
  let delegationsWithdrawn;
  let start;
  let endBlock;
  let blocks = [];
  let delegationsOverTime = {
    timestamps: [],
    delegationAmounts: [],
    delegationCounts: [],
    delegationWithdrawalAmounts: [],
    delegationWithdrawalCounts: [],
    avgDelegationAmounts: [],
    cumulativeDelegationAmounts: [],
    cumulativeDelegationCounts: [],
    cumulativeDelegationWithdrawalAmounts: [],
    cumulativeDelegationWithdrawalCounts: []
  }

  // Selecting Data:
  if(chain === 'eth') {
    delegationsCreated = ethDelegationsCreated;
    delegationsFunded = ethDelegationsFunded;
    delegationsWithdrawn = ethDelegationsWithdrawn;
    start = ethStart;
    endBlock = snapshot.ethBlock;
  } else if(chain === 'poly') {
    delegationsCreated = polyDelegationsCreated;
    delegationsFunded = polyDelegationsFunded;
    delegationsWithdrawn = polyDelegationsWithdrawn;
    start = polyStart;
    endBlock = snapshot.polyBlock;
  } else if(chain === 'avax') {
    delegationsCreated = avaxDelegationsCreated;
    delegationsFunded = avaxDelegationsFunded;
    delegationsWithdrawn = avaxDelegationsWithdrawn;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
  } else {
    delegationsCreated = opDelegationsCreated;
    delegationsFunded = opDelegationsFunded;
    delegationsWithdrawn = opDelegationsWithdrawn;
    start = opStart;
    endBlock = snapshot.opBlock;
  }

  // Setting Arrays:
  blocks = getRangeArray(start.block, endBlock, tickCount);
  delegationsOverTime.timestamps = getRangeArray(start.timestamp, snapshot.timestamp, tickCount);

  // Filtering Data:
  let cumulativeDelegationAmount = 0;
  let cumulativeDelegationCount = 0;
  let cumulativeDelegationWithdrawalAmount = 0;
  let cumulativeDelegationWithdrawalCount = 0;
  for(let i = 0; i < tickCount; i++) {
    let delegationAmount = 0;
    let delegationCount = 0;
    let delegationWithdrawalAmount = 0;
    let delegationWithdrawalCount = 0;
    delegationsCreated.forEach(delegation => {
      if(delegation.block <= blocks[i]) {
        if((i > 0 && delegation.block > blocks[i - 1]) || i === 0) {
          delegationCount++;
        }
      }
    });
    delegationsFunded.forEach(delegation => {
      if(delegation.block <= blocks[i]) {
        if((i > 0 && delegation.block > blocks[i - 1]) || i === 0) {
          delegationAmount += delegation.amount;
        }
      }
    });
    delegationsWithdrawn.forEach(delegation => {
      if(delegation.block <= blocks[i]) {
        if((i > 0 && delegation.block > blocks[i - 1]) || i === 0) {
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
    delegationsOverTime.avgDelegationAmounts.push(delegationCount > 0 ? Math.floor(delegationAmount / delegationCount) : 0);
    delegationsOverTime.cumulativeDelegationAmounts.push(Math.floor(cumulativeDelegationAmount));
    delegationsOverTime.cumulativeDelegationCounts.push(cumulativeDelegationCount);
    delegationsOverTime.cumulativeDelegationWithdrawalAmounts.push(Math.floor(cumulativeDelegationWithdrawalAmount));
    delegationsOverTime.cumulativeDelegationWithdrawalCounts.push(cumulativeDelegationWithdrawalCount);
  }

  // Saving Data:
  writeJSON([delegationsOverTime], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to calculate unique new wallets over time:
const calcWalletsOverTime = (chain) => {

  // Initializations:
  const fileName = `${chain}/walletsOverTime`;
  let deposits;
  let start;
  let endBlock;
  let blocks = [];
  let allWallets = [];
  let walletsOverTime = {
    timestamps: [],
    walletCounts: [],
    cumulativeWalletCounts: []
  }

  // Selecting Data:
  if(chain === 'eth') {
    deposits = ethDeposits;
    start = ethStart;
    endBlock = snapshot.ethBlock;
  } else if(chain === 'poly') {
    deposits = polyDeposits;
    start = polyStart;
    endBlock = snapshot.polyBlock;
  } else if(chain === 'avax') {
    deposits = avaxDeposits;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
  } else {
    deposits = opDeposits;
    start = opStart;
    endBlock = snapshot.opBlock;
  }

  // Setting Arrays:
  blocks = getRangeArray(start.block, endBlock, tickCount);
  walletsOverTime.timestamps = getRangeArray(start.timestamp, snapshot.timestamp, tickCount);

  // Filtering Data:
  for(let i = 0; i < tickCount; i++) {
    let wallets = [];
    deposits.forEach(deposit => {
      if(deposit.block <= blocks[i]) {
        if((i > 0 && deposit.block > blocks[i - 1]) || i === 0) {
          if(!allWallets.includes(deposit.wallet)) {
            wallets.push(deposit.wallet);
            allWallets.push(deposit.wallet);
          }
        }
      }
    });
    walletsOverTime.walletCounts.push(wallets.length);
    walletsOverTime.cumulativeWalletCounts.push(allWallets.length);
  }

  // Saving Data:
  writeJSON([walletsOverTime], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to calculate yield captures over time:
const calcYieldOverTime = (chain) => {

  // Initializations:
  const fileName = `${chain}/yieldOverTime`;
  let yieldCaptures;
  let start;
  let endBlock;
  let blocks = [];
  let yieldOverTime = {
    timestamps: [],
    yieldAmounts: [],
    yieldCounts: [],
    cumulativeYieldAmounts: [],
    cumulativeYieldCounts: []
  }

  // Selecting Data:
  if(chain === 'eth') {
    yieldCaptures = ethYieldCaptures;
    start = ethStart;
    endBlock = snapshot.ethBlock;
  } else if(chain === 'poly') {
    yieldCaptures = polyYieldCaptures;
    start = polyStart;
    endBlock = snapshot.polyBlock;
  } else if(chain === 'avax') {
    yieldCaptures = avaxYieldCaptures;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
  } else {
    yieldCaptures = opYieldCaptures;
    start = opStart;
    endBlock = snapshot.opBlock;
  }

  // Setting Arrays:
  blocks = getRangeArray(start.block, endBlock, tickCount);
  yieldOverTime.timestamps = getRangeArray(start.timestamp, snapshot.timestamp, tickCount);

  // Filtering Data:
  let cumulativeYieldAmount = 0;
  let cumulativeYieldCount = 0;
  for(let i = 0; i < tickCount; i++) {
    let yieldAmount = 0;
    let yieldCount = 0;
    yieldCaptures.forEach(capture => {
      if(capture.block <= blocks[i]) {
        if((i > 0 && capture.block > blocks[i - 1]) || i === 0) {
          yieldAmount += capture.yield;
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

  // Saving Data:
  writeJSON([yieldOverTime], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to find users that withdrew without winning any prizes:
const findWinlessWithdrawals = (chain) => {

  // Initializations:
  const fileName = `${chain}/winlessWithdrawals`;
  let wallets;
  let users = [];
  let blocksDeposited = [];
  let winlessWithrawals = {
    totalCount: 0,
    estimatedBlockTime: 0,
    avgBlocksDeposited: 0,
    avgTimeDepositedInSeconds: 0,
    avgTimeDepositedInDays: 0
  }

  // Selecting Data:
  if(chain === 'eth') {
    wallets = ethWallets;
    winlessWithrawals.estimatedBlockTime = estimatedEthBlockTime;
  } else if(chain === 'poly') {
    wallets = polyWallets;
    winlessWithrawals.estimatedBlockTime = estimatedPolyBlockTime;
  } else if(chain === 'avax') {
    wallets = avaxWallets;
    winlessWithrawals.estimatedBlockTime = estimatedAvaxBlockTime;
  } else {
    wallets = opWallets;
    winlessWithrawals.estimatedBlockTime = estimatedOpBlockTime;
  }

  // Finding Users:
  wallets.forEach(wallet => {
    if(wallet.balance === 0 && wallet.claims.length === 0 && wallet.deposits.length > 0) {
      let txs = [];
      let virtualBalance = 0;
      wallet.deposits.forEach(tx => {
        tx.type = 'deposit';
        txs.push(tx);
        virtualBalance += tx.amount;
      });
      wallet.withdrawals.forEach(tx => {
        tx.type = 'withdrawal';
        txs.push(tx);
        virtualBalance -= tx.amount;
      });
      if(virtualBalance <= 0) {
        txs.sort((a, b) => a.block - b.block);
        users.push({ txs });
      }
    }
  });
  winlessWithrawals.totalCount = users.length;

  // Calculating Average Time Deposited:
  users.forEach(user => {
    let firstDeposit = user.txs.find(tx => tx.type === 'deposit');
    let lastWithdrawal = user.txs.slice().reverse().find(tx => tx.type === 'withdrawal');
    blocksDeposited.push(lastWithdrawal.block - firstDeposit.block);
  });
  winlessWithrawals.avgBlocksDeposited = Math.ceil((blocksDeposited.reduce((a, b) => a + b, 0) / blocksDeposited.length));
  winlessWithrawals.avgTimeDepositedInSeconds = Math.ceil(winlessWithrawals.avgBlocksDeposited * winlessWithrawals.estimatedBlockTime);
  winlessWithrawals.avgTimeDepositedInDays = Math.ceil(winlessWithrawals.avgTimeDepositedInSeconds / 60 / 60 / 24);

  // Saving Data:
  writeJSON([winlessWithrawals], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to find total deposit amount distributions:
const findDepositAmountDistributions = (chain) => {

  // Initializations:
  const fileName = `${chain}/depositDistributions`;
  let deposits;
  let totalDeposits = {
    below10: 0,
    below100: 0,
    below500: 0,
    below1000: 0,
    below5000: 0,
    below50000: 0,
    above50000: 0
  }

  // Selecting Data:
  if(chain === 'eth') {
    deposits = ethDeposits;
  } else if(chain === 'poly') {
    deposits = polyDeposits;
  } else if(chain === 'avax') {
    deposits = avaxDeposits;
  } else {
    deposits = opDeposits;
  }

  // Finding Users:
  deposits.forEach(deposit => {
    if(deposit.amount <= 10) {
      totalDeposits.below10++;
    } else if(deposit.amount <= 100) {
      totalDeposits.below100++;
    } else if(deposit.amount <= 500) {
      totalDeposits.below500++;
    } else if(deposit.amount <= 1000) {
      totalDeposits.below1000++;
    } else if(deposit.amount <= 5000) {
      totalDeposits.below5000++;
    } else if(deposit.amount <= 50000) {
      totalDeposits.below50000++;
    } else {
      totalDeposits.above50000++;
    }
  });

  // Saving Data:
  writeJSON([totalDeposits], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to find total claim amount distributions:
const findClaimAmountDistributions = (chain) => {

  // Initializations:
  const fileName = `${chain}/claimDistributions`;
  let claims;
  let totalClaims = {
    below5: 0,
    below10: 0,
    below50: 0,
    below100: 0,
    below500: 0,
    below1000: 0,
    above1000: 0
  }

  // Selecting Data:
  if(chain === 'eth') {
    claims = ethClaims;
  } else if(chain === 'poly') {
    claims = polyClaims;
  } else if(chain === 'avax') {
    claims = avaxClaims;
  } else {
    claims = opClaims;
  }

  // Finding Users:
  claims.forEach(claim => {
    let totalClaim = claim.prizes.reduce((a, b) => a + b, 0);
    if(totalClaim <= 5) {
      totalClaims.below5++;
    } else if(totalClaim <= 10) {
      totalClaims.below10++;
    } else if(totalClaim <= 50) {
      totalClaims.below50++;
    } else if(totalClaim <= 100) {
      totalClaims.below100++;
    } else if(totalClaim <= 500) {
      totalClaims.below500++;
    } else if(totalClaim <= 1000) {
      totalClaims.below1000++;
    } else {
      totalClaims.above1000++;
    }
  });

  // Saving Data:
  writeJSON([totalClaims], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to find average time between first deposit and first claim:
const findAverageClaimTime = (chain) => {

  // Initializations:
  const fileName = `${chain}/avgClaimTime`;
  let wallets;
  let estimatedBlockTime;
  let claimTimes = [];

  // Selecting Data:
  if(chain === 'eth') {
    wallets = ethWallets;
    estimatedBlockTime = estimatedEthBlockTime;
  } else if(chain === 'poly') {
    wallets = polyWallets;
    estimatedBlockTime = estimatedPolyBlockTime;
  } else if(chain === 'avax') {
    wallets = avaxWallets;
    estimatedBlockTime = estimatedAvaxBlockTime;
  } else {
    wallets = opWallets;
    estimatedBlockTime = estimatedOpBlockTime;
  }

  // Finding Users:
  wallets.forEach(wallet => {
    if(wallet.claims.length > 0 && wallet.deposits.length > 0) {
      let claimTime = wallet.claims[0].block - wallet.deposits[0].block;
      claimTimes.push(claimTime);
    }
  });

  // Calculating Average Claim Time:
  let avgBlocks = Math.ceil((claimTimes.reduce((a, b) => a + b, 0) / claimTimes.length));
  let avgClaimTimeInSeconds = Math.ceil(avgBlocks * estimatedBlockTime);
  let avgClaimTimeInDays = Math.ceil(avgClaimTimeInSeconds / 60 / 60 / 24);

  // Saving Data:
  writeJSON([{ avgBlocks, estimatedBlockTime, avgClaimTimeInSeconds, avgClaimTimeInDays }], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to find users with small deposits that later deposit more:
const findConfidentUsers = (chain) => {
  
  // Initializations:
  const fileName = `${chain}/confidentUsers`;
  const amountBarrier = 100;
  let wallets;
  let blocksBetweenDeposits = [];
  let confidentUsers = {
    totalCount: 0,
    withClaim: 0,
    estimatedBlockTime: 0,
    avgBlocks: 0,
    avgTimeInSeconds: 0,
    avgTimeInDays: 0
  };

  // Selecting Data:
  if(chain === 'eth') {
    wallets = ethWallets;
    confidentUsers.estimatedBlockTime = estimatedEthBlockTime;
  } else if(chain === 'poly') {
    wallets = polyWallets;
    confidentUsers.estimatedBlockTime = estimatedPolyBlockTime;
  } else if(chain === 'avax') {
    wallets = avaxWallets;
    confidentUsers.estimatedBlockTime = estimatedAvaxBlockTime;
  } else {
    wallets = opWallets;
    confidentUsers.estimatedBlockTime = estimatedOpBlockTime;
  }

  // Finding Users:
  wallets.forEach(wallet => {
    if(wallet.deposits.length > 1) {
      if(wallet.deposits[0].amount <= amountBarrier && wallet.deposits[1].amount > amountBarrier) {
        let blocks = wallet.deposits[1].block - wallet.deposits[0].block;
        if(blocks > ((24 * 60 * 60) / confidentUsers.estimatedBlockTime)) {
          confidentUsers.totalCount++;
          if(wallet.claims.length > 0) {
            let claim = wallet.claims.find(claim => claim.block > wallet.deposits[0].block && claim.block < wallet.deposits[1].block);
            if(claim) {
              confidentUsers.withClaim++;
            }
          }
          blocksBetweenDeposits.push(blocks);
        }
      }
    }
  });

  // Calculating Average Time Between Deposits:
  confidentUsers.avgBlocks = Math.ceil((blocksBetweenDeposits.reduce((a, b) => a + b, 0) / blocksBetweenDeposits.length));
  confidentUsers.avgTimeInSeconds = Math.ceil(confidentUsers.avgBlocks * confidentUsers.estimatedBlockTime);
  confidentUsers.avgTimeInDays = Math.ceil(confidentUsers.avgTimeInSeconds / 60 / 60 / 24);

  // Saving Data:
  writeJSON([confidentUsers], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to find users deposited in multiple chains:
const findMultichainUsers = (chain) => {

  // Initializations:
  const fileName = `${chain}/multichainUsers`;
  let wallets;
  let wallets2;
  let wallets3;
  let wallets4;
  let chainDepositPercentages = [];
  let multichainUsers = {
    oneChain: 0,
    twoChains: 0,
    threeChains: 0,
    fourChains: 0,
    avgChainDepositPercentage: 0
  }

  // Selecting Data:
  if(chain === 'eth') {
    wallets = ethWallets;
    wallets2 = polyWallets;
    wallets3 = avaxWallets;
    wallets4 = opWallets;
  } else if(chain === 'poly') {
    wallets = polyWallets;
    wallets2 = ethWallets;
    wallets3 = avaxWallets;
    wallets4 = opWallets;
  } else if(chain === 'avax') {
    wallets = avaxWallets;
    wallets2 = ethWallets;
    wallets3 = polyWallets;
    wallets4 = opWallets;
  } else {
    wallets = opWallets;
    wallets2 = ethWallets;
    wallets3 = polyWallets;
    wallets4 = avaxWallets;
  }

  // Finding Multichain Users:
  wallets.forEach(wallet => {
    if(wallet.balance > 0) {
      let balances = [wallet.balance];
      let wallet2 = wallets2.find(otherWallet => otherWallet.address === wallet.address);
      if(wallet2 && wallet2.balance > 0) {
        balances.push(wallet2.balance);
      }
      let wallet3 = wallets3.find(otherWallet => otherWallet.address === wallet.address);
      if(wallet3 && wallet3.balance > 0) {
        balances.push(wallet3.balance);
      }
      let wallet4 = wallets4.find(otherWallet => otherWallet.address === wallet.address);
      if(wallet4 && wallet4.balance > 0) {
        balances.push(wallet4.balance);
      }
      if(balances.length === 1) {
        multichainUsers.oneChain++;
      } else {
        if(balances.length === 2) {
          multichainUsers.twoChains++;
        } else if(balances.length === 3) {
          multichainUsers.threeChains++;
        } else if(balances.length === 4) {
          multichainUsers.fourChains++;
        }
        let totalBalance = balances.reduce((a, b) => a + b, 0);
        chainDepositPercentages.push((wallet.balance / totalBalance) * 100);
      }
    }
  });
  
  // Calculating Average Deposit Percentage On Main Chain:
  multichainUsers.avgChainDepositPercentage = chainDepositPercentages.reduce((a, b) => a + b, 0) / chainDepositPercentages.length;

  // Saving Data:
  writeJSON([multichainUsers], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to find users that withdrew from one chain to deposit in another:
const findMovingUsers = (chain) => {

  // Initializations:
  const fileName = `${chain}/movingUsers`;
  let wallets;
  let startBlock;
  let endBlock;
  let wallets2;
  let startBlock2;
  let endBlock2;
  let wallets3;
  let startBlock3;
  let endBlock3;
  let wallets4;
  let startBlock4;
  let endBlock4;
  let destinations = {
    chain2: 0,
    chain3: 0,
    chain4: 0
  }
  let movingUsers = {
    totalWithdrawingUsers: 0,
    movingUserCount: 0,
    topDestination: ''
  }

  // Selecting Data:
  if(chain === 'eth') {
    wallets = ethWallets;
    startBlock = ethStart.block;
    endBlock = snapshot.ethBlock;
    wallets2 = polyWallets;
    startBlock2 = polyStart.block;
    endBlock2 = snapshot.polyBlock;
    wallets3 = avaxWallets;
    startBlock3 = avaxStart.block;
    endBlock3 = snapshot.avaxBlock;
    wallets4 = opWallets;
    startBlock4 = opStart.block;
    endBlock4 = snapshot.opBlock;
  } else if(chain === 'poly') {
    wallets = polyWallets;
    startBlock = polyStart.block;
    endBlock = snapshot.polyBlock;
    wallets2 = ethWallets;
    startBlock2 = ethStart.block;
    endBlock2 = snapshot.ethBlock;
    wallets3 = avaxWallets;
    startBlock3 = avaxStart.block;
    endBlock3 = snapshot.avaxBlock;
    wallets4 = opWallets;
    startBlock4 = opStart.block;
    endBlock4 = snapshot.opBlock;
  } else if(chain === 'avax') {
    wallets = avaxWallets;
    startBlock = avaxStart.block;
    endBlock = snapshot.avaxBlock;
    wallets2 = ethWallets;
    startBlock2 = ethStart.block;
    endBlock2 = snapshot.ethBlock;
    wallets3 = polyWallets;
    startBlock3 = polyStart.block;
    endBlock3 = snapshot.polyBlock;
    wallets4 = opWallets;
    startBlock4 = opStart.block;
    endBlock4 = snapshot.opBlock;
  } else {
    wallets = opWallets;
    startBlock = opStart.block;
    endBlock = snapshot.opBlock;
    wallets2 = ethWallets;
    startBlock2 = ethStart.block;
    endBlock2 = snapshot.ethBlock;
    wallets3 = polyWallets;
    startBlock3 = polyStart.block;
    endBlock3 = snapshot.polyBlock;
    wallets4 = avaxWallets;
    startBlock4 = avaxStart.block;
    endBlock4 = snapshot.avaxBlock;
  }

  // Finding Moving Users:
  wallets.forEach(wallet => {
    if(wallet.balance === 0 && wallet.withdrawals.length > 0) {
      movingUsers.totalWithdrawingUsers++;
      let lastWithdrawal = wallet.withdrawals[wallet.withdrawals.length - 1];
      let timeScale = (lastWithdrawal.block - startBlock) / (endBlock - startBlock);
      let wallet2 = wallets2.find(otherWallet => otherWallet.address === wallet.address);
      if(wallet2) {
        let depositAfterWithdrawal = wallet2.deposits.find(deposit => ((deposit.block - startBlock2) / (endBlock2 - startBlock2)) > timeScale);
        if(depositAfterWithdrawal) {
          movingUsers.movingUserCount++;
          destinations.chain2++;
        }
      }
      let wallet3 = wallets3.find(otherWallet => otherWallet.address === wallet.address);
      if(wallet3) {
        let depositAfterWithdrawal = wallet3.deposits.find(deposit => ((deposit.block - startBlock3) / (endBlock3 - startBlock3)) > timeScale);
        if(depositAfterWithdrawal) {
          movingUsers.movingUserCount++;
          destinations.chain3++;
        }
      }
      let wallet4 = wallets4.find(otherWallet => otherWallet.address === wallet.address);
      if(wallet4) {
        let depositAfterWithdrawal = wallet4.deposits.find(deposit => ((deposit.block - startBlock4) / (endBlock4 - startBlock4)) > timeScale);
        if(depositAfterWithdrawal) {
          movingUsers.movingUserCount++;
          destinations.chain4++;
        }
      }
    }
  });

  // Setting Top Destination:
  let destinationValues = Object.values(destinations);
  let maxValue = Math.max(...destinationValues);
  let topChain = destinationValues.indexOf(maxValue);
  if(chain === 'eth') {
    if(topChain === 0) {
      movingUsers.topDestination = 'poly';
    } else if(topChain === 1) {
      movingUsers.topDestination = 'avax';
    } else if(topChain === 2) {
      movingUsers.topDestination = 'op';
    }
  } else if(chain === 'poly') {
    if(topChain === 0) {
      movingUsers.topDestination = 'eth';
    } else if(topChain === 1) {
      movingUsers.topDestination = 'avax';
    } else if(topChain === 2) {
      movingUsers.topDestination = 'op';
    }
  } else if(chain === 'avax') {
    if(topChain === 0) {
      movingUsers.topDestination = 'eth';
    } else if(topChain === 1) {
      movingUsers.topDestination = 'poly';
    } else if(topChain === 2) {
      movingUsers.topDestination = 'op';
    }
  } else {
    if(topChain === 0) {
      movingUsers.topDestination = 'eth';
    } else if(topChain === 1) {
      movingUsers.topDestination = 'poly';
    } else if(topChain === 2) {
      movingUsers.topDestination = 'avax';
    }
  }

  // Saving Data:
  writeJSON([movingUsers], fileName, true);
}

/* ====================================================================================================================================================== */

calcStats();