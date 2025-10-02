import { Address } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import {
  isMessageInternal,
  isNominatorPoolCodeHash,
  getNominatorPoolContractType,
} from "types";
import { getAccountTransactions } from "./get-account-transactions";
import { getAccountState } from "./get-account-state";

export async function getValidatorNominatorPools(
  client: LiteClient,
  address: Address,
  block: BlockID,
): Promise<Array<{ address: Address; contractType: string }>> {
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

  // Filter pools by code hash to only return nominator pools with contract types
  const poolAddresses = Array.from(pools).map((pool) => Address.parse(pool));
  const nominatorPools: Array<{ address: Address; contractType: string }> = [];

  for (const poolAddress of poolAddresses) {
    try {
      const accountState = await getAccountState(client, poolAddress, block);
      const state = accountState.state.storage.state;

      if (state.type === "active" && state.state.code) {
        if (isNominatorPoolCodeHash(state.state.code)) {
          const contractType = getNominatorPoolContractType(state.state.code);
          if (contractType) {
            nominatorPools.push({ address: poolAddress, contractType });
          }
        }
      }
    } catch (e) {
      // Skip pools that we can't check
      continue;
    }
  }

  return nominatorPools;
}
