import { getLiteClient } from "client";
import { getAppConfig } from "config";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getElectorData } from "../network/get-elector-data";
import { getNetworkConfig } from "../network/get-network-config";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updateElection(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);

  // get lite client
  const client = await getLiteClient(
    appConfig.network === "mainnet"
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

  // validatorsElectedFor
  metrics.validatorsElectedFor.set(
    { network: appConfig.network },
    networkConfig.validators.validatorsElectedFor
  );
  // electionsStartBefore
  metrics.electionsStartBefore.set(
    { network: appConfig.network },
    networkConfig.validators.electorsStartBefore
  );
  // electionsEndBefore
  metrics.electionsEndBefore.set(
    { network: appConfig.network },
    networkConfig.validators.electorsEndBefore
  );
  // stakeHeldFor
  metrics.stakeHeldFor.set(
    { network: appConfig.network },
    networkConfig.validators.stakeHeldFor
  );
  // validationCycledId
  metrics.validationCycledId.set(
    { network: appConfig.network },
    parseInt(electorData.activeId.toString(), 10)
  );
  // validationUnfreezeAt
  metrics.validationUnfreezeAt.set(
    { network: appConfig.network },
    electorData.pastElections.get(electorData.activeId).unfreezeAt
  );
  // electionsDataUpdatedAt
  const currentAt = Math.floor(Date.now() / 1000);
  metrics.electionsDataUpdatedAt.set({ network: appConfig.network }, currentAt);
  // electionsDataUpdatedSeqno
  const currentSeqno = masterAt.seqno;
  metrics.electionsDataUpdatedSeqno.set(
    { network: appConfig.network },
    currentSeqno
  );
}
