import { Cell, loadTransaction } from "@ton/core";
import { hasInMessage } from "./has-in-message";

describe("has-in-message", (): void => {
  it("should check in message", (): void => {
    const transactionBoc = `te6cckECCQEAAggAA69zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzAAApHIp43cN2XRqUgKM++mYKzUkyGqXFuDwHnoZmyuuoLxkHVLtf7QAAKRyKeN3CZe/QhAADQIAQIDAgHgBAUAgnJKJdR5BeLBFaliSwsGFlhdFDy6unFvuPaxsyBFn5jiNYWpqN6z3Sv6qDH/yqMzCg/us0rSBQX0GwpmPkMnMaE5Ag8MCRyNZSzYEQcIAMlJ/nI4osJNLZyhTBSqNAX9IzUtQ5qD2hLm6KjNK7lBRcCZP8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0cjWUswGy3O8AABSORTxu4TL36EII7K6EgAAAAAAAAAAQAEB3wYAyWn+ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmc/zkcUWEmls5QpgpVGgL+kZqWoc1B7QlzdFRmldygouBMcwINUmlRWGAAAAFI5FPG7iMvfoQh8t7mSAAAAAAAAAABAAKBEoHAIWDsAAAAAAAAAAABXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABhwAAAAAAAAgAAAAAAApqb73S0h0kI+EclTFXIYrznPd7muO+0bpMgmCFA3to2QFAZDK16TQ0=`;
    const transactionCell = Cell.fromBase64(transactionBoc);

    const transaction = loadTransaction(transactionCell.beginParse());

    expect(hasInMessage(transaction)).toBe(true);
  });
});
