import { Address, fromNano } from "@ton/ton";
import { BlockID, getLiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getValidatorNominatorPools } from "../network/get-validator-nominator-pools";
import { getElectorData } from "../network/get-elector-data";
import { getNetworkConfig } from "../network/get-network-config";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updateNominatorPoolsElectorBalance(): Promise<void> {
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
    const pools = await getValidatorNominatorPools(client, validator, masterAt);

    return Promise.all(
      pools.map((poolInfo) =>
        updateNominatorPoolElectorBalance(
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

async function updateNominatorPoolElectorBalance(
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

  let poolElectBalance = Array.from(
    electorData.elect?.members.values() ?? [],
  ).find((member) => member.srcAddr.equals(pool))?.msgValue;

  if (!poolElectBalance) {
    poolElectBalance = electorData.credits.get(pool.hash)?.amount;
  }

  if (!poolElectBalance) {
    const activeId = electorData.activeId;
    poolElectBalance = Array.from(
      electorData.pastElections.get(activeId)?.frozenDict.values(),
    ).find((frozen) => frozen.srcAddr.equals(pool))?.trueStake;
  }

  if (!poolElectBalance) {
    for (const electionId of electorData.pastElections.keys()) {
      const pastElection = electorData.pastElections.get(electionId);
      if (!pastElection) {
        continue;
      }

      const frozenBalance = Array.from(pastElection.frozenDict.values()).find(
        (frozen) => frozen.srcAddr.equals(pool),
      )?.trueStake;

      if (!frozenBalance) {
        continue;
      }

      poolElectBalance = frozenBalance;
      break;
    }
  }

  if (!poolElectBalance) {
    poolElectBalance = BigInt(0);
  }

  metrics.poolElectorBalance.set(label, parseFloat(fromNano(poolElectBalance)));

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.poolElectorBalanceUpdatedAt.set(label, currentAt);
  metrics.poolElectorBalanceUpdatedSeqno.set(label, masterAt.seqno);
}
