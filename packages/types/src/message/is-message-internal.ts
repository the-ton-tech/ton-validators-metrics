import { CommonMessageInfoInternal, Message } from "@ton/core";
import { ReplaceProperty } from "utils";

type MessageWithInternalInfo<T extends Message> = ReplaceProperty<
  T,
  "info",
  CommonMessageInfoInternal
>;

export function isMessageInternal<T extends Message>(
  message: T | MessageWithInternalInfo<T>,
): message is MessageWithInternalInfo<T> {
  return message.info.type === "internal";
}
