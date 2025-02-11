import { Address, Cell, loadTransaction } from "@ton/core";
import { isMessageTo } from "./is-message-to";

describe("is-message-to", (): void => {
  it("should check message to", (): void => {
    const elector = Address.parse(
      "Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF",
    );
    const validator = Address.parse(
      "Ef85HFFhJpbOUKYKVRoC_pGalqHNQe0Jc3RUZpXcoKLgTEAM",
    );

    const transactionBoc = `te6cckECCQEAAggAA69zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzAAApHIp43cN2XRqUgKM++mYKzUkyGqXFuDwHnoZmyuuoLxkHVLtf7QAAKRyKeN3CZe/QhAADQIAQIDAgHgBAUAgnJKJdR5BeLBFaliSwsGFlhdFDy6unFvuPaxsyBFn5jiNYWpqN6z3Sv6qDH/yqMzCg/us0rSBQX0GwpmPkMnMaE5Ag8MCRyNZSzYEQcIAMlJ/nI4osJNLZyhTBSqNAX9IzUtQ5qD2hLm6KjNK7lBRcCZP8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0cjWUswGy3O8AABSORTxu4TL36EII7K6EgAAAAAAAAAAQAEB3wYAyWn+ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmc/zkcUWEmls5QpgpVGgL+kZqWoc1B7QlzdFRmldygouBMcwINUmlRWGAAAAFI5FPG7iMvfoQh8t7mSAAAAAAAAAABAAKBEoHAIWDsAAAAAAAAAAABXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABhwAAAAAAAAgAAAAAAApqb73S0h0kI+EclTFXIYrznPd7muO+0bpMgmCFA3to2QFAZDK16TQ0=`;
    const transactionCell = Cell.fromBase64(transactionBoc);
    const transaction = loadTransaction(transactionCell.beginParse());

    expect(isMessageTo(transaction.inMessage, elector)).toBe(true);
    expect(isMessageTo(transaction.inMessage, validator)).toBe(false);
  });
});
