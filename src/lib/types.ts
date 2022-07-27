
// Chain Type:
export type Chain = 'eth' | 'poly' | 'avax' | 'op';

// Hash Type:
export type Hash = `0x${string}`;

/* ========================================================================================================================================================================= */

// Chain Data Interface:
export interface ChainData {
  deposits: { lastQueriedBlock: number, data: DepositData[] }
  withdrawals: { lastQueriedBlock: number, data: WithdrawalData[] }
  claims: { lastQueriedBlock: number, data: ClaimData[] }
  delegationsCreated: { lastQueriedBlock: number, data: DelegationCreatedData[] }
  delegationsFunded: { lastQueriedBlock: number, data: DelegationFundedData[] }
  delegationsUpdated: { lastQueriedBlock: number, data: DelegationUpdatedData[] }
  delegationsWithdrawn: { lastQueriedBlock: number, data: DelegationWithdrawnData[] }
  yield: { lastQueriedBlock: number, data: YieldData[] }
  supply: { lastQueriedBlock: number, data: SupplyData[] }
  balances: { lastQueriedBlock: number, timestamp: number | undefined, data: BalanceData[] }
  draws: { data: DrawData[] }
}

/* ========================================================================================================================================================================= */

// Data Type Interfaces:
export interface DepositData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  amount: number
}
export interface WithdrawalData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  amount: number
}
export interface ClaimData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  prizes: number[]
}
export interface DelegationCreatedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  delegatee: Hash
}
export interface DelegationFundedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  amount: number
}
export interface DelegationUpdatedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  newDelegatee: Hash
}
export interface DelegationWithdrawnData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  amount: number
}
export interface YieldData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  amount: number
}
export interface SupplyData {
  block: number
  timestamp: number | undefined
  aave: number
  tickets: number
}
export interface BalanceData {
  wallet: Hash
  balance: number
}
export interface DrawData {
  draw: number
  timestamp: number
  result: {
    wallet: Hash
    claimable: number[]
    dropped: number[]
    avgBalance: number
  }[]
}

/* ========================================================================================================================================================================= */

// PoolExplorer API Draw Reponse Interface:
export interface ExplorerAPIDrawResponse {
  draw: number
  timestamp: string
  result: {
    n: string   // Network
    a: Hash     // Wallet Address
    c: string[] // Claimable Prizes
    u: string[] // Dropped Prizes
    w: string   // Sum of Claimable Prizes
    d: string   // Sum of Dropped Prizes
    g: number   // Wallet's Average Balance
  }[]
}