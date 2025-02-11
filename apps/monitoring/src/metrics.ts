import { Gauge } from "prom-client";

export const metrics = {
  // Collector for validator balance
  validatorBalance: new Gauge({
    name: "validator_balance",
    help: "Validator balance",
    labelNames: ["network", "validator"],
  }),
  validatorBalanceUpdatedAt: new Gauge({
    name: "validator_balance_updated_at",
    help: "Validator balance updated at",
    labelNames: ["network", "validator"],
  }),
  validatorBalanceUpdatedSeqno: new Gauge({
    name: "validator_balance_updated_seqno",
    help: "Validator balance updated seqno",
    labelNames: ["network", "validator"],
  }),

  // Collector for pool balance
  poolBalance: new Gauge({
    name: "pool_balance",
    help: "Pool balance",
    labelNames: ["network", "validator", "pool"],
  }),
  poolBalanceUpdatedAt: new Gauge({
    name: "pool_balance_updated_at",
    help: "Pool balance updated at",
    labelNames: ["network", "validator", "pool"],
  }),
  poolBalanceUpdatedSeqno: new Gauge({
    name: "pool_balance_updated_seqno",
    help: "Pool balance updated seqno",
    labelNames: ["network", "validator", "pool"],
  }),

  // Collector for latest stake message and last recover stake message
  validatorNewStakeMessage: new Gauge({
    name: "validator_new_stake_message",
    help: "Validator new stake message",
    labelNames: ["network", "validator"],
  }),
  validatorRecoverStakeRequest: new Gauge({
    name: "validator_recover_stake_request",
    help: "Validator recover stake request",
    labelNames: ["network", "validator"],
  }),
  validatorMessagesUpdatedAt: new Gauge({
    name: "validator_messages_updated_at",
    help: "Validator messages updated at",
    labelNames: ["network", "validator"],
  }),
  validatorMessagesUpdatedSeqno: new Gauge({
    name: "validator_messages_updated_seqno",
    help: "Validator messages updated seqno",
    labelNames: ["network", "validator"],
  }),

  // Collector for elections data
  validatorsElectedFor: new Gauge({
    name: "validators_elected_for",
    help: "Validators elected for",
    labelNames: ["network"],
  }),
  electionsStartBefore: new Gauge({
    name: "elections_start_before",
    help: "Elections start before",
    labelNames: ["network"],
  }),
  electionsEndBefore: new Gauge({
    name: "elections_end_before",
    help: "Elections end before",
    labelNames: ["network"],
  }),
  stakeHeldFor: new Gauge({
    name: "stake_held_for",
    help: "Stake held for",
    labelNames: ["network"],
  }),
  validationCycledId: new Gauge({
    name: "validation_cycle_id",
    help: "Validation cycle id",
    labelNames: ["network"],
  }),
  validationUnfreezeAt: new Gauge({
    name: "validation_unfreeze_at",
    help: "Validation unfreeze at",
    labelNames: ["network"],
  }),
  electionsDataUpdatedAt: new Gauge({
    name: "elections_data_updated_at",
    help: "Elections data updated at",
    labelNames: ["network"],
  }),
  electionsDataUpdatedSeqno: new Gauge({
    name: "elections_data_updated_seqno",
    help: "Elections data updated seqno",
    labelNames: ["network"],
  }),

  // Collector for pool data
  poolState: new Gauge({
    name: "pool_state",
    help: "Pool state (0: not participating, 1: new stake request sent, 2: participating)",
    labelNames: ["network", "validator", "pool"],
  }),
  poolNominatorsCount: new Gauge({
    name: "pool_nominators_count",
    help: "Number of nominators in the pool",
    labelNames: ["network", "validator", "pool"],
  }),
  poolStakeAmountSent: new Gauge({
    name: "pool_stake_amount_sent",
    help: "Stake amount sent for validation",
    labelNames: ["network", "validator", "pool"],
  }),
  poolValidatorAmount: new Gauge({
    name: "pool_validator_amount",
    help: "Amount of coins owned by the validator",
    labelNames: ["network", "validator", "pool"],
  }),
  poolStakeAt: new Gauge({
    name: "pool_stake_at",
    help: "ID of the validation round in which the pool is participating",
    labelNames: ["network", "validator", "pool"],
  }),
  poolSavedValidatorSetHash: new Gauge({
    name: "pool_saved_validator_set_hash",
    help: "Saved validator set hash",
    labelNames: ["network", "validator", "pool"],
  }),
  poolValidatorSetChangesCount: new Gauge({
    name: "pool_validator_set_changes_count",
    help: "Validator set changes count",
    labelNames: ["network", "validator", "pool"],
  }),
  poolValidatorSetChangeTime: new Gauge({
    name: "pool_validator_set_change_time",
    help: "Validator set change time",
    labelNames: ["network", "validator", "pool"],
  }),
  poolStakeHeldFor: new Gauge({
    name: "pool_stake_held_for",
    help: "Stake held for period",
    labelNames: ["network", "validator", "pool"],
  }),
  poolValidatorRewardShare: new Gauge({
    name: "pool_validator_reward_share",
    help: "Share of the reward from validation that goes to the validator (in basis points)",
    labelNames: ["network", "validator", "pool"],
  }),
  poolMaxNominatorsCount: new Gauge({
    name: "pool_max_nominators_count",
    help: "Maximum number of nominators allowed in the pool",
    labelNames: ["network", "validator", "pool"],
  }),
  poolMinValidatorStake: new Gauge({
    name: "pool_min_validator_stake",
    help: "Minimum stake required for the validator",
    labelNames: ["network", "validator", "pool"],
  }),
  poolMinNominatorStake: new Gauge({
    name: "pool_min_nominator_stake",
    help: "Minimum stake required for nominators",
    labelNames: ["network", "validator", "pool"],
  }),

  poolUpdateAt: new Gauge({
    name: "pool_update_at",
    help: "Timestamp of the last pool data update",
    labelNames: ["network", "validator", "pool"],
  }),
  poolUpdateSeqno: new Gauge({
    name: "pool_update_seqno",
    help: "Seqno of the last pool data update",
    labelNames: ["network", "validator", "pool"],
  }),

  poolElectorBalance: new Gauge({
    name: "pool_elector_balance",
    help: "Balance of the pool in the elector contract",
    labelNames: ["network", "validator", "pool"],
  }),
  poolElectorBalanceUpdatedAt: new Gauge({
    name: "pool_elector_balance_updated_at",
    help: "Timestamp of the last pool elector balance update",
    labelNames: ["network", "validator", "pool"],
  }),
  poolElectorBalanceUpdatedSeqno: new Gauge({
    name: "pool_elector_balance_updated_seqno",
    help: "Seqno of the last pool elector balance update",
    labelNames: ["network", "validator", "pool"],
  }),

  validatorEfficiency: new Gauge({
    name: "validator_efficiency",
    help: "Validator efficiency percentage",
    labelNames: ["network", "validator"],
  }),
  validatorEfficiencyUpdatedAt: new Gauge({
    name: "validator_efficiency_updated_at",
    help: "Timestamp of the last validator efficiency update",
    labelNames: ["network", "validator"],
  }),
  validatorEfficiencyUpdatedSeqno: new Gauge({
    name: "validator_efficiency_updated_seqno",
    help: "Seqno of the last validator efficiency update",
    labelNames: ["network", "validator"],
  }),
  validatorEfficiencyCycleId: new Gauge({
    name: "validator_efficiency_cycle_id",
    help: "Cycle ID of the last validator efficiency update",
    labelNames: ["network", "validator"],
  }),
  validatorParticipationStatus: new Gauge({
    name: "validator_participation_status",
    help: "Validator participation status in current elections (0: not participating, 1: participating)",
    labelNames: ["network", "validator"],
  }),
  validatorParticipationPosition: new Gauge({
    name: "validator_participation_position",
    help: "Validator position in participants list (-1: not found, >=0: position in list)",
    labelNames: ["network", "validator"],
  }),
};
