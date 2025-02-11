import { Message, Slice } from "@ton/core";

export function checkMessageBody(
  message: Message,
  checker: (cs: Slice) => boolean,
): boolean {
  return checker(message.body.beginParse());
}
