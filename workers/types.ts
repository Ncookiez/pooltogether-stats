
// Chain Type:
type Chain = 'eth' | 'poly' | 'avax' | 'op';

// Hash Type:
type Hash = `0x${string}`;

// Transaction Type:
type TX = DepositTX | WithdrawalTX | ClaimTX | DelegationCreatedTX | DelegationFundedTX | DelegationUpdatedTX | DelegationWithdrawnTX;

/* ====================================================================================================================================================== */

// Chain Data Interface:
interface ChainData {
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

/* ====================================================================================================================================================== */

// Data Type Interfaces:
interface DepositData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  amount: number
  chain?: Chain
}
interface WithdrawalData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  amount: number
}
interface ClaimData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  wallet: Hash
  prizes: number[]
}
interface DelegationCreatedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  delegatee: Hash
}
interface DelegationFundedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  amount: number
  chain?: Chain
}
interface DelegationUpdatedData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  newDelegatee: Hash
}
interface DelegationWithdrawnData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  delegator: Hash
  amount: number
}
interface YieldData {
  txHash: Hash
  block: number
  timestamp: number | undefined
  amount: number
}
interface WalletData {
  txs: TX[]
  currentBalance: number
}
interface SupplyData {
  block: number
  timestamp: number | undefined
  aave: number
  tickets: number
}
interface BalanceData {
  wallet: Hash
  balance: number
}
interface DrawData {
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

// Over Time Interfaces:
interface DepositsOverTime {
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
interface WithdrawalsOverTime {
  timestamps: number[]
  withdrawalAmounts: number[]
  withdrawalCounts: number[]
  uniqueWallets: number[]
  avgWithdrawalAmounts: number[]
  cumulativeWithdrawalAmounts: number[]
  cumulativeWithdrawalCounts: number[]
  cumulativeUniqueWallets: number[]
}
interface ClaimsOverTime {
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
interface TVLOverTime {
  timestamps: number[]
  tvls: number[]
}
interface DelegationsOverTime {
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
interface YieldOverTime {
  timestamps: number[]
  yieldAmounts: number[]
  yieldCounts: number[]
  cumulativeYieldAmounts: number[]
  cumulativeYieldCounts: number[]
}

/* ========================================================================================================================================================================= */

// Distribution Interfaces:
interface DepositDistribution {
  1: number[]
  10: number[]
  100: number[]
  1000: number[]
  10000: number[]
  100000: number[]
}
interface ClaimDistribution {
  1: number[]
  5: number[]
  10: number[]
  50: number[]
  100: number[]
  500: number[]
  1000: number[]
}
interface TVLDistribution {
  1: { amount: number, count: number }
  10: { amount: number, count: number }
  100: { amount: number, count: number }
  1000: { amount: number, count: number }
  10000: { amount: number, count: number }
  100000: { amount: number, count: number }
  1000000: { amount: number, count: number }
}

/* ========================================================================================================================================================================= */

// Transaction Interfaces:
interface DepositTX {
  chain?: Chain
  type: 'deposit'
  data: DepositData
}
interface WithdrawalTX {
  chain?: Chain
  type: 'withdrawal'
  data: WithdrawalData
}
interface ClaimTX {
  chain?: Chain
  type: 'claim'
  data: ClaimData
}
interface DelegationCreatedTX {
  chain?: Chain
  type: 'delegationCreated'
  data: DelegationCreatedData
}
interface DelegationFundedTX {
  chain?: Chain
  type: 'delegationFunded'
  data: DelegationFundedData
}
interface DelegationUpdatedTX {
  chain?: Chain
  type: 'delegationUpdated'
  data: DelegationUpdatedData
}
interface DelegationWithdrawnTX {
  chain?: Chain
  type: 'delegationWithdrawn'
  data: DelegationWithdrawnData
}

/* ====================================================================================================================================================== */

// PoolExplorer API Draw Reponse Interface:
interface ExplorerAPIDrawResponse {
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

/* ====================================================================================================================================================== */

// Draw History Event Data Interface:
interface DrawHistoryEventData {
  draws: Record<Chain, DrawData[]>
  selectedChains: Record<Chain, boolean>
}

// Deposit History Event Data Interface:
interface DepositHistoryEventData {
  deposits: Record<Chain, DepositData[]>
  selectedChains: Record<Chain, boolean>
}

// Delegation History Event Data Interface:
interface DelegationHistoryEventData {
  delegations: Record<Chain, DelegationFundedData[]>
  selectedChains: Record<Chain, boolean>
}