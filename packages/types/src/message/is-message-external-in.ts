import { CommonMessageInfoExternalIn, Message } from "@ton/core";
import { ReplaceProperty } from "utils";

type MessageWithExternalInInfo<T extends Message> = ReplaceProperty<
  T,
  "info",
  CommonMessageInfoExternalIn
>;

export function isMessageExternalIn<T extends Message>(
  message: T | MessageWithExternalInInfo<T>,
): message is MessageWithExternalInInfo<T> {
  return message.info.type === "external-in";
}
