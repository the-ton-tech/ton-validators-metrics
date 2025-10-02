import { Address, fromNano } from "@ton/ton";
import { BlockID, getLiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getValidatorSingleNominatorPools } from "../network/get-validator-single-nominator-pools";
import { getElectorData } from "../network/get-elector-data";
import { getNetworkConfig } from "../network/get-network-config";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updateSingleNominatorPoolsElectorBalance(): Promise<void> {
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
        updateSingleNominatorPoolElectorBalance(
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

async function updateSingleNominatorPoolElectorBalance(
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

  // Single nominator pools can have stakes in multiple elections simultaneously
  // We need to sum up all balances across different sources
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

  // Check ALL past elections, not just the active one
  // Single nominator pools can have frozen stakes in multiple past elections
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

  const poolElectBalance = totalPoolElectBalance;

  metrics.poolElectorBalance.set(label, parseFloat(fromNano(poolElectBalance)));

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.poolElectorBalanceUpdatedAt.set(label, currentAt);
  metrics.poolElectorBalanceUpdatedSeqno.set(label, masterAt.seqno);
}
