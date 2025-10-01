import { Address, Transaction } from "@ton/core";
import { isElectorRecoverStakeRequest } from "./recover-stake-request";
import { isElectorRecoverStakeResponse } from "./recover-stake-response";
import { isMessageInternal } from "../message/is-message-internal";
import { checkMessageBody } from "../message/check-message-body";
import { isMessageTo } from "../message/is-message-to";
import { hasInMessage } from "../transaction/has-in-message";
import { isTransactionSuccess } from "../transaction/is-transaction-success";

export type ElectorRecoverStakeSuccessAction = {
  success: true;
  from: Address;
  recoverStake: bigint;
  transaction: Transaction;
};

export type ElectorRecoverStakeFailAction = {
  success: false;
  transaction: Transaction;
};

export type ElectorRecoverStakeAction =
  | ElectorRecoverStakeSuccessAction
  | ElectorRecoverStakeFailAction;

export type ElectorRecoverStakeActionOptions = {
  elector: Address;
};

export function isElectorRecoverStakeAction(
  transaction: Transaction,
  options: ElectorRecoverStakeActionOptions,
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
  // message should be to elector and contain recover stake request
  if (
    !isMessageInternal(inMessage) ||
    !isMessageTo(inMessage, elector) ||
    !checkMessageBody(inMessage, isElectorRecoverStakeRequest)
  ) {
    return false;
  }

  // transaction should have out message
  const outMessages = transaction.outMessages;
  if (outMessages.size !== 1) {
    return false;
  }

  // out message should be internal and contain response to recover stake request
  const [outMessage] = outMessages.values();
  if (
    !isMessageInternal(outMessage) ||
    !checkMessageBody(outMessage, isElectorRecoverStakeResponse)
  ) {
    return false;
  }

  return true;
}

export function parseElectorRecoverStakeAction(
  transaction: Transaction,
  options: ElectorRecoverStakeActionOptions,
): ElectorRecoverStakeAction {
  const { elector } = options;

  // transaction should be a recover stake action
  if (!isElectorRecoverStakeAction(transaction, { elector })) {
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

  // calculate recover stake, it's the difference between out and in amount
  const inAmount = inMessage.info.value.coins;
  const outAmount = outMessage.info.value.coins;
  const recoverStake = outAmount - inAmount;

  return {
    success: true,
    from: inMessage.info.src,
    recoverStake: recoverStake,
    transaction,
  };
}
