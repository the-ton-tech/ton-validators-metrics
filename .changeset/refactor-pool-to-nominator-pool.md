---
"types": minor
"monitoring": minor
---

Refactor nominator pool types and add contract type support

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
import { PoolData, loadPoolData } from 'types';

// After
import { NominatorPoolData, loadNominatorPoolData } from 'types';
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

