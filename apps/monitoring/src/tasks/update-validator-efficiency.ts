import { Address } from "@ton/ton";
import { getAppConfig } from "config";
import { toFriendlyFormat } from "types";
import { getLiteClient, BlockID } from "client";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getElectorData } from "../network/get-elector-data";
import { getNetworkConfig } from "../network/get-network-config";
import {
  getCycleScoreboard,
  CycleScoreboardEntry,
} from "../network/get-cycle-scoreboard";
import { getValidatorAdnl } from "../network/get-validator-adnl";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updateValidatorEfficiency(): Promise<void> {
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

  const currentCycleId = electorData.activeId.toString();

  try {
    const scoreboard = await getCycleScoreboard(currentCycleId);

    for (const validator of appConfig.validators) {
      const adnl = await getValidatorAdnl(client, validator, masterAt);

      if (!adnl) {
        console.log(
          "No ADNL address found for validator",
          toFriendlyFormat(validator, network)
        );
        continue;
      }

      await updateValidatorPoolsEfficiency(
        validator,
        adnl,
        network,
        currentCycleId,
        scoreboard,
        masterAt
      );
    }
  } catch (error) {
    console.error("Error fetching validator efficiency:", error);
  }
}

async function updateValidatorPoolsEfficiency(
  validator: Address,
  adnl: Buffer,
  network: "mainnet" | "testnet",
  currentCycleId: string,
  scoreboard: CycleScoreboardEntry[],
  masterAt: BlockID
): Promise<void> {
  const formattedValidatorAddress = toFriendlyFormat(validator, network);

  const entry = scoreboard.find((e: CycleScoreboardEntry) =>
    e.validator_adnl.equals(adnl)
  );

  const label = {
    network,
    validator: formattedValidatorAddress,
  };

  if (!entry) {
    console.log("No entry found for validator", formattedValidatorAddress);
    console.log("Validator ADNL:", adnl.toString("hex"));

    // Set participation status to 0 (not participating)
    metrics.validatorParticipationStatus.set(label, 0);
    // Set position to -1 (not found)
    metrics.validatorParticipationPosition.set(label, -1);
    return;
  }

  // Set participation status to 1 (participating)
  metrics.validatorParticipationStatus.set(label, 1);
  // Set position to validator's idx in list
  metrics.validatorParticipationPosition.set(label, entry.idx);

  metrics.validatorEfficiencyUpdatedAt.set(
    label,
    Math.floor(Date.now() / 1000)
  );
  metrics.validatorEfficiencyUpdatedSeqno.set(label, masterAt.seqno);
  metrics.validatorEfficiency.set(label, entry.efficiency);
  metrics.validatorEfficiencyCycleId.set(label, parseInt(currentCycleId, 10));
}
