import { Address, Cell, Slice } from "@ton/core";

/**
 * The masterchain ID.
 */
const MASTERCHAIN = -1;

/**
 * Represents the state of a nominator pool.
 */
export enum PoolDataState {
  /**
   * Does not participate in validation
   */
  NotParticipating = 0,
  /**
   * Sent a new_stake request to participate in the validation round
   */
  SentNewStakeRequest = 1,
  /**
   * Received a successful confirmation about participation in the validation round
   */
  ReceivedSuccessfulConfirmation = 2,
}

/**
 * Represents the data of nominators in the pool.
 */
export interface PoolDataNominators {
  /**
   * The address of the nominator.
   */
  address: Address;
  /**
   * The amount of coins the nominator has staked.
   */
  amount: bigint;
  /**
   * The amount of coins the nominator has pending deposit.
   */
  pendingDepositAmount: bigint;
}

/**
 * Represents the config of the pool.
 */
export interface PoolDataConfig {
  /**
   * The validator address of the pool.
   */
  validatorAddress: Address;
  /**
   * The reward share of the validator.
   */
  validatorRewardShare: number;
  /**
   * The maximum number of nominators the validator can have.
   */
  maxNominatorsCount: number;
  /**
   * The minimum stake amount for the validator.
   */
  minValidatorStake: bigint;
  /**
   * The minimum stake amount for the nominators.
   */
  minNominatorStake: bigint;
}

/**
 * Represents the data of the pool.
 */
export interface PoolData {
  /**
   * The current state of the pool.
   */
  state: PoolDataState;
  /**
   * The current number of nominators in the pool.
   */
  nominatorsCount: number;
  /**
   * The amount of coins the pool has sent for staking in the current validation round.
   */
  stakeAmountSent: bigint;
  /**
   * The amount of coins currently owned by the validator.
   */
  validatorAmount: bigint;
  /**
   * The configuration settings of the pool.
   */
  config: PoolDataConfig;
  /**
   * The list of nominators currently in the pool.
   */
  nominators: PoolDataNominators[];
  /**
   * The list of addresses with pending withdraw requests.
   */
  withdrawRequests: Address[];
  /**
   * The ID of the validation round in which the pool is participating or plans to participate.
   */
  stakeAt: number;
  /**
   * The hash of the saved validator set.
   */
  savedValidatorSetHash: Buffer;
  /**
   * The count of validator set changes.
   */
  validatorSetChangesCount: number;
  /**
   * The timestamp of the last validator set change.
   */
  validatorSetChangeTime: number;
  /**
   * The duration for which the stake is held.
   */
  stakeHeldFor: number;
}

/**
 * Loads the pool data from the slice.
 * @param slice - The slice to load the data from.
 * @returns The pool data.
 */
export function loadPoolData(slice: Slice): PoolData {
  const state = slice.loadUint(8);
  const nominatorsCount = slice.loadUint(16);
  const stakeAmountSent = slice.loadCoins();
  const validatorAmount = slice.loadCoins();

  const configCell = slice.loadRef();
  const config = unpackConfig(configCell);

  slice.loadMaybeRef();
  const nominators: PoolDataNominators[] = [];

  slice.loadMaybeRef();
  const withdrawRequests = [];

  const stakeAt = slice.loadUint(32);
  const savedValidatorSetHash = slice.loadBuffer(256 / 8);
  const validatorSetChangesCount = slice.loadUint(8);
  const validatorSetChangeTime = slice.loadUint(32);
  const stakeHeldFor = slice.loadUint(32);

  return {
    state,
    nominatorsCount,
    stakeAmountSent,
    validatorAmount,
    config,
    nominators,
    withdrawRequests,
    stakeAt,
    savedValidatorSetHash,
    validatorSetChangesCount,
    validatorSetChangeTime,
    stakeHeldFor,
  };
}

/**
 * Unpacks the config from the cell.
 * @param cell - The cell to unpack the config from.
 * @returns The config.
 */
function unpackConfig(cell: Cell): PoolDataConfig {
  const slice = cell.beginParse();
  return {
    validatorAddress: new Address(MASTERCHAIN, slice.loadBuffer(256 / 8)),
    validatorRewardShare: slice.loadUint(16),
    maxNominatorsCount: slice.loadUint(16),
    minValidatorStake: slice.loadCoins(),
    minNominatorStake: slice.loadCoins(),
  };
}
