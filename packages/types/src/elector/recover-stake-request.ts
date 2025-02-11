import { Slice } from "@ton/core";

export const ELECTOR_RECOVER_STAKE_REQUEST = 0x47657424;

export type ElectorRecoverStakeRequest = {
  queryId: number;
};

export function isElectorRecoverStakeRequest(cs: Slice): boolean {
  return cs.preloadUint(32) === ELECTOR_RECOVER_STAKE_REQUEST;
}

export function loadElectorRecoverStakeRequest(
  cs: Slice,
): ElectorRecoverStakeRequest {
  const op = cs.loadUint(32);
  if (op !== ELECTOR_RECOVER_STAKE_REQUEST) {
    throw new Error(`Unexpected operation: ${op}`);
  }

  return {
    queryId: cs.loadUint(32),
  };
}
