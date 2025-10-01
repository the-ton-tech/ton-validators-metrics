import { Address } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import { isMessageInternal } from "types";
import { getAccountTransactions } from "./get-account-transactions";

export async function getValidatorNominatorPools(
  client: LiteClient,
  address: Address,
  block: BlockID,
): Promise<Address[]> {
  const limit = 32;
  const transactions = await getAccountTransactions(
    client,
    address,
    block,
    limit,
  );

  const pools = new Set<string>();
  for (const transaction of transactions) {
    try {
      if (transaction.outMessages.size !== 1) {
        continue;
      }

      const outMsgs = Array.from(transaction.outMessages.values());
      const outMsg = outMsgs[0];
      if (!isMessageInternal(outMsg)) {
        continue;
      }

      const body = outMsg.body;
      const cs = body.beginParse();
      const op = cs.loadUint(32);

      if (op !== 0x00000006) {
        continue;
      }

      pools.add(outMsg.info.dest.toString());
    } catch (e) {
      continue;
    }
  }

  return Array.from(pools).map((pool) => Address.parse(pool));
}
