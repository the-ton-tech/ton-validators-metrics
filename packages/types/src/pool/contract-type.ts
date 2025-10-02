import { Cell } from "@ton/core";
import { getNominatorPoolContractType } from "../nominator-pool/code-hash";
import { getSingleNominatorPoolContractType } from "../single-nominator-pool/code-hash";

/**
 * Gets the contract type identifier from a pool contract code hash.
 *
 * This function checks against all known pool contract types and returns
 * a descriptive string including the contract name and version.
 *
 * @param code - The contract code as Cell
 * @returns Contract type string or null if not recognized
 *
 * @example
 * ```typescript
 * const contractType = getPoolContractType(code);
 * // Returns: "nominator-pool" or "single-nominator-pool-v1.0" or "single-nominator-pool-v1.1"
 * ```
 */
export function getPoolContractType(code: Cell): string | null {
  // Check nominator pool
  const nominatorPoolType = getNominatorPoolContractType(code);
  if (nominatorPoolType) {
    return nominatorPoolType;
  }

  // Check single nominator pool
  const singleNominatorPoolType = getSingleNominatorPoolContractType(code);
  if (singleNominatorPoolType) {
    return singleNominatorPoolType;
  }

  return null;
}
