# types

## 1.1.0

### Minor Changes

- 14f7e0e: Add support for Single Nominator Pool contracts

  Adds monitoring support for [Single Nominator Pool](https://github.com/ton-blockchain/mytonctrl/tree/master/mytoncore/contracts/single-nominator-pool) contracts (v1.0 and v1.1). Single nominator pools are simpler contracts designed for single-validator staking across multiple validation rounds.

  **New Types Package Exports:**

  - `SingleNominatorPoolData` - contract storage interface
  - `loadSingleNominatorPoolData()` - storage parser
  - `SINGLE_NOMINATOR_POOL_V1_0_CODE_HASH` - code hash constant for v1.0
  - `SINGLE_NOMINATOR_POOL_V1_1_CODE_HASH` - code hash constant for v1.1 (with withdrawal by comment)
  - `SINGLE_NOMINATOR_POOL_CODE_HASHES` - array of all code hashes
  - `isSingleNominatorPoolCodeHash()` - code hash validator
  - `getSingleNominatorPoolContractType()` - returns contract type with version
  - `getPoolContractType()` - universal function to detect any pool contract type

  **New Monitoring Tasks:**

  - `updateSingleNominatorPools` - updates single nominator pool metrics
  - `updateSingleNominatorPoolsBalance` - updates balance metrics
  - `updateSingleNominatorPoolsElectorBalance` - updates elector balance (sums across all elections)
  - `getValidatorSingleNominatorPools()` - discovers single nominator pools for a validator

  **Metrics:**
  Single nominator pools are tracked using the same `pool_*` metrics with these `contract_type` label values:

  - `"single-nominator-pool-v1.0"` - version 1.0
  - `"single-nominator-pool-v1.1"` - version 1.1 (with withdrawal by comment support)

  Special metric behaviors for single nominator pools:

  - `pool_state`: 2 (participating) when balance > 0, otherwise 0 (not participating)
  - `pool_nominators_count`: Always 1 (single owner)
  - `pool_stake_amount_sent`: Set to elector balance
  - `pool_elector_balance`: Sum of current election + credits + all past elections

  Example queries:

  ```promql
  # Query single nominator pools only
  pool_balance{contract_type=~"single-nominator-pool.*"}

  # Compare pool types
  sum(pool_balance) by (contract_type)

  # Query specific version
  pool_balance{contract_type="single-nominator-pool-v1.1"}
  ```

  **Pool Discovery:** Validators are automatically scanned for single nominator pools using transaction history analysis with code hash validation to ensure correct contract parsing.

- 7a749fb: Refactor nominator pool types and add contract type support

  This change refactors the existing nominator pool implementation to support multiple pool contract types and changes the address format for pool metrics.

  **Breaking Changes:**

  ### Types Package (`types`)

  - Renamed directory: `pool/` → `nominator-pool/`
  - Renamed types:
    - `PoolData` → `NominatorPoolData`
    - `PoolDataState` → `NominatorPoolDataState`
    - `PoolDataNominators` → `NominatorPoolDataNominators`
    - `PoolDataConfig` → `NominatorPoolDataConfig`
  - Renamed function: `loadPoolData()` → `loadNominatorPoolData()`
  - Added code hash validation:
    - `NOMINATOR_POOL_CODE_HASH` - code hash constant
    - `NOMINATOR_POOL_CODE_HASHES` - array of code hashes
    - `isNominatorPoolCodeHash()` - validates nominator pool contracts
    - `getNominatorPoolContractType()` - returns "nominator-pool-v1.0"

  ### Monitoring Package (`monitoring`)

  - Renamed functions:
    - `getPoolData()` → `getNominatorPoolData()`
    - `getValidatorPools()` → `getValidatorNominatorPools()`
  - **Address format changed**: Pool addresses now use **bounceable format** (was non-bounceable)
  - **New label added**: All pool metrics now include `contract_type` label
  - New label structure: `{network, validator, pool, contract_type}`

  **Migration Guide:**

  If you are consuming the `types` package:

  ```typescript
  // Before
  import { PoolData, loadPoolData } from "types";

  // After
  import { NominatorPoolData, loadNominatorPoolData } from "types";
  ```

  If you are using the monitoring metrics in Prometheus/Grafana:

  ```promql
  # Before
  pool_balance{network="mainnet",validator="...",pool="Uf..."}

  # After - with contract_type label and bounceable addresses
  pool_balance{network="mainnet",validator="...",pool="Ef...",contract_type="nominator-pool-v1.0"}

  # Query by contract type
  pool_balance{contract_type="nominator-pool-v1.0"}

  # Aggregate across all validators
  sum(pool_balance) by (contract_type)
  ```

  **Important Changes:**

  1. **New label**: `contract_type` added to all pool metrics - update your queries to include or filter by this label
  2. **Address format**: Pool addresses changed from non-bounceable to bounceable format (`Uf...` → `Ef...` for mainnet, `0f...` → `kf...` for testnet) - update any hardcoded pool addresses in your dashboards and alerting rules
