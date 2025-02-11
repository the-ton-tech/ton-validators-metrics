import { Address } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import { getAccountTransactions } from "./get-account-transactions";

const PROCESS_NEW_STAKE = 0x4e73744b;

export async function getValidatorAdnl(
  client: LiteClient,
  validator: Address,
  block: BlockID
): Promise<Buffer | null> {
  const transactions = await getAccountTransactions(
    client,
    validator,
    block,
    32
  );

  for (const transaction of transactions) {
    for (const message of transaction.outMessages.values()) {
      if (message.info.type !== "internal") continue;

      const body = message.body.beginParse();
      if (body.remainingBits < 32) continue;

      const op = body.preloadUint(32);
      if (op !== PROCESS_NEW_STAKE) continue;

      body.loadUint(32); // skip op
      body.loadUint(64); // skip query id
      body.loadCoins(); // skip coins
      body.loadBuffer(256 / 8); // skip validator pubkey
      body.loadUint(32); // skip stake_at
      body.loadUint(32); // skip max_factor
      const adnlAddr = body.loadBuffer(256 / 8);

      return adnlAddr;
    }
  }

  return null;
}
