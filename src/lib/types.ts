
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
  yields: { lastQueriedBlock: number, data: YieldData[] }
  supply: { lastQueriedBlock: number, data: SupplyData[] }
  balances: { lastQueriedBlock: number, timestamp: number | undefined, data: BalanceData[] }
  draws: { data: DrawData[] }
  depositsOverTime?: DepositsOverTime
  withdrawalsOverTime?: WithdrawalsOverTime
  claimsOverTime?: ClaimsOverTime
  tvlOverTime?: TVLOverTime
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

/* ========================================================================================================================================================================= */

// Chart Interfaces:
export interface LineChartInfo {
  name: string
  xAxisValues: string[]
  data: Line[]
  dollarValues?: boolean
}
export interface PieChartInfo {
  name: string
  sectionLabels: string[]
  data: number[]
  hiddenPercentage?: number
  appendedLabel?: string
}
export interface Line {
  label: string
  data: number[]
  backgroundColor?: string
  lineColor?: string
  lineWidth?: number
  pointRadius?: number
  pointHoverRadius?: number
  tension?: number
}

/* ========================================================================================================================================================================= */

// Over Time Interfaces:
export interface DepositsOverTime {
  timestamps: number[]
  depositAmounts: number[]
  depositCounts: number[]
  uniqueWallets: number[]
  avgDepositAmounts: number[]
  cumulativeDepositAmounts: number[]
  cumulativeDepositCounts: number[]
  cumulativeUniqueWallets: number[]
}
export interface WithdrawalsOverTime {
  timestamps: number[]
  withdrawalAmounts: number[]
  withdrawalCounts: number[]
  uniqueWallets: number[]
  avgWithdrawalAmounts: number[]
  cumulativeWithdrawalAmounts: number[]
  cumulativeWithdrawalCounts: number[]
  cumulativeUniqueWallets: number[]
}
export interface ClaimsOverTime {
  timestamps: number[]
  claimAmounts: number[]
  claimCounts: number[]
  prizeCounts: number[]
  uniqueWallets: number[]
  avgClaimAmounts: number[]
  cumulativeClaimAmounts: number[]
  cumulativeClaimCounts: number[]
  cumulativePrizeCounts: number[]
  cumulativeUniqueWallets: number[]
}
export interface TVLOverTime {
  timestamps: number[]
  tvls: number[]
}
export interface DelegationsOverTime {
  timestamps: number[]
  delegationAmounts: number[]
  delegationCounts: number[]
  delegationWithdrawalAmounts: number[]
  delegationWithdrawalCounts: number[]
  uniqueWallets: number[]
  avgDelegationAmounts: number[]
  cumulativeDelegationAmounts: number[]
  cumulativeDelegationCounts: number[]
  cumulativeDelegationWithdrawalAmounts: number[]
  cumulativeDelegationWithdrawalCounts: number[]
  cumulativeUniqueWallets: number[]
}