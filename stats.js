
// Imports:
import { writeJSON, readJSON, getRangeArray } from "./functions.js";

/* ====================================================================================================================================================== */

// JSON Files:
const ethDeposits = readJSON('ethDeposits');
const ethWithdrawals = readJSON('ethWithdrawals');
const ethClaims = readJSON('ethClaims');
const ethWallets = readJSON('ethWallets');
const polyDeposits = readJSON('polyDeposits');
const polyWithdrawals = readJSON('polyWithdrawals');
const polyClaims = readJSON('polyClaims');
const polyWallets = readJSON('polyWallets');
const avaxDeposits = readJSON('avaxDeposits');
const avaxWithdrawals = readJSON('avaxWithdrawals');
const avaxClaims = readJSON('avaxClaims');
const avaxWallets = readJSON('avaxWallets');
const snapshot = readJSON('snapshot')[0];

// Starting Block Timestamps:
const ethStart = { block: 13419900, timestamp: 1634263391 };
const polyStart = { block: 20226700, timestamp: 1634256864 };
const avaxStart = { block: 8501200, timestamp: 1640037507 };

// Settings:
const tickCount = 100;

/* ====================================================================================================================================================== */

// Function to execute stats' calculations:
const executeStats = async () => {

  // Chain Selection:
  const chains = [
    'eth',
    'poly',
    'avax'
  ];

  // Stats Selection:
  for(let chain of chains) {
    calcDepositsOverTime(chain);
    calcWithdrawalsOverTime(chain);
  }
}

/* ====================================================================================================================================================== */

// Function to calculate deposits over time:
export const calcDepositsOverTime = (chain) => {

  // Initializations:
  const fileName = `${chain}DepositsOverTime`;
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
export const calcWithdrawalsOverTime = (chain) => {

  // Initializations:
  const fileName = `${chain}WithdrawalsOverTime`;
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

// withdrawal count over time
// withdrawal amount over time
// claim count over time
// claim amount over time
// unique wallets over time
// average withdrawal
// average claim
// number of users with balance but no deposit
// claim distribution
// deposits over time (deposits + claims - withdrawals)

/* ====================================================================================================================================================== */

executeStats();