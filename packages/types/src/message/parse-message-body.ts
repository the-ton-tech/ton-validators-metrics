import { Message, Slice } from "@ton/core";

export function parseMessageBody<T>(
  message: Message,
  loader: (cs: Slice) => T,
): T | null {
  try {
    return loader(message.body.beginParse());
  } catch (e) {
    return null;
  }
}
