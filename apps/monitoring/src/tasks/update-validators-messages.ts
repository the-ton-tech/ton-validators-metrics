import { Address, Message, Slice } from "@ton/core";
import { BlockID, getLiteClient, LiteClient } from "client";
import { getAppConfig } from "config";
import { Gauge } from "prom-client";
import {
  isMessageFrom,
  isMessageInternal,
  loadElectorNewStakeMessage,
  loadElectorRecoverStakeRequest,
  parseMessageBody,
  toFriendlyFormat,
} from "types";
import { constants } from "../constants";
import { metrics } from "../metrics";
import { getAccountTransactions } from "../network/get-account-transactions";
import { getMasterchainInfo } from "../network/get-masterchain-info";

export async function updateValidatorsMessages(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);

  // get lite client
  const client = await getLiteClient(
    appConfig.network === "mainnet"
      ? constants.mainnetGlobalConfig
      : constants.testnetGlobalConfig,
  );

  const masterAt = await getMasterchainInfo(client);

  const validators = appConfig.validators;
  const tasks = validators.map(async (validator) =>
    updateValidatorMessages(client, masterAt, validator, appConfig.network),
  );
  await Promise.all(tasks);
}

async function updateValidatorMessages(
  client: LiteClient,
  masterAt: BlockID,
  validator: Address,
  network: "mainnet" | "testnet",
): Promise<void> {
  const transactions = await getAccountTransactions(
    client,
    validator,
    masterAt,
  );

  const outMessages = transactions
    .flatMap((p) => p.outMessages.values())
    .filter((m) => isMessageFrom(m, validator));

  const label = { network, validator: toFriendlyFormat(validator, network) };
  updateValidatorMessageMetrics(
    outMessages,
    loadElectorNewStakeMessage,
    metrics.validatorNewStakeMessage,
    label,
  );
  updateValidatorMessageMetrics(
    outMessages,
    loadElectorRecoverStakeRequest,
    metrics.validatorRecoverStakeRequest,
    label,
  );

  const currentAt = Math.floor(Date.now() / 1000);
  metrics.validatorMessagesUpdatedAt.set(label, currentAt);

  const currentSeqno = masterAt.seqno;
  metrics.validatorMessagesUpdatedSeqno.set(label, currentSeqno);
}

function updateValidatorMessageMetrics<T>(
  messages: Message[],
  loader: (cs: Slice) => T,
  metric: Gauge,
  label: { network: "mainnet" | "testnet"; validator: string },
): void {
  const messagesData = messages.filter((m) => parseMessageBody(m, loader));
  if (messagesData.length === 0) {
    return;
  }

  const [lastMessage] = messagesData;
  if (!isMessageInternal(lastMessage)) {
    return;
  }

  metric.set(label, lastMessage.info.createdAt);
}
