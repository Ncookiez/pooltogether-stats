
// Imports:
import { writeJSON, readJSON, getRangeArray } from "./functions.js";

/* ====================================================================================================================================================== */

// JSON Files:
const ethDeposits = readJSON('eth/deposits');
const ethWithdrawals = readJSON('eth/withdrawals');
const ethClaims = readJSON('eth/claims');
const ethWallets = readJSON('eth/wallets');
const polyDeposits = readJSON('poly/deposits');
const polyWithdrawals = readJSON('poly/withdrawals');
const polyClaims = readJSON('poly/claims');
const polyWallets = readJSON('poly/wallets');
const avaxDeposits = readJSON('avax/deposits');
const avaxWithdrawals = readJSON('avax/withdrawals');
const avaxClaims = readJSON('avax/claims');
const avaxWallets = readJSON('avax/wallets');
const snapshot = readJSON('snapshot')[0];

// Starting Block Timestamps:
const ethStart = { block: 13419900, timestamp: 1634263391 };
const polyStart = { block: 20226700, timestamp: 1634256864 };
const avaxStart = { block: 8501200, timestamp: 1640037507 };

// Settings:
const tickCount = 100;

/* ====================================================================================================================================================== */

// Function to execute stats' calculations:
export const calcStats = (chain) => {
  calcDepositsOverTime(chain);
  calcWithdrawalsOverTime(chain);
  calcClaimsOverTime(chain);
  calcWalletsOverTime(chain);
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
  } else {
    deposits = avaxDeposits;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
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
  } else {
    withdrawals = avaxWithdrawals;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
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
  } else {
    claims = avaxClaims;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
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
  } else {
    deposits = avaxDeposits;
    start = avaxStart;
    endBlock = snapshot.avaxBlock;
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

// <TODO> users that won prizes without deposits

/* ====================================================================================================================================================== */

// <TODO> users that withdrew without winning any prizes
// deposit amount is also important here

/* ====================================================================================================================================================== */

// <TODO> gas costs (percentage of prize as gas)
// maybe users losing money with claims?

/* ====================================================================================================================================================== */

// <TODO> time between first deposit and first claim