import { Address, Message } from "@ton/core";
import { isMessageInternal } from "./is-message-internal";

export function isMessageFrom<T extends Message>(
  message: T,
  address: Address,
): boolean {
  if (!isMessageInternal(message)) {
    return false;
  }

  return message.info.src.equals(address);
}
