import { Address, Slice } from "@ton/core";

/**
 * Represents the data of a single nominator pool.
 *
 * Unlike the nominator-pool contract which supports multiple nominators and complex state,
 * the single-nominator-pool is designed for a single owner (the validator) and maintains
 * minimal state - just owner and validator addresses.
 *
 * Reference: https://github.com/ton-blockchain/mytonctrl/tree/master/mytoncore/contracts/single-nominator-pool
 */
export interface SingleNominatorPoolData {
  /**
   * The owner address (cold wallet that owns the funds).
   */
  ownerAddress: Address;
  /**
   * The validator address (hot wallet on the validator node).
   */
  validatorAddress: Address;
}

/**
 * Loads the single nominator pool data from the slice.
 *
 * Storage format:
 * storage#_ owner_address:MsgAddressInt validator_address:MsgAddressInt = Storage
 *
 * @param slice - The slice to load the data from.
 * @returns The single nominator pool data.
 */
export function loadSingleNominatorPoolData(
  slice: Slice,
): SingleNominatorPoolData {
  const ownerAddress = slice.loadAddress();
  const validatorAddress = slice.loadAddress();

  return {
    ownerAddress,
    validatorAddress,
  };
}
