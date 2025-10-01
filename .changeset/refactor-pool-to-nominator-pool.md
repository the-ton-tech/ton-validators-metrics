---
"types": major
"monitoring": major
---

Refactor pool terminology to nominator-pool for better clarity and extensibility

This is a breaking change that renames all pool-related types, functions, and metrics to use the "nominator-pool" naming convention. This change prepares the codebase for supporting additional pool types in the future.

**Breaking Changes:**

### Types Package (`types`)
- Renamed directory: `pool/` → `nominator-pool/`
- Renamed types:
  - `PoolData` → `NominatorPoolData`
  - `PoolDataState` → `NominatorPoolDataState`
  - `PoolDataNominators` → `NominatorPoolDataNominators`
  - `PoolDataConfig` → `NominatorPoolDataConfig`
- Renamed function: `loadPoolData()` → `loadNominatorPoolData()`

### Monitoring Package (`monitoring`)
- Renamed files:
  - `get-pool-data.ts` → `get-nominator-pool-data.ts`
  - `get-validator-pools.ts` → `get-validator-nominator-pools.ts`
- Renamed functions:
  - `getPoolData()` → `getNominatorPoolData()`
  - `getValidatorPools()` → `getValidatorNominatorPools()`
- Renamed all Prometheus metrics from `pool_*` to `nominator_pool_*`:
  - `pool_state` → `nominator_pool_state`
  - `pool_balance` → `nominator_pool_balance`
  - `pool_elector_balance` → `nominator_pool_elector_balance`
  - And 18 other pool-related metrics
- Changed metric label from `pool` to `nominator_pool`

**Migration Guide:**

If you are consuming the `types` package:
```typescript
// Before
import { PoolData, loadPoolData } from 'types';

// After
import { NominatorPoolData, loadNominatorPoolData } from 'types';
```

If you are using the monitoring metrics in Prometheus/Grafana:
- Update all queries from `pool_*` to `nominator_pool_*`
- Update label selectors from `{pool="..."}` to `{nominator_pool="..."}`

