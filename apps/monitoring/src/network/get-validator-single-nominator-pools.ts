import { Address } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import {
  isMessageInternal,
  isSingleNominatorPoolCodeHash,
  getSingleNominatorPoolContractType,
} from "types";
import { getAccountTransactions } from "./get-account-transactions";
import { getAccountState } from "./get-account-state";

/**
 * Retrieves the single nominator pools associated with a validator address.
 *
 * Single-nominator-pool contracts are filtered by their code hash to distinguish
 * them from nominator-pool contracts.
 *
 * The key difference is that a validator typically has ONE single-nominator-pool,
 * whereas they might have TWO or more nominator-pools.
 *
 * @param client - The LiteClient instance.
 * @param address - The validator address.
 * @param block - The block ID.
 * @returns Array of single nominator pool addresses with their contract types.
 */
export async function getValidatorSingleNominatorPools(
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

      if (op !== 0x4e73744b) {
        continue;
      }

      pools.add(outMsg.info.dest.toString());
    } catch (e) {
      continue;
    }
  }

  // Filter pools by code hash to only return single nominator pools with contract types
  const poolAddresses = Array.from(pools).map((pool) => Address.parse(pool));
  const singleNominatorPools: Array<{
    address: Address;
    contractType: string;
  }> = [];

  for (const poolAddress of poolAddresses) {
    try {
      const accountState = await getAccountState(client, poolAddress, block);
      const state = accountState.state.storage.state;

      if (state.type !== "active") {
        continue;
      }

      if (!state.state.code) {
        throw new Error("Single nominator pool code is not set");
      }

      if (isSingleNominatorPoolCodeHash(state.state.code)) {
        const contractType = getSingleNominatorPoolContractType(
          state.state.code,
        );
        if (contractType) {
          singleNominatorPools.push({ address: poolAddress, contractType });
        }
      }
    } catch (e) {
      // Skip pools that we can't check
      continue;
    }
  }

  return singleNominatorPools;
}
