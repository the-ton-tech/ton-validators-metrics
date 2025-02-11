import { Address, Transaction } from "@ton/core";
import {
  isElectorNewStakeMessage,
  loadElectorNewStakeMessage,
} from "./new-stake-message";
import { isElectorConfirmationMessage } from "./confirmation-message";
import {hasInMessage} from "../transaction/has-in-message";
import {isTransactionSuccess} from "../transaction/is-transaction-success";
import {isMessageInternal} from "../message/is-message-internal";
import {isMessageFrom} from "../message/is-message-from";
import {checkMessageBody} from "../message/check-message-body";
import {parseMessageBody} from "../message/parse-message-body";

export type ElectorNewStakeSuccessAction = {
  success: true;
  queryId: number;
  validatorPublicKey: Buffer;
  stakeAt: number;
  maxFactor: number;
  adnlAddr: Buffer;
  signature: Buffer;
  newStake: bigint;
  transaction: Transaction;
};

export type ElectorNewStakeFailAction = {
  success: false;
  transaction: Transaction;
};

export type ElectorNewStakeAction =
  | ElectorNewStakeSuccessAction
  | ElectorNewStakeFailAction;

export type ElectorNewStakeActionOptions = {
  elector: Address;
};

export function isElectorNewStakeAction(
  transaction: Transaction,
  options: ElectorNewStakeActionOptions,
): boolean {
  const { elector } = options;

  // transaction should be successful
  if (!isTransactionSuccess(transaction)) {
    return false;
  }

  // transaction should have in message
  if (!hasInMessage(transaction)) {
    return false;
  }

  const inMessage = transaction.inMessage;
  // message should be from elector and contain new stake request
  if (
    !isMessageInternal(inMessage) ||
    !isMessageFrom(inMessage, elector) ||
    !checkMessageBody(inMessage, isElectorNewStakeMessage)
  ) {
    return false;
  }

  // transaction should have out message
  const outMessages = transaction.outMessages;
  if (outMessages.size !== 1) {
    return false;
  }

  // out message should be internal and contain confirmation of the new stake
  const [outMessage] = outMessages.values();
  if (
    !isMessageInternal(outMessage) ||
    !checkMessageBody(outMessage, isElectorConfirmationMessage)
  ) {
    return false;
  }

  return true;
}

export function parseElectorNewStakeAction(
  transaction: Transaction,
  options: ElectorNewStakeActionOptions,
): ElectorNewStakeAction {
  const { elector } = options;

  // transaction should be a recover stake action
  if (!isElectorNewStakeAction(transaction, { elector })) {
    return {
      success: false,
      transaction,
    };
  }

  const inMessage = transaction.inMessage;
  const [outMessage] = transaction.outMessages.values();

  // in and out messages should be internal
  if (!isMessageInternal(inMessage) || !isMessageInternal(outMessage)) {
    return {
      success: false,
      transaction,
    };
  }

  // parse query id from in message
  const {
    queryId,
    validatorPublicKey,
    stakeAt,
    maxFactor,
    adnlAddr,
    signature,
  } = parseMessageBody(inMessage, loadElectorNewStakeMessage);

  // calculate new stake, it's the difference between in and out amount
  const inAmount = inMessage.info.value.coins;
  const outAmount = outMessage.info.value.coins;
  const newStake = inAmount - outAmount;

  return {
    success: true,
    queryId: queryId,
    validatorPublicKey: validatorPublicKey,
    stakeAt: stakeAt,
    maxFactor: maxFactor,
    adnlAddr: adnlAddr,
    signature: signature,
    newStake: newStake,
    transaction,
  };
}
