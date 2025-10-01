/**
 * Known code hashes for Single Nominator Pool contracts.
 *
 * Reference: https://github.com/ton-blockchain/mytonctrl/tree/master/mytoncore/contracts/single-nominator-pool
 */

import { Cell } from "@ton/core";

/**
 * Single Nominator Pool v1.0 code hash
 */
export const SINGLE_NOMINATOR_POOL_V1_0_CODE_HASH =
  "a42ae69eac76ffe0e452d3d4f13d387a14e46c01a5aadba5fc1d893e6c71f5ba";

/**
 * Single Nominator Pool v1.1 code hash (with withdrawals by comment)
 */
export const SINGLE_NOMINATOR_POOL_V1_1_CODE_HASH =
  "cc0d39589eb2c0cfe0fde28456657a3bdd3d953955ae3f98f25664ab3c904fbd";

/**
 * All known Single Nominator Pool code hashes
 */
export const SINGLE_NOMINATOR_POOL_CODE_HASHES = [
  SINGLE_NOMINATOR_POOL_V1_0_CODE_HASH,
  SINGLE_NOMINATOR_POOL_V1_1_CODE_HASH,
];

/**
 * Checks if a code hash matches any known Single Nominator Pool contract.
 *
 * @param code - The code hash to check (as Cell)
 * @returns true if the code hash matches a known Single Nominator Pool contract
 */
export function isSingleNominatorPoolCodeHash(code: Cell): boolean {
  return SINGLE_NOMINATOR_POOL_CODE_HASHES.includes(
    code.hash().toString("hex"),
  );
}
