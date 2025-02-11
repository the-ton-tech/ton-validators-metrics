import { Slice } from "@ton/core";

export const ELECTOR_RECOVER_STAKE_RESPONSE = 0xf96f7324;

export type ElectorRecoverStakeResponse = {
  queryId: number;
};

export function isElectorRecoverStakeResponse(cs: Slice): boolean {
  return cs.preloadUint(32) === ELECTOR_RECOVER_STAKE_RESPONSE;
}

export function loadElectorRecoverStakeResponse(
  cs: Slice,
): ElectorRecoverStakeResponse {
  const op = cs.loadUint(32);
  if (op !== ELECTOR_RECOVER_STAKE_RESPONSE) {
    throw new Error(`Unexpected operation: ${op}`);
  }

  return {
    queryId: cs.loadUint(32),
  };
}
