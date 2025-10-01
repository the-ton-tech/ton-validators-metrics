/**
 * Known code hashes for Nominator Pool contracts.
 *
 * Reference: https://github.com/ton-blockchain/nominator-pool
 */

import { Cell } from "@ton/core";

/**
 * Nominator Pool code hash
 */
export const NOMINATOR_POOL_CODE_HASH =
  "9a3ec14bc098f6b44064c305222caea2800f17dda85ee6a8198a7095ede10dcf";

/**
 * All known Nominator Pool code hashes
 */
export const NOMINATOR_POOL_CODE_HASHES = [NOMINATOR_POOL_CODE_HASH];

/**
 * Checks if a code hash matches any known Nominator Pool contract.
 *
 * @param code - The code hash to check (as Cell)
 * @returns true if the code hash matches a known Nominator Pool contract
 */
export function isNominatorPoolCodeHash(code: Cell): boolean {
  return NOMINATOR_POOL_CODE_HASHES.includes(code.hash().toString("hex"));
}
