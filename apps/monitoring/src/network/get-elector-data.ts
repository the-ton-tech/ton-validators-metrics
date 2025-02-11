import { Address } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import { ElectorData, loadElectorData } from "types";
import { getAccountState } from "./get-account-state";

export async function getElectorData(
  client: LiteClient,
  elector: Address,
  block: BlockID,
): Promise<ElectorData> {
  const electorAccountState = await getAccountState(client, elector, block);

  const electorState = electorAccountState.state.storage.state;
  if (electorState.type !== "active") {
    throw new Error(`Elector account is not active`);
  }

  return loadElectorData(electorState.state.data.beginParse());
}
