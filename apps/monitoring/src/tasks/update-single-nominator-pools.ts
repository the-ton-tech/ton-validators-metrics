import { Address } from "@ton/ton";
import { BlockID, getLiteClient, LiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getSingleNominatorPoolData } from "../network/get-single-nominator-pool-data";
import { getValidatorSingleNominatorPools } from "../network/get-validator-single-nominator-pools";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updateSingleNominatorPools(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);
  const network = appConfig.network;

  const client = await getLiteClient(
    network === "mainnet"
      ? constants.mainnetGlobalConfig
      : constants.testnetGlobalConfig,
  );

  const masterAt = await getMasterchainInfo(client);

  const validators = appConfig.validators;
  const tasks = validators.map(async (validator) => {
    const pools = await getValidatorSingleNominatorPools(
      client,
      validator,
      masterAt,
    );

    return Promise.all(
      pools.map((pool) =>
        updateSingleNominatorPoolMetrics(
          client,
          masterAt,
          validator,
          pool,
          network,
        ),
      ),
    );
  });
  await Promise.all(tasks);
}

async function updateSingleNominatorPoolMetrics(
  client: LiteClient,
  masterAt: BlockID,
  validator: Address,
  pool: Address,
  network: "mainnet" | "testnet",
): Promise<void> {
  const formattedValidatorAddress = toFriendlyFormat(validator, network);
  const formattedPoolAddress = toFriendlyFormat(pool, network, true);
  const label = {
    network,
    validator: formattedValidatorAddress,
    single_nominator_pool: formattedPoolAddress,
  };

  // Get pool data to verify it's a valid single-nominator-pool contract
  console.log("Getting single nominator pool data for", formattedPoolAddress);
  await getSingleNominatorPoolData(client, pool, masterAt);

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.singleNominatorPoolUpdateAt.set(label, currentAt);
  metrics.singleNominatorPoolUpdateSeqno.set(label, masterAt.seqno);
}
