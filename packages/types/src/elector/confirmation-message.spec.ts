import { Cell } from "@ton/core";
import {
  ElectorConfirmationMessage,
  isElectorConfirmationMessage,
  loadElectorConfirmationMessage,
} from "./confirmation-message";

describe("confirmation-message", (): void => {
  it("should parse new stack message", (): void => {
    const messageBoc = `b5ee9c72010101010012000020f374484c0000018e312fb2bc00000000`;
    const messageCell = Cell.fromBoc(Buffer.from(messageBoc, "hex"))[0];
    const messageSlice = messageCell.beginParse();

    expect(isElectorConfirmationMessage(messageSlice)).toBe(true);

    const newStakeMessage: ElectorConfirmationMessage =
      loadElectorConfirmationMessage(messageSlice);
    expect(newStakeMessage).toEqual({
      queryId: 398,
    });
  });
});
