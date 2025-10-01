import { Address, fromNano } from "@ton/ton";
import { BlockID, getLiteClient, LiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getNominatorPoolData } from "../network/get-nominator-pool-data";
import { getValidatorNominatorPools } from "../network/get-validator-nominator-pools";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updatePools(): Promise<void> {
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
    const pools = await getValidatorNominatorPools(client, validator, masterAt);

    return Promise.all(
      pools.map((pool) =>
        updateNominatorPoolMetrics(client, masterAt, validator, pool, network),
      ),
    );
  });
  await Promise.all(tasks);
}

async function updateNominatorPoolMetrics(
  client: LiteClient,
  masterAt: BlockID,
  validator: Address,
  pool: Address,
  network: "mainnet" | "testnet",
): Promise<void> {
  const formattedValidatorAddress = toFriendlyFormat(validator, network);
  const formattedPoolAddress = toFriendlyFormat(pool, network);
  const label = {
    network,
    validator: formattedValidatorAddress,
    nominator_pool: formattedPoolAddress,
  };

  const poolData = await getNominatorPoolData(client, pool, masterAt);

  metrics.nominatorPoolState.set(label, poolData.state);
  metrics.nominatorPoolNominatorsCount.set(label, poolData.nominatorsCount);
  metrics.nominatorPoolStakeAmountSent.set(
    label,
    parseFloat(fromNano(poolData.stakeAmountSent)),
  );
  metrics.nominatorPoolValidatorAmount.set(
    label,
    parseFloat(fromNano(poolData.validatorAmount)),
  );
  metrics.nominatorPoolStakeAt.set(label, poolData.stakeAt);
  // use only first 4 bytes of the hash to reduce memory usage
  metrics.nominatorPoolSavedValidatorSetHash.set(
    label,
    poolData.savedValidatorSetHash.readUInt32BE(0),
  );
  metrics.nominatorPoolValidatorSetChangesCount.set(
    label,
    poolData.validatorSetChangesCount,
  );
  metrics.nominatorPoolValidatorSetChangeTime.set(
    label,
    poolData.validatorSetChangeTime,
  );
  metrics.nominatorPoolStakeHeldFor.set(label, poolData.stakeHeldFor);
  metrics.nominatorPoolValidatorRewardShare.set(
    label,
    poolData.config.validatorRewardShare,
  );
  metrics.nominatorPoolMaxNominatorsCount.set(
    label,
    poolData.config.maxNominatorsCount,
  );
  metrics.nominatorPoolMinValidatorStake.set(
    label,
    Number(poolData.config.minValidatorStake),
  );
  metrics.nominatorPoolMinNominatorStake.set(
    label,
    Number(poolData.config.minNominatorStake),
  );

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.nominatorPoolUpdateAt.set(label, currentAt);
  metrics.nominatorPoolUpdateSeqno.set(label, masterAt.seqno);
}
