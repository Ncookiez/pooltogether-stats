
// Imports:
import { prizePoolABI, prizeDistributorABI, ticketABI, flushABI, aaveUSDCABI } from './ABIs.js';
import { query, queryBlocks, parseBN, multicallOneContractQuery } from 'weaverfi/dist/functions.js';
import { getChainName, writeJSON, readJSON, getLatestBlock, getCurrentBlock } from './functions.js';

// Ethereum Contract Addresses:
const ethPrizePool = '0xd89a09084555a7D0ABe7B111b1f78DFEdDd638Be';
const ethPrizeDistributor = '0xb9a179DcA5a7bf5f8B9E088437B3A85ebB495eFe';
const ethTicket = '0xdd4d117723C257CEe402285D3aCF218E9A8236E1';
const ethFlush = '0x2193b28b2BdfBf805506C9D91Ed2021bA6fBc888';
const ethAaveUSDC = '0xBcca60bB61934080951369a648Fb03DF4F96263C';
const ethYieldSource = '0x32e8D4c9d1B711BC958d0Ce8D14b41F77Bb03a64';

// Polygon Contract Addresses:
const polyPrizePool = '0x19DE635fb3678D8B8154E37d8C9Cdf182Fe84E60';
const polyPrizeDistributor = '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056';
const polyTicket = '0x6a304dFdb9f808741244b6bfEe65ca7B3b3A6076';
const polyFlush = '0xA2342489470474536F04cd4DdA2e8658303b305d';
const polyAaveUSDC = '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F';
const polyYieldSource = '0xD4F6d570133401079D213EcF4A14FA0B4bfB5b9C';

// Avalanche Contract Addresses:
const avaxPrizePool = '0xF830F5Cb2422d555EC34178E27094a816c8F95EC';
const avaxPrizeDistributor = '0x83332F908f403ce795D90f677cE3f382FE73f3D1';
const avaxTicket = '0xB27f379C050f6eD0973A01667458af6eCeBc1d90';
const avaxFlush = '0x1B20994C3894EcC862e26A9F4EC626A8489DD051';
const avaxAaveUSDC = '0x46A51127C3ce23fb7AB1DE06226147F446e4a857';
const avaxYieldSource = '0x7437db21A0dEB844Fa64223e2d6Db569De9648Ff';

// Optimism Contract Addresses:
const opPrizePool = '0x79Bc8bD53244bC8a9C8c27509a2d573650A83373';
const opPrizeDistributor = '0x722e9BFC008358aC2d445a8d892cF7b62B550F3F';
const opTicket = '0x62BB4fc73094c83B5e952C2180B23fA7054954c4';
const opFlush = '0x4c65F496B78b7E81c15723f56a43925E5dc3a0e1';
const opAaveUSDC = '0x625E7708f30cA75bfd92586e17077590C60eb4cD';
const opYieldSource = '0x4ecB5300D9ec6BCA09d66bfd8Dcb532e3192dDA1';

/* ====================================================================================================================================================== */

// Function to execute queries:
const executeQueries = async () => {

  // Chains:
  const chains = [
    'eth',
    'poly',
    'avax',
    'op'
  ];

  // Queries:
  console.log('# Starting Queries');
  let promises = chains.map(chain => (async () => {
    await queryDeposits(chain);
    await queryWithdrawals(chain);
    await queryClaims(chain);
    await queryWallets(chain);
    await queryYield(chain);
    await querySupply(chain);
  })());
  await Promise.all(promises);

  // Snapshot Update:
  console.log('\n# Updating Snapshot');
  await updateSnapshot();
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
  } else if(chain === 'op') {
    depositEvents = await queryBlocks(chain, opPrizePool, prizePoolABI, 'Deposited', 100000, [], Math.max(14043015, getLatestBlock(fileName)));
  }
  console.log(`  > ${chainName}: Found ${depositEvents.length} new deposit events.`);

  // Formatting & Saving Deposit Events:
  if(depositEvents.length > 0) {
    depositEvents.forEach(event => {
      deposits.push({
        txHash: event.transactionHash,
        block: event.blockNumber,
        wallet: event.args.operator,
        amount: parseBN(event.args.amount) / (10 ** 6)
      });
    });
    writeJSON(deposits, fileName);
  }
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
  } else if(chain === 'op') {
    withdrawalEvents = await queryBlocks(chain, opPrizePool, prizePoolABI, 'Withdrawal', 100000, [], Math.max(14043015, getLatestBlock(fileName)));
  }
  console.log(`  > ${chainName}: Found ${withdrawalEvents.length} new withdrawal events.`);

  // Formatting & Saving Withdrawal Events:
  if(withdrawalEvents.length > 0) {
    withdrawalEvents.forEach(event => {
      withdrawals.push({
        txHash: event.transactionHash,
        block: event.blockNumber,
        wallet: event.args.operator,
        amount: parseBN(event.args.amount) / (10 ** 6)
      });
    });
    writeJSON(withdrawals, fileName);
  }
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
  } else if(chain === 'op') {
    claimEvents = await queryBlocks(chain, opPrizeDistributor, prizeDistributorABI, 'ClaimedDraw', 100000, [], Math.max(14043052, getLatestBlock(fileName)));
  }
  console.log(`  > ${chainName}: Found ${claimEvents.length} new claim events.`);

  // Formatting & Saving Claim Events:
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
    writeJSON(claims, fileName);
  }
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
    } else if(chain === 'op') {
      balances = await multicallOneContractQuery(chain, opTicket, ticketABI, balanceCalls.slice(balanceCallsMade, lastCallIndex));
    }
    balanceCallsMade = lastCallIndex;
    for(let address in balances) {
      let wallet = wallets.find(wallet => wallet.address === address);
      if(wallet) {
        wallet.balance = parseBN(balances[wallet.address][0]) / (10 ** 6);
      } else {
        console.warn('    - QUERY WARNING: Wallet not found:', wallet.address);
      }
    }
  }
  console.log(`  > ${chainName}: Queried wallet data for ${wallets.length} wallets.`);

  // Saving Wallet Data:
  writeJSON(wallets, fileName, true);
}

/* ====================================================================================================================================================== */

// Function to query for yield captures on a specific chain:
const queryYield = async (chain) => {

  // Initializations:
  const fileName = `${chain}/yieldCaptures`;
  const chainName = getChainName(chain);
  let yieldCaptures = [];
  let flushEvents = [];

  // Querying Flush Events:
  if(chain === 'eth') {
    flushEvents = await queryBlocks(chain, ethFlush, flushABI, 'Flushed', 100000, [], Math.max(13419944, getLatestBlock(fileName)));
  } else if(chain === 'poly') {
    flushEvents = await queryBlocks(chain, polyFlush, flushABI, 'Flushed', 2048, [], Math.max(20226820, getLatestBlock(fileName)));
  } else if(chain === 'avax') {
    flushEvents = await queryBlocks(chain, avaxFlush, flushABI, 'Flushed', 100000, [], Math.max(8501340, getLatestBlock(fileName)));
  } else if(chain === 'op') {
    flushEvents = await queryBlocks(chain, opFlush, flushABI, 'Flushed', 100000, [], Math.max(14043064, getLatestBlock(fileName)));
  }
  console.log(`  > ${chainName}: Found ${flushEvents.length} new flush events.`);

  // Formatting & Saving Flush Events:
  if(flushEvents.length > 0) {
    flushEvents.forEach(event => {
      yieldCaptures.push({
        txHash: event.transactionHash,
        block: event.blockNumber,
        yield: parseBN(event.args.amount) / (10 ** 6)
      });
    });
    writeJSON(yieldCaptures, fileName);
  }
}

/* ====================================================================================================================================================== */

// Function to query for supply values on a specific chain:
const querySupply = async (chain) => {

  // Initializations:
  const fileName = `${chain}/supply`;
  const chainName = getChainName(chain);
  const decimals = 6;
  let supply = {
    aToken: 0,
    ticket: 0
  }

  // Querying Aave Supply:
  if(chain === 'eth') {
    supply.aToken = parseInt(await query(chain, ethAaveUSDC, aaveUSDCABI, 'balanceOf', [ethYieldSource])) / (10 ** decimals);
  } else if(chain === 'poly') {
    supply.aToken = parseInt(await query(chain, polyAaveUSDC, aaveUSDCABI, 'balanceOf', [polyYieldSource])) / (10 ** decimals);
  } else if(chain === 'avax') {
    supply.aToken = parseInt(await query(chain, avaxAaveUSDC, aaveUSDCABI, 'balanceOf', [avaxYieldSource])) / (10 ** decimals);
  } else if(chain === 'op') {
    supply.aToken = parseInt(await query(chain, opAaveUSDC, aaveUSDCABI, 'balanceOf', [opYieldSource])) / (10 ** decimals);
  }

  // Querying Ticket Supply:
  if(chain === 'eth') {
    supply.ticket = parseInt(await query(chain, ethTicket, ticketABI, 'totalSupply', [])) / (10 ** decimals);
  } else if(chain === 'poly') {
    supply.ticket = parseInt(await query(chain, polyTicket, ticketABI, 'totalSupply', [])) / (10 ** decimals);
  } else if(chain === 'avax') {
    supply.ticket = parseInt(await query(chain, avaxTicket, ticketABI, 'totalSupply', [])) / (10 ** decimals);
  } else if(chain === 'op') {
    supply.ticket = parseInt(await query(chain, opTicket, ticketABI, 'totalSupply', [])) / (10 ** decimals);
  }
  console.log(`  > ${chainName}: Queried token supplies.`);
  writeJSON([supply], fileName, true);
}

/* ====================================================================================================================================================== */

// Function to update snapshot for last query execution:
const updateSnapshot = async () => {
  let snapshot = {
    timestamp: Math.floor(Date.now() / 1000),
    ethBlock: await getCurrentBlock('eth'),
    polyBlock: await getCurrentBlock('poly'),
    avaxBlock: await getCurrentBlock('avax'),
    opBlock: await getCurrentBlock('op')
  }
  writeJSON([snapshot], 'snapshot', true);
}

/* ====================================================================================================================================================== */

executeQueries();