import { CommonMessageInfoExternalOut, Message } from "@ton/core";
import { ReplaceProperty } from "utils";

type MessageWithExternalOutInfo<T extends Message> = ReplaceProperty<
  T,
  "info",
  CommonMessageInfoExternalOut
>;

export function isMessageExternalOut<T extends Message>(
  message: T | MessageWithExternalOutInfo<T>,
): message is MessageWithExternalOutInfo<T> {
  return message.info.type === "external-out";
}
