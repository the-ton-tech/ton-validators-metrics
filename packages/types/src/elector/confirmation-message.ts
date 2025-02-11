import { Slice } from "@ton/core";

export const ELECTOR_CONFIRMATION_MESSAGE = 0xf374484c;

export type ElectorConfirmationMessage = {
  queryId: number;
};

export function isElectorConfirmationMessage(cs: Slice): boolean {
  return cs.preloadUint(32) === ELECTOR_CONFIRMATION_MESSAGE;
}

export function loadElectorConfirmationMessage(
  cs: Slice,
): ElectorConfirmationMessage {
  const op = cs.loadUint(32);
  if (op !== ELECTOR_CONFIRMATION_MESSAGE) {
    throw new Error(`Unexpected operation: ${op}`);
  }

  return {
    queryId: cs.loadUint(32),
  };
}
