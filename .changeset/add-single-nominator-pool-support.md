---
"types": minor
"monitoring": minor
---

Add support for Single Nominator Pool contracts

Adds monitoring support for [Single Nominator Pool](https://github.com/ton-blockchain/mytonctrl/tree/master/mytoncore/contracts/single-nominator-pool) contracts (v1.0 and v1.1). All pool metrics now include a `contract_type` label to distinguish between different pool implementations.

**New Types Package Exports:**
- `SingleNominatorPoolData` - contract storage interface
- `loadSingleNominatorPoolData()` - storage parser
- `SINGLE_NOMINATOR_POOL_V1_0_CODE_HASH` - code hash constant for v1.0
- `SINGLE_NOMINATOR_POOL_V1_1_CODE_HASH` - code hash constant for v1.1
- `SINGLE_NOMINATOR_POOL_CODE_HASHES` - array of all single nominator pool code hashes
- `isSingleNominatorPoolCodeHash()` - code hash validator
- `getSingleNominatorPoolContractType()` - returns contract name with version (e.g., "single-nominator-pool-v1.0")
- `NOMINATOR_POOL_CODE_HASH` - code hash constant for nominator pool
- `NOMINATOR_POOL_CODE_HASHES` - array of all nominator pool code hashes
- `isNominatorPoolCodeHash()` - code hash validator for nominator pools
- `getNominatorPoolContractType()` - returns contract name with version (e.g., "nominator-pool-v1.0")
- `getPoolContractType()` - universal function to get contract type from any pool code

**Metrics Enhancement:**
All existing `pool_*` metrics now include a `contract_type` label with values:
- `"nominator-pool-v1.0"` - for standard nominator pools
- `"single-nominator-pool-v1.0"` - for single nominator pool v1.0
- `"single-nominator-pool-v1.1"` - for single nominator pool v1.1 (with withdrawal by comment support)

This allows unified querying and filtering by pool type:
```promql
# Query specific pool type
pool_balance{contract_type="single-nominator-pool-v1.1"}

# Aggregate by type
sum(pool_balance) by (contract_type)
```

**Pool Discovery:** Validators are automatically scanned for both nominator pools and single nominator pools, with code hash validation ensuring correct contract parsing.

