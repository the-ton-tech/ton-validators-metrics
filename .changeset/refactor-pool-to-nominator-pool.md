---
"types": minor
"monitoring": minor
---

Refactor pool metrics with contract type support and address format change

This is a breaking change that adds support for multiple pool contract types and changes the address format for pool metrics. The metrics now include a `contract_type` label to distinguish between different pool implementations.

**Breaking Changes:**

### Types Package (`types`)
- Renamed directory: `pool/` → `nominator-pool/`
- Renamed types:
  - `PoolData` → `NominatorPoolData`
  - `PoolDataState` → `NominatorPoolDataState`
  - `PoolDataNominators` → `NominatorPoolDataNominators`
  - `PoolDataConfig` → `NominatorPoolDataConfig`
- Renamed function: `loadPoolData()` → `loadNominatorPoolData()`
- Added code hash validation functions:
  - `isNominatorPoolCodeHash()` - validates nominator pool contracts
  - `isSingleNominatorPoolCodeHash()` - validates single nominator pool contracts

### Monitoring Package (`monitoring`)
- Renamed files:
  - `get-pool-data.ts` → `get-nominator-pool-data.ts`
  - `get-validator-pools.ts` → `get-validator-nominator-pools.ts`
- Renamed functions:
  - `getPoolData()` → `getNominatorPoolData()`
  - `getValidatorPools()` → `getValidatorNominatorPools()`
- **Address format changed**: Pool addresses now use **bounceable format** (was non-bounceable)
- **New label added**: All pool metrics now include `contract_type` label
- New label structure: `{network, validator, pool, contract_type}`
  - `contract_type` values: `"nominator"` or `"single_nominator"`

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
pool_balance{network="mainnet",validator="...",pool="Ef...",contract_type="nominator"}
pool_balance{network="mainnet",validator="...",pool="Ef...",contract_type="single_nominator"}

# Query by contract type
pool_balance{contract_type="nominator"}
pool_balance{contract_type="single_nominator"}

# Query both types together
sum(pool_balance{validator="..."}) by (contract_type)
```

**Important Changes:**
1. **New label**: `contract_type` added to all pool metrics - update your queries to include or filter by this label
2. **Address format**: Pool addresses changed from non-bounceable to bounceable format (`Uf...` → `Ef...` for mainnet, `0f...` → `kf...` for testnet) - update any hardcoded pool addresses in your dashboards and alerting rules

