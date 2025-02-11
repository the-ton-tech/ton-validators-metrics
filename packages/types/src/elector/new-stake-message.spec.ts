import { Cell } from "@ton/core";
import {
  ElectorNewStakeMessage,
  isElectorNewStakeMessage,
  loadElectorNewStakeMessage,
} from "./new-stake-message";

describe("new-stack-message", (): void => {
  it("should parse new stack message", (): void => {
    const messageBoc = `b5ee9c720101020100990001a84e73744b0000018e312fb2bcca293fcc4ebf11d91df528b2d6e91dd491cda128e00c2633cd00f5a1504f251a65f04f080003000018375619175ae365ff92e81ca1b8211223eaed80b021cad795f19c17b6779900010080c37d8851e64932f38f9b91d03b4e2b038d96f9001856a8112890fe867981bffc478403e4ad38f37d84b2e68617e27c09a923a1cdf345a91b467df71dc1df9108`;
    const messageCell = Cell.fromBoc(Buffer.from(messageBoc, "hex"))[0];
    const messageSlice = messageCell.beginParse();

    expect(isElectorNewStakeMessage(messageSlice)).toBe(true);

    const newStakeMessage: ElectorNewStakeMessage =
      loadElectorNewStakeMessage(messageSlice);
    expect(newStakeMessage).toEqual({
      queryId: 398,
      validatorPublicKey: Buffer.from(
        "312fb2bcca293fcc4ebf11d91df528b2d6e91dd491cda128e00c2633cd00f5a1",
        "hex",
      ),
      stakeAt: 1347364122,
      maxFactor: 1710247688,
      adnlAddr: Buffer.from(
        "0003000018375619175ae365ff92e81ca1b8211223eaed80b021cad795f19c17",
        "hex",
      ),
      signature: Buffer.from(
        "c37d8851e64932f38f9b91d03b4e2b038d96f9001856a8112890fe867981bffc478403e4ad38f37d84b2e68617e27c09a923a1cdf345a91b467df71dc1df9108",
        "hex",
      ),
    });
  });
});
