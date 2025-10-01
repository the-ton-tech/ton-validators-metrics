import { Address } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import { NominatorPoolData, loadNominatorPoolData } from "types";
import { getAccountState } from "./get-account-state";

/**
 * Retrieves the nominator pool data for a given pool address and block.
 * @param client - The LiteClient instance.
 * @param poolAddress - The address of the nominator pool.
 * @param block - The block ID.
 * @returns The nominator pool data.
 */
export async function getNominatorPoolData(
  client: LiteClient,
  poolAddress: Address,
  block: BlockID,
): Promise<NominatorPoolData> {
  const poolAccountState = await getAccountState(client, poolAddress, block);

  const poolState = poolAccountState.state.storage.state;
  if (poolState.type !== "active") {
    throw new Error(`Nominator pool account is not active`);
  }

  return loadNominatorPoolData(poolState.state.data.beginParse());
}
