import { Transaction } from "@ton/core";
import { RequiredProperty } from "utils";

type TransactionWithInMessage<T extends Transaction> = RequiredProperty<
  T,
  "inMessage"
>;

export function hasInMessage<T extends Transaction>(
  transaction: T,
): transaction is TransactionWithInMessage<T> {
  return transaction.inMessage !== undefined;
}
