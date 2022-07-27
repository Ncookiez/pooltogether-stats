
// Type Imports:
import type { Chain, DepositData, WithdrawalData } from '$lib/types';

/* ========================================================================================================================================================================= */

// Settings:
const apiURL = 'https://pooltogether-stats.web.app';
const pageSize = 20000;

/* ========================================================================================================================================================================= */

// Function to fetch deposits data:
export const fetchDeposits = async (chain: Chain) => {

  // Initializations:
  const deposits: { lastQueriedBlock: number, data: DepositData[] } = { lastQueriedBlock: 0, data: [] };
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
  const withdrawals: { lastQueriedBlock: number, data: WithdrawalData[] } = { lastQueriedBlock: 0, data: [] };
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