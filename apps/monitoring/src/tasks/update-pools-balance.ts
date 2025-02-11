import { Address, fromNano } from "@ton/core";
import { BlockID, getLiteClient, LiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getAccountState } from "../network/get-account-state";
import { getValidatorPools } from "../network/get-validator-pools";
import { getMasterchainInfo } from "../network/get-masterchain-info";
export async function updatePoolsBalance(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);
  const network = appConfig.network;

  // get lite client
  const client = await getLiteClient(
    network === "mainnet"
      ? constants.mainnetGlobalConfig
      : constants.testnetGlobalConfig
  );

  // get masterchain info
  const masterAt = await getMasterchainInfo(client);

  const validators = appConfig.validators;
  const tasks = validators.map(async (validator) => {
    const pools = await getValidatorPools(client, validator, masterAt);
    return Promise.all(
      pools.map((pool) =>
        updatePoolBalance(client, masterAt, validator, pool, network)
      )
    );
  });
  await Promise.all(tasks);
}

async function updatePoolBalance(
  client: LiteClient,
  masterAt: BlockID,
  validator: Address,
  pool: Address,
  network: "mainnet" | "testnet"
): Promise<void> {
  const formattedValidatorAddress = toFriendlyFormat(validator, network);
  const formattedPoolAddress = toFriendlyFormat(pool, network);
  const label = {
    network,
    validator: formattedValidatorAddress,
    pool: formattedPoolAddress,
  };

  const account = await getAccountState(client, pool, masterAt);
  const balance = account.state.storage.balance.coins;
  const formattedBalance = parseFloat(fromNano(balance));

  metrics.poolBalance.set(label, formattedBalance);

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.poolBalanceUpdatedAt.set(label, currentAt);

  const currentSeqno = masterAt.seqno;
  metrics.poolBalanceUpdatedSeqno.set(label, currentSeqno);
}
