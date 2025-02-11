import { Address } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import { PoolData, loadPoolData } from "types";
import { getAccountState } from "./get-account-state";

/**
 * Retrieves the pool data for a given pool address and block.
 * @param client - The LiteClient instance.
 * @param poolAddress - The address of the pool.
 * @param block - The block ID.
 * @returns The pool data.
 */
export async function getPoolData(
  client: LiteClient,
  poolAddress: Address,
  block: BlockID
): Promise<PoolData> {
  const poolAccountState = await getAccountState(client, poolAddress, block);

  const poolState = poolAccountState.state.storage.state;
  if (poolState.type !== "active") {
    throw new Error(`Pool account is not active`);
  }

  return loadPoolData(poolState.state.data.beginParse());
}
