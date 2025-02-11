import { Address, fromNano } from "@ton/ton";
import { BlockID, getLiteClient } from "client";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getValidatorPools } from "../network/get-validator-pools";
import { getElectorData } from "../network/get-elector-data";
import { getNetworkConfig } from "../network/get-network-config";
import { getMasterchainInfo } from "../network/get-masterchain-info";
export async function updatePoolsElectorBalance(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);
  const network = appConfig.network;

  const client = await getLiteClient(
    network === "mainnet"
      ? constants.mainnetGlobalConfig
      : constants.testnetGlobalConfig
  );

  const masterAt = await getMasterchainInfo(client);

  const networkConfig = await getNetworkConfig(client, masterAt);
  const electorData = await getElectorData(
    client,
    networkConfig.electorAddress,
    masterAt
  );

  const validators = appConfig.validators;
  const tasks = validators.map(async (validator) => {
    const pools = await getValidatorPools(client, validator, masterAt);

    return Promise.all(
      pools.map((pool) =>
        updatePoolElectorBalance(
          masterAt,
          validator,
          pool,
          network,
          electorData
        )
      )
    );
  });
  await Promise.all(tasks);
}

async function updatePoolElectorBalance(
  masterAt: BlockID,
  validator: Address,
  pool: Address,
  network: "mainnet" | "testnet",
  electorData: Awaited<ReturnType<typeof getElectorData>>
): Promise<void> {
  const formattedValidatorAddress = toFriendlyFormat(validator, network);
  const formattedPoolAddress = toFriendlyFormat(pool, network);
  const label = {
    network,
    validator: formattedValidatorAddress,
    pool: formattedPoolAddress,
  };

  const poolAddressBigint = BigInt(`0x${pool.hash.toString("hex")}`);

  let poolElectBalance = Array.from(
    electorData.elect?.members.values() ?? []
  ).find((member) => member.srcAddr.equals(pool))?.msgValue;

  if (!poolElectBalance) {
    poolElectBalance = electorData.credits.get(poolAddressBigint)?.amount;
  }

  if (!poolElectBalance) {
    const activeId = electorData.activeId;
    poolElectBalance = Array.from(
      electorData.pastElections.get(activeId)?.frozenDict.values()
    ).find((frozen) => frozen.srcAddr.equals(pool))?.trueStake;
  }

  if (!poolElectBalance) {
    poolElectBalance = BigInt(0);
  }

  metrics.poolElectorBalance.set(label, parseFloat(fromNano(poolElectBalance)));

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.poolElectorBalanceUpdatedAt.set(label, currentAt);
  metrics.poolElectorBalanceUpdatedSeqno.set(label, masterAt.seqno);
}
