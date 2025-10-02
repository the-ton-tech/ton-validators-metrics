---
"types": minor
"monitoring": minor
---

Add support for Single Nominator Pool contracts

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

