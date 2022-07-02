
// Imports:
import { parseBN } from 'weaverfi/dist/functions.js';
import { prizePoolABI, prizeDistributorABI } from './ABIs.js';
import { getChainName, queryBlocks, writeJSON, getLatestBlock } from './functions.js';

// Chains:
const chains = [
  'eth',
  'poly',
  'avax'
];

// Contract Addresses:
const ethPrizePool = '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be';
const ethPrizeDistributor = '0xb9a179DcA5a7bf5f8B9E088437B3A85ebB495eFe';
const polyPrizePool = '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60';
const polyPrizeDistributor = '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056';
const avaxPrizePool = '0xF830F5Cb2422d555EC34178E27094a816c8F95EC';
const avaxPrizeDistributor = '0x83332F908f403ce795D90f677cE3f382FE73f3D1';

/* ====================================================================================================================================================== */

// Function to execute queries:
const executeQueries = async () => {
  let promises = chains.map(chain => (async () => {
    await queryDeposits(chain);
    await queryWithdrawals(chain);
    await queryClaims(chain);
  })());
  await Promise.all(promises);
}

/* ====================================================================================================================================================== */

// Function to query for deposits on a specific chain:
const queryDeposits = async (chain) => {

  // Initializations:
  const fileName = `${chain}Deposits`;
  const chainName = getChainName(chain);
  let deposits = [];
  let depositEvents = [];

  // Querying Deposit Events:
  if(chain === 'eth') {
    depositEvents = await queryBlocks(chain, ethPrizePool, prizePoolABI, 'Deposited', 100000, [], Math.max(13419913, getLatestBlock(fileName)));
  } else if(chain === 'poly') {
    depositEvents = await queryBlocks(chain, polyPrizePool, prizePoolABI, 'Deposited', 2048, [], Math.max(20226772, getLatestBlock(fileName)));
  } else if(chain === 'avax') {
    depositEvents = await queryBlocks(chain, avaxPrizePool, prizePoolABI, 'Deposited', 100000, [], Math.max(8501287, getLatestBlock(fileName)));
  }
  console.log(`${chainName}: Found ${depositEvents.length} deposit events.`);

  // Formatting Deposit Events:
  depositEvents.forEach(event => {
    deposits.push({
      txHash: event.transactionHash,
      block: event.blockNumber,
      wallet: event.args.operator,
      amount: parseBN(event.args.amount) / (10 ** 6)
    });
  });
  console.log(`${chainName}: Formatted events to ${deposits.length} Deposit TXs.`);

  // Saving Formatted Data:
  writeJSON(deposits, fileName);
}

/* ====================================================================================================================================================== */

// Function to query for withdrawals on a specific chain:
const queryWithdrawals = async (chain) => {

  // Initializations:
  const fileName = `${chain}Withdrawals`;
  const chainName = getChainName(chain);
  let withdrawals = [];
  let withdrawalEvents = [];

  // Querying Withdrawal Events:
  if(chain === 'eth') {
    withdrawalEvents = await queryBlocks(chain, ethPrizePool, prizePoolABI, 'Withdrawal', 100000, [], Math.max(13419913, getLatestBlock(fileName)));
  } else if(chain === 'poly') {
    withdrawalEvents = await queryBlocks(chain, polyPrizePool, prizePoolABI, 'Withdrawal', 2048, [], Math.max(20226772, getLatestBlock(fileName)));
  } else if(chain === 'avax') {
    withdrawalEvents = await queryBlocks(chain, avaxPrizePool, prizePoolABI, 'Withdrawal', 100000, [], Math.max(8501287, getLatestBlock(fileName)));
  }
  console.log(`${chainName}: Found ${withdrawalEvents.length} withdrawal events.`);

  // Formatting Withdrawal Events:
  withdrawalEvents.forEach(event => {
    withdrawals.push({
      txHash: event.transactionHash,
      block: event.blockNumber,
      wallet: event.args.operator,
      amount: parseBN(event.args.amount) / (10 ** 6)
    });
  });
  console.log(`${chainName}: Formatted events to ${withdrawals.length} Withdrawal TXs.`);

  // Saving Formatted Data:
  writeJSON(withdrawals, fileName);
}

/* ====================================================================================================================================================== */

// Function to query for prize claims on a specific chain:
const queryClaims = async (chain) => {

  // Initializations:
  const fileName = `${chain}Claims`;
  const chainName = getChainName(chain);
  let claims = [];
  let claimEvents = [];

  // Querying Claim Events:
  if(chain === 'eth') {
    claimEvents = await queryBlocks(chain, ethPrizeDistributor, prizeDistributorABI, 'ClaimedDraw', 100000, [], Math.max(13419942, getLatestBlock(fileName)));
  } else if(chain === 'poly') {
    claimEvents = await queryBlocks(chain, polyPrizeDistributor, prizeDistributorABI, 'ClaimedDraw', 2048, [], Math.max(20226806, getLatestBlock(fileName)));
  } else if(chain === 'avax') {
    claimEvents = await queryBlocks(chain, avaxPrizeDistributor, prizeDistributorABI, 'ClaimedDraw', 100000, [], Math.max(8501313, getLatestBlock(fileName)));
  }
  console.log(`${chainName}: Found ${claimEvents.length} claim events.`);

  // Formatting Claim Events:
  claimEvents.forEach(event => {
    let prize = Math.ceil(parseBN(event.args.payout) / (10 ** 6));
    let existingTX = claims.map(claim => claim.txHash).indexOf(event.transactionHash);
    if(existingTX === -1) {
      claims.push({
        txHash: event.transactionHash,
        block: event.blockNumber,
        wallet: event.args.user,
        prizes: [prize]
      });
    } else {
      claims[existingTX].prizes.push(prize);
    }
  });
  console.log(`${chainName}: Formatted events to ${claims.length} Claim TXs.`);

  // Saving Formatted Data:
  writeJSON(claims, fileName);
}

/* ====================================================================================================================================================== */

executeQueries();