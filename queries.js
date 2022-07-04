
// Imports:
import { calcStats } from './stats.js';
import { prizePoolABI, prizeDistributorABI, ticketABI } from './ABIs.js';
import { parseBN, multicallOneContractQuery } from 'weaverfi/dist/functions.js';
import { getChainName, queryBlocks, writeJSON, readJSON, getLatestBlock, getCurrentBlock } from './functions.js';

// Ethereum Contract Addresses:
const ethPrizePool = '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be';
const ethPrizeDistributor = '0xb9a179DcA5a7bf5f8B9E088437B3A85ebB495eFe';
const ethTicket = '0xdd4d117723C257CEe402285D3aCF218E9A8236E1';

// Polygon Contract Addresses:
const polyPrizePool = '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60';
const polyPrizeDistributor = '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056';
const polyTicket = '0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076';

// Avalanche Contract Addresses:
const avaxPrizePool = '0xF830F5Cb2422d555EC34178E27094a816c8F95EC';
const avaxPrizeDistributor = '0x83332F908f403ce795D90f677cE3f382FE73f3D1';
const avaxTicket = '0xB27f379C050f6eD0973A01667458af6eCeBc1d90';

/* ====================================================================================================================================================== */

// Function to execute queries:
const executeQueries = async () => {

  // Chains:
  const chains = [
    'eth',
    'poly',
    'avax'
  ];

  // Queries:
  let promises = chains.map(chain => (async () => {
    await queryDeposits(chain);
    await queryWithdrawals(chain);
    await queryClaims(chain);
    await queryWallets(chain);
  })());
  await Promise.all(promises);

  // Snapshot Update:
  await updateSnapshot();

  // Stats:
  for(let chain of chains) {
    calcStats(chain);
  }
}

/* ====================================================================================================================================================== */

// Function to query for deposits on a specific chain:
const queryDeposits = async (chain) => {

  // Initializations:
  const fileName = `${chain}/deposits`;
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
  if(depositEvents.length > 0) {
    depositEvents.forEach(event => {
      deposits.push({
        txHash: event.transactionHash,
        block: event.blockNumber,
        wallet: event.args.operator,
        amount: parseBN(event.args.amount) / (10 ** 6)
      });
    });
    console.log(`${chainName}: Formatted events to ${deposits.length} deposit TXs.`);
  }

  // Saving Formatted Data:
  writeJSON(deposits, fileName);
}

/* ====================================================================================================================================================== */

// Function to query for withdrawals on a specific chain:
const queryWithdrawals = async (chain) => {

  // Initializations:
  const fileName = `${chain}/withdrawals`;
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
  if(withdrawalEvents.length > 0) {
    withdrawalEvents.forEach(event => {
      withdrawals.push({
        txHash: event.transactionHash,
        block: event.blockNumber,
        wallet: event.args.operator,
        amount: parseBN(event.args.amount) / (10 ** 6)
      });
    });
    console.log(`${chainName}: Formatted events to ${withdrawals.length} withdrawal TXs.`);
  }

  // Saving Formatted Data:
  writeJSON(withdrawals, fileName);
}

/* ====================================================================================================================================================== */

// Function to query for prize claims on a specific chain:
const queryClaims = async (chain) => {

  // Initializations:
  const fileName = `${chain}/claims`;
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
  if(claimEvents.length > 0) {
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
    console.log(`${chainName}: Formatted events to ${claims.length} claim TXs.`);
  }

  // Saving Formatted Data:
  writeJSON(claims, fileName);
}

/* ====================================================================================================================================================== */

// Function to query and format wallet data on a specific chain:
const queryWallets = async (chain) => {

  // Initializations:
  const fileName = `${chain}/wallets`;
  const chainName = getChainName(chain);
  const deposits = readJSON(`${chain}/deposits`);
  const withdrawals = readJSON(`${chain}/withdrawals`);
  const claims = readJSON(`${chain}/claims`);
  const callsBatchSize = 500;
  let wallets = [];
  let balanceCalls = [];
  let balanceCallsMade = 0;

  // Filtering Deposits Data:
  deposits.forEach(deposit => {
    let depositTX = { tx: deposit.txHash, block: deposit.block, amount: deposit.amount };
    let existingWallet = wallets.map(wallet => wallet.address).indexOf(deposit.wallet);
    if(existingWallet === -1) {
      wallets.push({
        address: deposit.wallet,
        deposits: [depositTX],
        withdrawals: [],
        claims: []
      });
    } else {
      wallets[existingWallet].deposits.push(depositTX);
    }
  });

  // Filtering Withdrawals Data:
  withdrawals.forEach(withdrawal => {
    let withdrawalTX = { tx: withdrawal.txHash, block: withdrawal.block, amount: withdrawal.amount };
    let existingWallet = wallets.map(wallet => wallet.address).indexOf(withdrawal.wallet);
    if(existingWallet === -1) {
      wallets.push({
        address: withdrawal.wallet,
        deposits: [],
        withdrawals: [withdrawalTX],
        claims: []
      });
    } else {
      wallets[existingWallet].withdrawals.push(withdrawalTX);
    }
  });

  // Filtering Claims Data:
  claims.forEach(claim => {
    let claimTX = { tx: claim.txHash, block: claim.block, prizes: claim.prizes };
    let existingWallet = wallets.map(wallet => wallet.address).indexOf(claim.wallet);
    if(existingWallet === -1) {
      wallets.push({
        address: claim.wallet,
        deposits: [],
        withdrawals: [],
        claims: [claimTX]
      });
    } else {
      wallets[existingWallet].claims.push(claimTX);
    }
  });

  // Adding V4 Balances:
  wallets.forEach(wallet => {
    balanceCalls.push({ reference: wallet.address, methodName: 'balanceOf', methodParameters: [wallet.address] });
  });
  while(balanceCallsMade < balanceCalls.length) {
    let balances;
    let lastCallIndex = Math.min(balanceCallsMade + callsBatchSize, balanceCalls.length);
    if(chain === 'eth') {
      balances = await multicallOneContractQuery(chain, ethTicket, ticketABI, balanceCalls.slice(balanceCallsMade, lastCallIndex));
    } else if(chain === 'poly') {
      balances = await multicallOneContractQuery(chain, polyTicket, ticketABI, balanceCalls.slice(balanceCallsMade, lastCallIndex));
    } else if(chain === 'avax') {
      balances = await multicallOneContractQuery(chain, avaxTicket, ticketABI, balanceCalls.slice(balanceCallsMade, lastCallIndex));
    }
    balanceCallsMade = lastCallIndex;
    for(let address in balances) {
      let wallet = wallets.find(wallet => wallet.address === address);
      if(wallet) {
        wallet.balance = parseBN(balances[wallet.address][0]) / (10 ** 6);
      } else {
        console.warn('Wallet not found:', wallet.address);
      }
    }
  }
  console.log(`${chainName}: Queried wallet data for ${wallets.length} wallets.`);

  // Saving Wallet Data:
  writeJSON(wallets, fileName, true);
}

/* ====================================================================================================================================================== */

// Function to update snapshot for last query execution:
const updateSnapshot = async () => {
  let snapshot = {
    timestamp: Math.floor(Date.now() / 1000),
    ethBlock: await getCurrentBlock('eth'),
    polyBlock: await getCurrentBlock('poly'),
    avaxBlock: await getCurrentBlock('avax')
  }
  writeJSON([snapshot], 'snapshot', true);
}

/* ====================================================================================================================================================== */

executeQueries();