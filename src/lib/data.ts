
// Imports:
import { utils } from 'ethers';

// Type Imports:
import type { Chain, Hash, ChainStats, ChainData, DepositData, WithdrawalData, ClaimData, DelegationCreatedData, DelegationFundedData, DelegationUpdatedData, DelegationWithdrawnData, YieldData, SupplyData, BalanceData, DrawData, ExplorerAPIDrawResponse, PlayerData } from '$lib/types';

/* ========================================================================================================================================================================= */

// Initializations:
const apiURL = 'https://pooltogether-stats.web.app';
const explorerApiURL = 'https://poolexplorer.xyz';
const defaultPageSize = 20000;
const drawFormattingWorkerPath: string = '/workers/drawFormattingWorker.js';
const workerTimeout: number = 120000;

/* ========================================================================================================================================================================= */

// Function to fetch basic stats:
export const fetchStats = async (chain: Chain) => {
  try {
    const apiResponse: { lastQueriedBlock: number, data: ChainStats[] } = await fetch(`${apiURL}/${chain}/stats`).then(response => response.json());
    return apiResponse.data[0];
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} stats.`);
  }
}

/* ========================================================================================================================================================================= */

// Function to fetch deposits data:
export const fetchDeposits = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const deposits: ChainData['deposits'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: DepositData[], page: number, hasNextPage: boolean };

  // Fetching Deposits:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/deposits?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      deposits.lastQueriedBlock = apiResponse.lastQueriedBlock;
      deposits.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/deposits?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > deposits.lastQueriedBlock) {
          deposits.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        deposits.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} deposits.`);
  }

  return deposits;
}

// Function to fetch last deposits:
export const fetchLastDeposits = async (chain: Chain) => {

  // Initializations:
  const lastDeposits: ChainData['deposits'] = { lastQueriedBlock: 0, data: [] };

  // Fetching Last Deposits:
  try {
    const apiResponse: ChainData['deposits'] = await fetch(`${apiURL}/${chain}/lastDeposits`).then(response => response.json());
    lastDeposits.lastQueriedBlock = apiResponse.lastQueriedBlock;
    lastDeposits.data = apiResponse.data;
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} last deposits.`);
  }

  return lastDeposits;
}

/* ========================================================================================================================================================================= */

// Function to fetch withdrawals data:
export const fetchWithdrawals = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const withdrawals: ChainData['withdrawals'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: WithdrawalData[], page: number, hasNextPage: boolean };

  // Fetching Withdrawals:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/withdrawals?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      withdrawals.lastQueriedBlock = apiResponse.lastQueriedBlock;
      withdrawals.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/withdrawals?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > withdrawals.lastQueriedBlock) {
          withdrawals.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        withdrawals.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} withdrawals.`);
  }

  return withdrawals;
}

/* ========================================================================================================================================================================= */

// Function to fetch claims data:
export const fetchClaims = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const claims: ChainData['claims'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: ClaimData[], page: number, hasNextPage: boolean };

  // Fetching Claims:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/claims?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      claims.lastQueriedBlock = apiResponse.lastQueriedBlock;
      claims.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/claims?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > claims.lastQueriedBlock) {
          claims.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        claims.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} claims.`);
  }

  return claims;
}

/* ========================================================================================================================================================================= */

// Function to fetch delegations created data:
export const fetchDelegationsCreated = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const delegationsCreated: ChainData['delegationsCreated'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: DelegationCreatedData[], page: number, hasNextPage: boolean };

  // Fetching Delegations Created:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/delegationsCreated?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      delegationsCreated.lastQueriedBlock = apiResponse.lastQueriedBlock;
      delegationsCreated.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/delegationsCreated?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > delegationsCreated.lastQueriedBlock) {
          delegationsCreated.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        delegationsCreated.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} delegations created.`);
  }

  return delegationsCreated;
}

/* ========================================================================================================================================================================= */

// Function to fetch delegations funded data:
export const fetchDelegationsFunded = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const delegationsFunded: ChainData['delegationsFunded'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: DelegationFundedData[], page: number, hasNextPage: boolean };

  // Fetching Delegations Funded:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/delegationsFunded?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      delegationsFunded.lastQueriedBlock = apiResponse.lastQueriedBlock;
      delegationsFunded.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/delegationsFunded?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > delegationsFunded.lastQueriedBlock) {
          delegationsFunded.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        delegationsFunded.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} delegations funded.`);
  }

  return delegationsFunded;
}

// Function to fetch last delegations funded:
export const fetchLastDelegations = async (chain: Chain) => {

  // Initializations:
  const lastDelegations: ChainData['delegationsFunded'] = { lastQueriedBlock: 0, data: [] };

  // Fetching Last Delegations:
  try {
    const apiResponse: ChainData['delegationsFunded'] = await fetch(`${apiURL}/${chain}/lastDelegations`).then(response => response.json());
    lastDelegations.lastQueriedBlock = apiResponse.lastQueriedBlock;
    lastDelegations.data = apiResponse.data;
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} last delegations.`);
  }

  return lastDelegations;
}

/* ========================================================================================================================================================================= */

// Function to fetch delegations updated data:
export const fetchDelegationsUpdated = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const delegationsUpdated: ChainData['delegationsUpdated'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: DelegationUpdatedData[], page: number, hasNextPage: boolean };

  // Fetching Delegations Updated:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/delegationsUpdated?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      delegationsUpdated.lastQueriedBlock = apiResponse.lastQueriedBlock;
      delegationsUpdated.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/delegationsUpdated?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > delegationsUpdated.lastQueriedBlock) {
          delegationsUpdated.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        delegationsUpdated.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} delegations updated.`);
  }

  return delegationsUpdated;
}

/* ========================================================================================================================================================================= */

// Function to fetch delegations withdrawn data:
export const fetchDelegationsWithdrawn = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const delegationsWithdrawn: ChainData['delegationsWithdrawn'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: DelegationWithdrawnData[], page: number, hasNextPage: boolean };

  // Fetching Delegations Withdrawn:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/delegationsWithdrawn?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      delegationsWithdrawn.lastQueriedBlock = apiResponse.lastQueriedBlock;
      delegationsWithdrawn.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/delegationsWithdrawn?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > delegationsWithdrawn.lastQueriedBlock) {
          delegationsWithdrawn.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        delegationsWithdrawn.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} delegations withdrawn.`);
  }

  return delegationsWithdrawn;
}

/* ========================================================================================================================================================================= */

// Function to fetch yield data:
export const fetchYield = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const yields: ChainData['yields'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: YieldData[], page: number, hasNextPage: boolean };

  // Fetching Yield:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/yield?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      yields.lastQueriedBlock = apiResponse.lastQueriedBlock;
      yields.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/yield?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > yields.lastQueriedBlock) {
          yields.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        yields.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} yield.`);
  }

  return yields;
}

/* ========================================================================================================================================================================= */

// Function to fetch supply data:
export const fetchSupply = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const supply: ChainData['supply'] = { lastQueriedBlock: 0, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, data: SupplyData[], page: number, hasNextPage: boolean };

  // Fetching Supply:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/supply?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      supply.lastQueriedBlock = apiResponse.lastQueriedBlock;
      supply.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/supply?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > supply.lastQueriedBlock) {
          supply.lastQueriedBlock = apiResponse.lastQueriedBlock;
        }
        supply.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} supply.`);
  }

  return supply;
}

/* ========================================================================================================================================================================= */

// Function to fetch balances data:
export const fetchBalances = async (chain: Chain, pageSize?: number, page?: number) => {

  // Initializations:
  const balances: ChainData['balances'] = { lastQueriedBlock: 0, timestamp: undefined, data: [] };
  let hasNextPage = false;
  let currentPage = 0;

  // Type Initializations:
  type APIResponse = { lastQueriedBlock: number, timestamp: number | undefined, data: BalanceData[], page: number, hasNextPage: boolean };

  // Fetching Balances:
  try {
    if(page) {
      const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/balances?page=${page}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
      balances.lastQueriedBlock = apiResponse.lastQueriedBlock;
      balances.data = apiResponse.data;
    } else {
      do {
        const apiResponse: APIResponse = await fetch(`${apiURL}/${chain}/balances?page=${currentPage++}&pageSize=${pageSize ?? defaultPageSize}`).then(response => response.json());
        if(apiResponse.lastQueriedBlock > balances.lastQueriedBlock) {
          balances.lastQueriedBlock = apiResponse.lastQueriedBlock;
          balances.timestamp = apiResponse.timestamp;
        }
        balances.data.push(...apiResponse.data);
        hasNextPage = apiResponse.hasNextPage;
      } while(hasNextPage);
    }
  } catch {
    throw new Error(`Error querying ${chain.toUpperCase()} balances.`);
  }

  return balances;
}

/* ========================================================================================================================================================================= */

// Function to fetch draws data:
export const fetchDraws = async () => {

  // Initializations:
  let draws: Record<Chain, { data: DrawData[] }> = { eth: { data: [] }, poly: { data: [] }, avax: { data: [] }, op: { data: [] } };

  // Fetching Draws:
  try {
    let apiResponse: ExplorerAPIDrawResponse[] = (await fetch(`${explorerApiURL}/cookies`).then(response => response.json()));
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(`Timed out while formatting draws.`), workerTimeout);
      const dataWorker = new Worker(drawFormattingWorkerPath);
      dataWorker.postMessage(apiResponse);
      dataWorker.onmessage = (event) => {
        clearTimeout(timeout);
        draws = event.data;
        (['eth', 'poly', 'avax', 'op'] as Chain[]).forEach(chain => {
          draws[chain].data.forEach(entry => {
            entry.result.forEach(player => {
              player.wallet = utils.getAddress(player.wallet) as Hash;
            });
          });
        });
        dataWorker.terminate();
        resolve();
      }
    });
  } catch {
    throw new Error(`Error querying draw data.`);
  }

  return draws;
}

/* ========================================================================================================================================================================= */

// Function to fetch player data:
export const fetchPlayerData = async (player: Hash) => {
  try {
    const apiResponse: PlayerData = await fetch(`${apiURL}/wallet?address=${player}`).then(response => response.json());
    return apiResponse;
  } catch {
    throw new Error(`Error querying player data for ${player}.`);
  }
}