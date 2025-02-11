import { Cell } from "@ton/core";
import {
  ElectorRecoverStakeResponse,
  isElectorRecoverStakeResponse,
  loadElectorRecoverStakeResponse,
} from "./recover-stake-response";

describe("recover-stake-response", (): void => {
  it("should parse new stack message", (): void => {
    const messageBoc = `b5ee9c7201010101000e000018f96f73240000000000000000`;
    const messageCell = Cell.fromBoc(Buffer.from(messageBoc, "hex"))[0];
    const messageSlice = messageCell.beginParse();

    expect(isElectorRecoverStakeResponse(messageSlice)).toBe(true);

    const newStakeMessage: ElectorRecoverStakeResponse =
      loadElectorRecoverStakeResponse(messageSlice);
    expect(newStakeMessage).toEqual({
      queryId: 0,
    });
  });
});
