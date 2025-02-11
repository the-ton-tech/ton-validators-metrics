import { Address, Cell, loadTransaction } from "@ton/core";
import {
  ElectorRecoverStakeSuccessAction,
  isElectorRecoverStakeAction,
  parseElectorRecoverStakeAction,
} from "./recover-action";

describe("recover-action", (): void => {
  it("should parse recover action", (): void => {
    const validator = Address.parse(
      "Ef85HFFhJpbOUKYKVRoC_pGalqHNQe0Jc3RUZpXcoKLgTEAM",
    );
    const elector = Address.parse(
      "Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF",
    );

    const transactionBoc = `te6cckECCQEAAggAA69zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzAAApHIp43cN2XRqUgKM++mYKzUkyGqXFuDwHnoZmyuuoLxkHVLtf7QAAKRyKeN3CZe/QhAADQIAQIDAgHgBAUAgnJKJdR5BeLBFaliSwsGFlhdFDy6unFvuPaxsyBFn5jiNYWpqN6z3Sv6qDH/yqMzCg/us0rSBQX0GwpmPkMnMaE5Ag8MCRyNZSzYEQcIAMlJ/nI4osJNLZyhTBSqNAX9IzUtQ5qD2hLm6KjNK7lBRcCZP8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0cjWUswGy3O8AABSORTxu4TL36EII7K6EgAAAAAAAAAAQAEB3wYAyWn+ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmc/zkcUWEmls5QpgpVGgL+kZqWoc1B7QlzdFRmldygouBMcwINUmlRWGAAAAFI5FPG7iMvfoQh8t7mSAAAAAAAAAABAAKBEoHAIWDsAAAAAAAAAAABXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABhwAAAAAAAAgAAAAAAApqb73S0h0kI+EclTFXIYrznPd7muO+0bpMgmCFA3to2QFAZDK16TQ0=`;
    const transactionCell = Cell.fromBase64(transactionBoc);
    const transaction = loadTransaction(transactionCell.beginParse());

    const isAction = isElectorRecoverStakeAction(transaction, { elector });
    expect(isAction).toBe(true);

    const action = parseElectorRecoverStakeAction(transaction, {
      elector,
    }) as ElectorRecoverStakeSuccessAction;

    expect(action.success).toBe(true);
    expect(action.from.equals(validator)).toBe(true);
    expect(action.recoverStake).toBe(13546896813424851n);
    expect(action.transaction).toStrictEqual(transaction);
  });
});
