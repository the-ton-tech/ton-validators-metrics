import { Address, fromNano } from "@ton/core";
import { BlockID, getLiteClient, LiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getAccountState } from "../network/get-account-state";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updateValidatorsBalance(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);
  const network = appConfig.network;

  // get lite client
  const client = await getLiteClient(
    network === "mainnet"
      ? constants.mainnetGlobalConfig
      : constants.testnetGlobalConfig,
  );

  // get masterchain info
  const masterAt = await getMasterchainInfo(client);

  const validators = appConfig.validators;
  const tasks = validators.map((validator) =>
    updateValidatorBalance(client, masterAt, validator, network),
  );
  await Promise.all(tasks);
}

async function updateValidatorBalance(
  client: LiteClient,
  masterAt: BlockID,
  validator: Address,
  network: "mainnet" | "testnet",
): Promise<void> {
  const formattedAddress = toFriendlyFormat(validator, network);
  const label = { network, validator: formattedAddress };

  const account = await getAccountState(client, validator, masterAt);
  const balance = account.state.storage.balance.coins;
  const formattedBalance = parseFloat(fromNano(balance));

  metrics.validatorBalance.set(label, formattedBalance);

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.validatorBalanceUpdatedAt.set(label, currentAt);

  const currentSeqno = masterAt.seqno;
  metrics.validatorBalanceUpdatedSeqno.set(label, currentSeqno);
}
