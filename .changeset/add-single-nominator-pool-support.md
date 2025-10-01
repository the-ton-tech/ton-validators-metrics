---
"types": minor
"monitoring": minor
---

Add support for Single Nominator Pool contracts with code hash validation

Adds monitoring support for [Single Nominator Pool](https://github.com/ton-blockchain/mytonctrl/tree/master/mytoncore/contracts/single-nominator-pool) contracts. Both pool types are now distinguished by their code hash to prevent parsing errors.

**New Exports:**
- `SingleNominatorPoolData` - contract storage interface
- `loadSingleNominatorPoolData()` - storage parser
- `isSingleNominatorPoolCodeHash()` - code hash validator (v1.0 & v1.1)
- `isNominatorPoolCodeHash()` - code hash validator for nominator pools

**New Metrics:**
- `single_nominator_pool_balance` - pool contract balance
- `single_nominator_pool_elector_balance` - balance in elector contract
- Update tracking metrics: `*_updated_at`, `*_updated_seqno`

**Pool Discovery:** Validators are scanned for both pool types, filtered by code hash to ensure correct parsing.

