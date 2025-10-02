import { Address, fromNano } from "@ton/ton";
import { BlockID, getLiteClient, LiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getSingleNominatorPoolData } from "../network/get-single-nominator-pool-data";
import { getValidatorSingleNominatorPools } from "../network/get-validator-single-nominator-pools";
import { getMasterchainInfo } from "../network/get-masterchain-info";
import { getElectorData } from "../network/get-elector-data";
import { getNetworkConfig } from "../network/get-network-config";

export async function updateSingleNominatorPools(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);
  const network = appConfig.network;

  const client = await getLiteClient(
    network === "mainnet"
      ? constants.mainnetGlobalConfig
      : constants.testnetGlobalConfig,
  );

  const masterAt = await getMasterchainInfo(client);

  const networkConfig = await getNetworkConfig(client, masterAt);
  const electorData = await getElectorData(
    client,
    networkConfig.electorAddress,
    masterAt,
  );

  const validators = appConfig.validators;
  const tasks = validators.map(async (validator) => {
    const pools = await getValidatorSingleNominatorPools(
      client,
      validator,
      masterAt,
    );

    return Promise.all(
      pools.map((poolInfo) =>
        updateSingleNominatorPoolMetrics(
          client,
          masterAt,
          validator,
          poolInfo.address,
          poolInfo.contractType,
          network,
          electorData,
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
  contractType: string,
  network: "mainnet" | "testnet",
  electorData: Awaited<ReturnType<typeof getElectorData>>,
): Promise<void> {
  const formattedValidatorAddress = toFriendlyFormat(validator, network);
  const formattedPoolAddress = toFriendlyFormat(pool, network, true);
  const label = {
    network,
    validator: formattedValidatorAddress,
    pool: formattedPoolAddress,
    contract_type: contractType,
  };

  // Get pool data to verify it's a valid single-nominator-pool contract
  await getSingleNominatorPoolData(client, pool, masterAt);

  // Calculate elector balance (sum from all elections)
  let totalPoolElectBalance = BigInt(0);

  // Check current election members
  const currentElectionBalance = Array.from(
    electorData.elect?.members.values() ?? [],
  ).find((member) => member.srcAddr.equals(pool))?.msgValue;

  if (currentElectionBalance) {
    totalPoolElectBalance += currentElectionBalance;
  }

  // Check credits (returns from previous elections)
  const creditsBalance = electorData.credits.get(pool.hash)?.amount;
  if (creditsBalance) {
    totalPoolElectBalance += creditsBalance;
  }

  // Check ALL past elections
  const pastElectionKeys = electorData.pastElections.keys();
  for (const electionId of pastElectionKeys) {
    const pastElection = electorData.pastElections.get(electionId);
    if (!pastElection) {
      continue;
    }

    const frozenBalance = Array.from(pastElection.frozenDict.values()).find(
      (frozen) => frozen.srcAddr.equals(pool),
    )?.trueStake;

    if (frozenBalance) {
      totalPoolElectBalance += frozenBalance;
    }
  }

  // Set pool state (0: not participating, 2: participating)
  const poolState = totalPoolElectBalance > 0 ? 2 : 0;

  // Set metrics according to the rules for single nominator pools
  metrics.poolState.set(label, poolState);
  metrics.poolNominatorsCount.set(label, 1); // Always 1
  metrics.poolStakeAmountSent.set(
    label,
    parseFloat(fromNano(totalPoolElectBalance)),
  ); // Elector balance
  metrics.poolValidatorAmount.set(label, 0); // Always 0
  metrics.poolStakeAt.set(label, 0); // Always 0
  metrics.poolSavedValidatorSetHash.set(label, 0); // Always 0
  metrics.poolValidatorSetChangesCount.set(label, 2); // Always 2
  metrics.poolValidatorSetChangeTime.set(label, 0); // Always 0
  metrics.poolStakeHeldFor.set(label, 0); // Always 0
  metrics.poolValidatorRewardShare.set(label, 0); // Always 0
  metrics.poolMaxNominatorsCount.set(label, 1); // Always 1
  metrics.poolMinValidatorStake.set(label, 0); // Always 0
  metrics.poolMinNominatorStake.set(label, 0); // Always 0

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.poolUpdateAt.set(label, currentAt);
  metrics.poolUpdateSeqno.set(label, masterAt.seqno);
}
