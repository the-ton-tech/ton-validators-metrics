import { Address, Cell, loadTransaction, Transaction } from "@ton/core";
import { BlockID, LiteClient } from "client";
import { callForSuccess } from "utils";
import { getAccountState } from "./get-account-state";

export async function getAccountTransactions(
  client: LiteClient,
  address: Address,
  block: BlockID,
  limit: number = 16,
): Promise<Transaction[]> {
  const account = await getAccountState(client, address, block);
  const lt = account.lastTx.lt.toString();
  // convert bigint to Buffer 32 bytes
  const hash = Buffer.from(
    account.lastTx.hash.toString(16).padStart(64, "0"),
    "hex",
  );

  return callForSuccess(async () => {
    const result = await client.getAccountTransactions(
      address,
      lt,
      hash,
      limit,
    );
    const rawTransactions = Cell.fromBoc(result.transactions);
    return rawTransactions.map((cell) => loadTransaction(cell.beginParse()));
  });
}
