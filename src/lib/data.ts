
// Imports:
import { utils } from 'ethers';

// Type Imports:
import type { Chain, Hash, ChainData, DepositData, WithdrawalData, ClaimData, DelegationCreatedData, DelegationFundedData, DelegationUpdatedData, DelegationWithdrawnData, YieldData, SupplyData, BalanceData, DrawData, ExplorerAPIDrawResponse } from '$lib/types';

/* ========================================================================================================================================================================= */

// Settings:
const apiURL = 'https://pooltogether-stats.web.app';
const explorerApiURL = 'https://poolexplorer.xyz';
const pageSize = 20000;

/* ========================================================================================================================================================================= */

// Function to fetch deposits data:
export const fetchDeposits = async (chain: Chain) => {

  // Initializations:
  const deposits: ChainData['deposits'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Deposits:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: DepositData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/deposits?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > deposits.lastQueriedBlock) {
        deposits.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      deposits.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} deposits.`);
  }

  return deposits;
}

/* ========================================================================================================================================================================= */

// Function to fetch withdrawals data:
export const fetchWithdrawals = async (chain: Chain) => {

  // Initializations:
  const withdrawals: ChainData['withdrawals'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Withdrawals:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: WithdrawalData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/withdrawals?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > withdrawals.lastQueriedBlock) {
        withdrawals.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      withdrawals.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} withdrawals.`);
  }

  return withdrawals;
}

/* ========================================================================================================================================================================= */

// Function to fetch claims data:
export const fetchClaims = async (chain: Chain) => {

  // Initializations:
  const claims: ChainData['claims'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Claims:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: ClaimData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/claims?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > claims.lastQueriedBlock) {
        claims.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      claims.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} claims.`);
  }

  return claims;
}

/* ========================================================================================================================================================================= */

// Function to fetch delegations created data:
export const fetchDelegationsCreated = async (chain: Chain) => {

  // Initializations:
  const delegationsCreated: ChainData['delegationsCreated'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Delegations Created:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: DelegationCreatedData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/delegationsCreated?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > delegationsCreated.lastQueriedBlock) {
        delegationsCreated.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      delegationsCreated.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} delegations created.`);
  }

  return delegationsCreated;
}

/* ========================================================================================================================================================================= */

// Function to fetch delegations funded data:
export const fetchDelegationsFunded = async (chain: Chain) => {

  // Initializations:
  const delegationsFunded: ChainData['delegationsFunded'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Delegations Funded:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: DelegationFundedData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/delegationsFunded?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > delegationsFunded.lastQueriedBlock) {
        delegationsFunded.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      delegationsFunded.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} delegations funded.`);
  }

  return delegationsFunded;
}

/* ========================================================================================================================================================================= */

// Function to fetch delegations updated data:
export const fetchDelegationsUpdated = async (chain: Chain) => {

  // Initializations:
  const delegationsUpdated: ChainData['delegationsUpdated'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Delegations Updated:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: DelegationUpdatedData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/delegationsUpdated?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > delegationsUpdated.lastQueriedBlock) {
        delegationsUpdated.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      delegationsUpdated.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} delegations updated.`);
  }

  return delegationsUpdated;
}

/* ========================================================================================================================================================================= */

// Function to fetch delegations withdrawn data:
export const fetchDelegationsWithdrawn = async (chain: Chain) => {

  // Initializations:
  const delegationsWithdrawn: ChainData['delegationsWithdrawn'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Delegations Withdrawn:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: DelegationWithdrawnData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/delegationsWithdrawn?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > delegationsWithdrawn.lastQueriedBlock) {
        delegationsWithdrawn.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      delegationsWithdrawn.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} delegations withdrawn.`);
  }

  return delegationsWithdrawn;
}

/* ========================================================================================================================================================================= */

// Function to fetch yield data:
export const fetchYield = async (chain: Chain) => {

  // Initializations:
  const yields: ChainData['yields'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Yield:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: YieldData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/yield?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > yields.lastQueriedBlock) {
        yields.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      yields.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} yield.`);
  }

  return yields;
}

/* ========================================================================================================================================================================= */

// Function to fetch supply data:
export const fetchSupply = async (chain: Chain) => {

  // Initializations:
  const supply: ChainData['supply'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Supply:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, data: SupplyData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/supply?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > supply.lastQueriedBlock) {
        supply.lastQueriedBlock = apiResponse.lastQueriedBlock;
      }
      supply.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} supply.`);
  }

  return supply;
}

/* ========================================================================================================================================================================= */

// Function to fetch balances data:
export const fetchBalances = async (chain: Chain) => {

  // Initializations:
  const balances: ChainData['balances'] = { lastQueriedBlock: 0, timestamp: undefined, data: [] };
  let hasNextPage = false;
  let page = 0;

  // Fetching Balances:
  try {
    do {
      let apiResponse: { lastQueriedBlock: number, timestamp: number | undefined, data: BalanceData[], page: number, hasNextPage: boolean } = await fetch(`${apiURL}/${chain}/balances?page=${page++}&pageSize=${pageSize}`).then(response => response.json());
      if(apiResponse.lastQueriedBlock > balances.lastQueriedBlock) {
        balances.lastQueriedBlock = apiResponse.lastQueriedBlock;
        balances.timestamp = apiResponse.timestamp;
      }
      balances.data.push(...apiResponse.data);
      hasNextPage = apiResponse.hasNextPage;
    } while(hasNextPage);
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} balances.`);
  }

  return balances;
}

/* ========================================================================================================================================================================= */

// Function to fetch draws data:
export const fetchDraws = async () => {

  // Initializations:
  const draws: Record<Chain, { data: DrawData[] }> = {
    eth: { data: [] },
    poly: { data: [] },
    avax: { data: [] },
    op: { data: [] }
  }

  // Fetching Draws:
  try {
    let apiResponse: ExplorerAPIDrawResponse[] = (await fetch(`${explorerApiURL}/cookies`).then(response => response.json()));
    apiResponse.forEach(drawEntry => {
      const draw = drawEntry.draw;
      const timestamp = parseInt(drawEntry.timestamp);
      const result: { chain: Chain, wallet: Hash, claimable: number[], dropped: number[], avgBalance: number | null }[] = [];
      drawEntry.result.forEach(walletEntry => {
        let chain: Chain | undefined;
        if(walletEntry.n === '1') {
          chain = 'eth';
        } else if(walletEntry.n === '3') {
          chain = 'poly';
        } else if(walletEntry.n === '4') {
          chain = 'avax';
        } else if(walletEntry.n === '6') {
          chain = 'op';
        }
        if(chain) {
          const wallet = utils.getAddress(walletEntry.a) as Hash;
          const claimable = walletEntry.c.map(prize => parseInt(prize));
          const dropped = walletEntry.u.map(prize => parseInt(prize));
          const avgBalance = walletEntry.g;
          result.push({ chain, wallet, claimable, dropped, avgBalance });
        }
      });
      const ethResults: DrawData['result'] = result.filter(entry => entry.chain === 'eth').map(entry => ({ wallet: entry.wallet, claimable: entry.claimable, dropped: entry.dropped, avgBalance: entry.avgBalance }));
      const polyResults: DrawData['result'] = result.filter(entry => entry.chain === 'poly').map(entry => ({ wallet: entry.wallet, claimable: entry.claimable, dropped: entry.dropped, avgBalance: entry.avgBalance }));
      const avaxResults: DrawData['result'] = result.filter(entry => entry.chain === 'avax').map(entry => ({ wallet: entry.wallet, claimable: entry.claimable, dropped: entry.dropped, avgBalance: entry.avgBalance }));
      const opResults: DrawData['result'] = result.filter(entry => entry.chain === 'op').map(entry => ({ wallet: entry.wallet, claimable: entry.claimable, dropped: entry.dropped, avgBalance: entry.avgBalance }));
      draws.eth.data.push({ draw, timestamp, result: ethResults });
      draws.poly.data.push({ draw, timestamp, result: polyResults });
      draws.avax.data.push({ draw, timestamp, result: avaxResults });
      draws.op.data.push({ draw, timestamp, result: opResults });
    });
  } catch {
    throw new Error(`Error querying draw data.`);
  }

  return draws;
}