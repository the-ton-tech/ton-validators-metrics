import { Address } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import { SingleNominatorPoolData, loadSingleNominatorPoolData } from "types";
import { getAccountState } from "./get-account-state";

/**
 * Retrieves the single nominator pool data for a given pool address and block.
 * @param client - The LiteClient instance.
 * @param poolAddress - The address of the single nominator pool.
 * @param block - The block ID.
 * @returns The single nominator pool data.
 */
export async function getSingleNominatorPoolData(
  client: LiteClient,
  poolAddress: Address,
  block: BlockID,
): Promise<SingleNominatorPoolData> {
  const poolAccountState = await getAccountState(client, poolAddress, block);

  const poolState = poolAccountState.state.storage.state;
  if (poolState.type !== "active") {
    throw new Error(`Single nominator pool account is not active`);
  }

  return loadSingleNominatorPoolData(poolState.state.data.beginParse());
}
