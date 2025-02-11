import { Cell } from "@ton/core";
import {
  ElectorRecoverStakeRequest,
  isElectorRecoverStakeRequest,
  loadElectorRecoverStakeRequest,
} from "./recover-stake-request";

describe("recover-stake-request", (): void => {
  it("should parse new stack message", (): void => {
    const messageBoc = `b5ee9c7201010101000e000018476574240000000000000000`;
    const messageCell = Cell.fromBoc(Buffer.from(messageBoc, "hex"))[0];
    const messageSlice = messageCell.beginParse();

    expect(isElectorRecoverStakeRequest(messageSlice)).toBe(true);

    const newStakeMessage: ElectorRecoverStakeRequest =
      loadElectorRecoverStakeRequest(messageSlice);
    expect(newStakeMessage).toEqual({
      queryId: 0,
    });
  });
});
