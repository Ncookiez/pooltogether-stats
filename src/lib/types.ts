
// Chain Type:
export type Chain = 'eth' | 'poly' | 'avax' | 'op';

// Hash Type:
export type Hash = `0x${string}`;

// Transaction Type:
export type TX = DepositTX | WithdrawalTX | ClaimTX | DelegationCreatedTX | DelegationFundedTX | DelegationUpdatedTX | DelegationWithdrawnTX;

// Loading Status Type:
export type LoadingStatus = 'done' | 'loading' | 'failed' | 'none';

// App Status Type:
export type AppStatus = 'online' | 'maintenance' | 'shuttingDown';

/* ========================================================================================================================================================================= */

// Chain Stats Interface:
export interface ChainStats {
  minTimestamp: number
  maxTimestamp: number
  depositsOverTime: DepositsOverTime
  withdrawalsOverTime: WithdrawalsOverTime
  claimsOverTime: ClaimsOverTime
  tvlOverTime: TVLOverTime
  delegationsOverTime: DelegationsOverTime
  yieldOverTime: YieldOverTime
  tvlDistribution: TVLDistribution
  currentUsers: Hash[]
  topWhales: BalanceData[]
}

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
export interface WalletData {
  txs: TX[]
  currentBalance: number
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
    chain: Chain
    wallet: Hash
    claimable: number[]
    dropped: number[]
    avgBalance: number | null
  }[]
}

/* ========================================================================================================================================================================= */

// PoolExplorer API Draw Reponse Interface:
export interface ExplorerAPIDrawResponse {
  draw: number
  timestamp: string
  result: {
    n: string         // Network
    a: Hash           // Wallet Address
    c: string[]       // Claimable Prizes
    u: string[]       // Dropped Prizes
    w: string         // Sum of Claimable Prizes
    d: string         // Sum of Dropped Prizes
    g: number | null  // Wallet's Average Balance
  }[]
}

/* ========================================================================================================================================================================= */

// Chart Interfaces:
export interface LineChartInfo {
  name: string
  title?: string
  xAxisValues: string[]
  data: Line[]
  dollarValues?: boolean
  stacked?: boolean
}
export interface PieChartInfo {
  name: string
  title?: string
  sectionLabels: string[]
  data: number[]
  hiddenPercentage?: number
  dollarValues?: boolean
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

// Transaction Interfaces:
export interface DepositTX {
  chain: Chain
  type: 'deposit'
  data: DepositData
}
export interface WithdrawalTX {
  chain: Chain
  type: 'withdrawal'
  data: WithdrawalData
}
export interface ClaimTX {
  chain: Chain
  type: 'claim'
  data: ClaimData
}
export interface DelegationCreatedTX {
  chain: Chain
  type: 'delegationCreated'
  data: DelegationCreatedData
}
export interface DelegationFundedTX {
  chain: Chain
  type: 'delegationFunded'
  data: DelegationFundedData
}
export interface DelegationUpdatedTX {
  chain: Chain
  type: 'delegationUpdated'
  data: DelegationUpdatedData
}
export interface DelegationWithdrawnTX {
  chain: Chain
  type: 'delegationWithdrawn'
  data: DelegationWithdrawnData
}

/* ========================================================================================================================================================================= */

// Over Time Interfaces:
export interface DepositsOverTime {
  timestamps: number[]
  depositAmounts: number[]
  depositCounts: number[]
  uniqueWallets: number[]
  distributions: DepositDistribution
  avgDepositAmounts: number[]
  cumulativeDepositAmounts: number[]
  cumulativeDepositCounts: number[]
  cumulativeUniqueWallets: number[]
  cumulativeDistributions: DepositDistribution
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
  distributions: ClaimDistribution
  avgClaimAmounts: number[]
  cumulativeClaimAmounts: number[]
  cumulativeClaimCounts: number[]
  cumulativePrizeCounts: number[]
  cumulativeUniqueWallets: number[]
  cumulativeDistributions: ClaimDistribution
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
  tvls: number[]
}
export interface YieldOverTime {
  timestamps: number[]
  yieldAmounts: number[]
  yieldCounts: number[]
  cumulativeYieldAmounts: number[]
  cumulativeYieldCounts: number[]
}

/* ========================================================================================================================================================================= */

// Distribution Interfaces:
export interface DepositDistribution {
  1: number[]
  10: number[]
  100: number[]
  1000: number[]
  10000: number[]
  100000: number[]
}
export interface ClaimDistribution {
  1: number[]
  5: number[]
  10: number[]
  50: number[]
  100: number[]
  500: number[]
  1000: number[]
}
export interface MultichainDistribution {
  totalUsers: number
  oneChain: number
  twoChains: number
  threeChains: number
  fourChains: number
}
export interface TVLDistribution {
  1: { amount: number, count: number }
  10: { amount: number, count: number }
  100: { amount: number, count: number }
  1000: { amount: number, count: number }
  10000: { amount: number, count: number }
  100000: { amount: number, count: number }
  1000000: { amount: number, count: number }
}

/* ========================================================================================================================================================================= */

// Player Data Interface:
export interface PlayerData {
  txs: TX[]
  timestamps: number[]
  depositsOverTime: number[]
  claimsOverTime: number[]
  withdrawalsOverTime: number[]
  balancesOverTime: number[]
  balances: { eth: number, poly: number, avax: number, op: number }
}

/* ========================================================================================================================================================================= */

// Selected Chains Interface:
export interface SelectedChains {
  eth: boolean
  poly: boolean
  avax: boolean
  op: boolean
}

/* ========================================================================================================================================================================= */

// Loading Interfaces:
export interface Loading {
  draws: LoadingStatus
  eth: ChainLoading
  poly: ChainLoading
  avax: ChainLoading
  op: ChainLoading
}
export interface ChainLoading {
  stats: LoadingStatus
  deposits: LoadingStatus
  delegations: LoadingStatus
}