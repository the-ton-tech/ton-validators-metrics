import { Address, fromNano } from "@ton/ton";
import { BlockID, getLiteClient, LiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getPoolData } from "../network/get-pool-data";
import { getValidatorPools } from "../network/get-validator-pools";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updatePools(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);
  const network = appConfig.network;

  const client = await getLiteClient(
    network === "mainnet"
      ? constants.mainnetGlobalConfig
      : constants.testnetGlobalConfig
  );

  const masterAt = await getMasterchainInfo(client);

  const validators = appConfig.validators;
  const tasks = validators.map(async (validator) => {
    const pools = await getValidatorPools(client, validator, masterAt);

    return Promise.all(
      pools.map((pool) =>
        updatePoolMetrics(client, masterAt, validator, pool, network)
      )
    );
  });
  await Promise.all(tasks);
}

async function updatePoolMetrics(
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

  const poolData = await getPoolData(client, pool, masterAt);

  metrics.poolState.set(label, poolData.state);
  metrics.poolNominatorsCount.set(label, poolData.nominatorsCount);
  metrics.poolStakeAmountSent.set(
    label,
    parseFloat(fromNano(poolData.stakeAmountSent))
  );
  metrics.poolValidatorAmount.set(
    label,
    parseFloat(fromNano(poolData.validatorAmount))
  );
  metrics.poolStakeAt.set(label, poolData.stakeAt);
  // use only first 4 bytes of the hash to reduce memory usage
  metrics.poolSavedValidatorSetHash.set(
    label,
    poolData.savedValidatorSetHash.readUInt32BE(0)
  );
  metrics.poolValidatorSetChangesCount.set(
    label,
    poolData.validatorSetChangesCount
  );
  metrics.poolValidatorSetChangeTime.set(
    label,
    poolData.validatorSetChangeTime
  );
  metrics.poolStakeHeldFor.set(label, poolData.stakeHeldFor);
  metrics.poolValidatorRewardShare.set(
    label,
    poolData.config.validatorRewardShare
  );
  metrics.poolMaxNominatorsCount.set(label, poolData.config.maxNominatorsCount);
  metrics.poolMinValidatorStake.set(
    label,
    Number(poolData.config.minValidatorStake)
  );
  metrics.poolMinNominatorStake.set(
    label,
    Number(poolData.config.minNominatorStake)
  );

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.poolUpdateAt.set(label, currentAt);
  metrics.poolUpdateSeqno.set(label, masterAt.seqno);
}
