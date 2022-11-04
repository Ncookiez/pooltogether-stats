
// Imports:
import { utils } from 'ethers';

// Type Imports:
import type { Chain, Hash, ChainStats, ChainData, DrawData, ExplorerAPIDrawResponse, PlayerData } from '$lib/types';

/* ========================================================================================================================================================================= */

// Initializations:
const apiURL = 'https://pooltogether-stats.web.app';
const explorerApiURL = 'https://poolexplorer.xyz';
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
  } catch(err) {
    console.error(err);
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