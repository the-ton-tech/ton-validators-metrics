import { Transaction } from "@ton/core";

export function isTransactionSuccess<T extends Transaction>(
  transaction: T,
): boolean {
  // description should be generic
  const description = transaction.description;
  if (!(description.type === "generic")) {
    return false;
  }

  // check compute phase
  if (!(description.computePhase.type === "vm")) {
    return false;
  }
  if (!description.computePhase.success) {
    return false;
  }

  // check action phase
  if (!description.actionPhase.success) {
    return false;
  }

  return true;
}
