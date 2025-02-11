import { Slice } from "@ton/core";

export const ELECTOR_NEW_STAKE_MESSAGE = 0x4e73744b;

export type ElectorNewStakeMessage = {
  queryId: number;
  validatorPublicKey: Buffer;
  stakeAt: number;
  maxFactor: number;
  adnlAddr: Buffer;
  signature: Buffer;
};

export function isElectorNewStakeMessage(cs: Slice): boolean {
  return cs.preloadUint(32) === ELECTOR_NEW_STAKE_MESSAGE;
}

export function loadElectorNewStakeMessage(cs: Slice): ElectorNewStakeMessage {
  const op = cs.loadUint(32);
  if (op !== ELECTOR_NEW_STAKE_MESSAGE) {
    throw new Error(`Unexpected operation: ${op}`);
  }

  return {
    queryId: cs.loadUint(32),
    validatorPublicKey: cs.loadBuffer(32),
    stakeAt: cs.loadUint(32),
    maxFactor: cs.loadUint(32),
    adnlAddr: cs.loadBuffer(32),
    signature: cs.loadRef().beginParse().loadBuffer(64),
  };
}
