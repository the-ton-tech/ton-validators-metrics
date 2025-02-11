import { BlockID, ClientAccountState, LiteClient } from "client";
import { Address } from "@ton/ton";
import { callForSuccess } from "utils";

/**
 * Retrieves the account state from the given client at a specific block.
 *
 * @param {LiteClient} client - The LiteClient used to retrieve the account state.
 * @param {Address} address - The address of the account.
 * @param {BlockID} block - The ID of the block at which to retrieve the account state.
 */
export async function getAccountState(
  client: LiteClient,
  address: Address,
  block: BlockID,
): Promise<ClientAccountState> {
  return callForSuccess(() => client.getAccountState(address, block));
}
