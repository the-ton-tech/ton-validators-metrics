import {
  Address,
  beginCell,
  Builder,
  Cell,
  Dictionary,
  DictionaryValue,
  Slice,
} from "@ton/core"; //   members~udict_set_builder(256, validator_pubkey, begin_cell()

//   members~udict_set_builder(256, validator_pubkey, begin_cell()
//     .store_grams(msg_value)
//     .store_uint(now(), 32)
//     .store_uint(max_factor, 32)
//     .store_uint(src_addr, 256)
//     .store_uint(adnl_addr, 256));
//   ;; gather and save election data
// ;; elect -> elect_at elect_close min_stake total_stake members failed finished
// _ unpack_elect(elect) inline_ref {
//   var es = elect.begin_parse();
//   var res = (es~load_uint(32), es~load_uint(32), es~load_grams(), es~load_grams(), es~load_dict(), es~load_int(1), es~load_int(1));
//   es.end_parse();
//   return res;
// }
//
// cell pack_elect(elect_at, elect_close, min_stake, total_stake, members, failed, finished) inline_ref {
//   return begin_cell()
//     .store_uint(elect_at, 32)
//     .store_uint(elect_close, 32)
//     .store_grams(min_stake)
//     .store_grams(total_stake)
//     .store_dict(members)
//     .store_int(failed, 1)
//     .store_int(finished, 1)
//   .end_cell();
// }

export type ElectorDataMembers = {
  msgValue: bigint;
  now: number;
  maxFactor: number;
  srcAddr: Address;
  adnlAddr: Buffer;
};

function loadElectorDataMembers(cs: Slice): ElectorDataMembers {
  return {
    msgValue: cs.loadCoins(),
    now: cs.loadUint(32),
    maxFactor: cs.loadUint(32),
    srcAddr: new Address(-1, cs.loadBuffer(256 / 8)),
    adnlAddr: cs.loadBuffer(256 / 8),
  };
}

function storeElectorDataMembers(src: ElectorDataMembers) {
  return (builder: Builder) => {
    builder.storeCoins(src.msgValue);
    builder.storeUint(src.now, 32);
    builder.storeUint(src.maxFactor, 32);
    builder.storeBuffer(src.srcAddr.hash);
    builder.storeBuffer(src.adnlAddr);
  };
}

const electorDataMembersValue: DictionaryValue<ElectorDataMembers> = {
  parse(cs: Slice): ElectorDataMembers {
    return loadElectorDataMembers(cs);
  },
  serialize(src: ElectorDataMembers, builder: Builder) {
    builder.store(storeElectorDataMembers(src));
  },
};

export type ElectorDataElect = {
  electAt: number;
  electClose: number;
  minStake: bigint;
  totalStake: bigint;
  members: Dictionary<bigint, ElectorDataMembers>;
  failed: boolean;
  finished: boolean;
};

function loadElectorDataElect(cs: Slice): ElectorDataElect {
  return {
    electAt: cs.loadUint(32),
    electClose: cs.loadUint(32),
    minStake: cs.loadCoins(),
    totalStake: cs.loadCoins(),
    members: cs.loadDict(Dictionary.Keys.BigInt(256), electorDataMembersValue),
    failed: cs.loadBoolean(),
    finished: cs.loadBoolean(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function storeElectorDataElect(src: ElectorDataElect) {
  return (builder: Builder) => {
    builder.storeUint(src.electAt, 32);
    builder.storeUint(src.electClose, 32);
    builder.storeCoins(src.minStake);
    builder.storeCoins(src.totalStake);
    builder.storeDict(src.members);
    builder.storeBit(src.failed);
    builder.storeBit(src.finished);
  };
}

//       frozen~udict_set_builder(256, pubkey, begin_cell()
//         .store_uint(src_addr, 256)
//         .store_uint(weight, 64)
//         .store_grams(true_stake)
//         .store_int(false, 1));
export type ElectorDataFrozen = {
  srcAddr: Address;
  weight: bigint;
  trueStake: bigint;
  frozen: boolean;
};

function loadElectorDataFrozen(cs: Slice): ElectorDataFrozen {
  return {
    srcAddr: new Address(-1, cs.loadBuffer(256 / 8)),
    weight: cs.loadIntBig(64),
    trueStake: cs.loadCoins(),
    frozen: cs.loadBoolean(),
  };
}

function storeElectorDataFrozen(src: ElectorDataFrozen) {
  return (builder: Builder) => {
    builder.storeBuffer(src.srcAddr.hash);
    builder.storeInt(src.weight, 64);
    builder.storeCoins(src.trueStake);
    builder.storeBit(src.frozen);
  };
}

const electorDataFrozenValue: DictionaryValue<ElectorDataFrozen> = {
  parse(cs: Slice): ElectorDataFrozen {
    return loadElectorDataFrozen(cs);
  },
  serialize(src: ElectorDataFrozen, builder: Builder) {
    builder.store(storeElectorDataFrozen(src));
  },
};

// ;; validator_complaint#bc validator_pubkey:uint256 description:^ComplaintDescr
// ;;   created_at:uint32 severity:uint8 reward_addr:uint256 paid:Grams suggested_fine:Grams
// ;;   suggested_fine_part:uint32 = ValidatorComplaint;
// _ unpack_complaint(slice cs) inline_ref {
//   throw_unless(9, cs~load_int(8) == 0xbc - 0x100);
//   var res = (cs~load_uint(256), cs~load_ref(), cs~load_uint(32), cs~load_uint(8), cs~load_uint(256), cs~load_grams(), cs~load_grams(), cs~load_uint(32));
//   cs.end_parse();
//   return res;
// }
//
// builder pack_complaint(int validator_pubkey, cell description, int created_at, int severity, int reward_addr, int paid, int suggested_fine, int suggested_fine_part) inline_ref {
//   return begin_cell()
//     .store_int(0xbc - 0x100, 8)
//     .store_uint(validator_pubkey, 256)
//     .store_ref(description)
//     .store_uint(created_at, 32)
//     .store_uint(severity, 8)
//     .store_uint(reward_addr, 256)
//     .store_grams(paid)
//     .store_grams(suggested_fine)
//     .store_uint(suggested_fine_part, 32);
// }
export type ComplaintDescr = Cell;

function loadComplaintDescr(cs: Slice): ComplaintDescr {
  return cs.asCell();
}

function storeComplaintDescr(src: ComplaintDescr) {
  return (builder: Builder) => {
    builder.storeRef(src);
  };
}

export type ElectorDataValidatorComplaint = {
  validatorPubkey: Buffer;
  description: ComplaintDescr;
  createdAt: number;
  severity: number;
  rewardAddr: Address;
  paid: bigint;
  suggestedFine: bigint;
  suggestedFinePart: number;
};

function loadElectorDataValidatorComplaint(
  cs: Slice,
): ElectorDataValidatorComplaint {
  if (cs.loadUint(8) !== 0x2d) {
    throw new Error("Failed to parse validator complaint");
  }
  return {
    validatorPubkey: cs.loadBuffer(256 / 8),
    description: loadComplaintDescr(cs.loadRef().beginParse()),
    createdAt: cs.loadUint(32),
    severity: cs.loadUint(8),
    rewardAddr: new Address(-1, cs.loadBuffer(256 / 8)),
    paid: cs.loadCoins(),
    suggestedFine: cs.loadCoins(),
    suggestedFinePart: cs.loadUint(32),
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function storeElectorDataValidatorComplaint(
  src: ElectorDataValidatorComplaint,
) {
  return (builder: Builder) => {
    builder.storeUint(0xbc - 0x100, 8);
    builder.storeBuffer(src.validatorPubkey);
    builder.store(storeComplaintDescr(src.description));
    builder.storeUint(src.createdAt, 32);
    builder.storeUint(src.severity, 8);
    builder.storeBuffer(src.rewardAddr.hash);
    builder.storeCoins(src.paid);
    builder.storeCoins(src.suggestedFine);
    builder.storeUint(src.suggestedFinePart, 32);
  };
}

//   ;; save voters and weight_remaining
//   complaints~udict_set_builder(256, chash, pack_complaint_status(complaint, voters, vset_id, weight_remaining));
// ;; complaint_status#2d complaint:^ValidatorComplaint voters:(HashmapE 16 True)
// ;;   vset_id:uint256 weight_remaining:int64 = ValidatorComplaintStatus;
// _ unpack_complaint_status(slice cs) inline_ref {
//   throw_unless(9, cs~load_uint(8) == 0x2d);
//   var res = (cs~load_ref(), cs~load_dict(), cs~load_uint(256), cs~load_int(64));
//   cs.end_parse();
//   return res;
// }
//
// builder pack_complaint_status(cell complaint, cell voters, int vset_id, int weight_remaining) inline_ref {
//   return begin_cell()
//     .store_uint(0x2d, 8)
//     .store_ref(complaint)
//     .store_dict(voters)
//     .store_uint(vset_id, 256)
//     .store_int(weight_remaining, 64);
// }
export type ElectorDataComplaintStatus = {
  status: number;
  complaint: ElectorDataValidatorComplaint;
  voters: Dictionary<bigint, number>;
  vsetId: bigint;
  weightRemaining: bigint;
};

function loadElectorDataComplaintStatus(cs: Slice): ElectorDataComplaintStatus {
  return {
    status: cs.loadUint(8),
    complaint: loadElectorDataValidatorComplaint(cs.loadRef().beginParse()),
    voters: cs.loadDict(Dictionary.Keys.BigInt(16), Dictionary.Values.Uint(32)),
    vsetId: cs.loadUintBig(256),
    weightRemaining: cs.loadIntBig(64),
  };
}

function storeElectorDataComplaintStatus(src: ElectorDataComplaintStatus) {
  return (builder: Builder) => {
    builder.storeUint(0x2d, 8);
    builder.storeRef(src.complaint.description);
    builder.storeDict(src.voters);
    builder.storeUint(src.vsetId, 256);
    builder.storeInt(src.weightRemaining, 64);
  };
}

const electorDataComplaintStatusValue: DictionaryValue<ElectorDataComplaintStatus> =
  {
    parse(cs: Slice): ElectorDataComplaintStatus {
      return loadElectorDataComplaintStatus(cs);
    },
    serialize(src: ElectorDataComplaintStatus, builder: Builder) {
      builder.store(storeElectorDataComplaintStatus(src));
    },
  };

// ;; slice -> unfreeze_at stake_held vset_hash frozen_dict total_stake bonuses complaints
// _ unpack_past_election(slice fs) inline_ref {
//   var res = (fs~load_uint(32), fs~load_uint(32), fs~load_uint(256), fs~load_dict(), fs~load_grams(), fs~load_grams(), fs~load_dict());
//   fs.end_parse();
//   return res;
// }
//
// builder pack_past_election(int unfreeze_at, int stake_held, int vset_hash, cell frozen_dict, int total_stake, int bonuses, cell complaints) inline_ref {
//   return begin_cell()
//       .store_uint(unfreeze_at, 32)
//       .store_uint(stake_held, 32)
//       .store_uint(vset_hash, 256)
//       .store_dict(frozen_dict)
//       .store_grams(total_stake)
//       .store_grams(bonuses)
//       .store_dict(complaints);
// }
export type ElectorDataPastElection = {
  unfreezeAt: number;
  stakeHeld: number;
  vsetHash: Buffer;
  frozenDict: Dictionary<bigint, ElectorDataFrozen>;
  totalStake: bigint;
  bonuses: bigint;
  complaints: Dictionary<bigint, ElectorDataComplaintStatus>;
};

function loadElectorDataPastElection(cs: Slice): ElectorDataPastElection {
  return {
    unfreezeAt: cs.loadUint(32),
    stakeHeld: cs.loadUint(32),
    vsetHash: cs.loadBuffer(256 / 8),
    frozenDict: cs.loadDict(
      Dictionary.Keys.BigInt(256),
      electorDataFrozenValue,
    ),
    totalStake: cs.loadCoins(),
    bonuses: cs.loadCoins(),
    complaints: cs.loadDict(
      Dictionary.Keys.BigInt(256),
      electorDataComplaintStatusValue,
    ),
  };
}

function storeElectorDataPastElection(src: ElectorDataPastElection) {
  return (builder: Builder) => {
    builder.storeUint(src.unfreezeAt, 32);
    builder.storeUint(src.stakeHeld, 32);
    builder.storeBuffer(src.vsetHash);
    builder.storeDict(src.frozenDict);
    builder.storeCoins(src.totalStake);
    builder.storeCoins(src.bonuses);
    builder.storeDict(src.complaints);
  };
}

const electorDataPastElectionValue: DictionaryValue<ElectorDataPastElection> = {
  parse(cs: Slice): ElectorDataPastElection {
    return loadElectorDataPastElection(cs);
  },
  serialize(src: ElectorDataPastElection, builder: Builder) {
    builder.store(storeElectorDataPastElection(src));
  },
};

// ;; credits 'amount' to 'addr' inside credit dictionary 'credits'
// _ ~credit_to(credits, addr, amount) inline_ref {
//   var (val, f) = credits.udict_get?(256, addr);
//   if (f) {
//     amount += val~load_grams();
//   }
//   credits~udict_set_builder(256, addr, begin_cell().store_grams(amount));
//   return (credits, ());
// }
export type ElectorDataCredits = {
  amount: bigint;
};

function loadElectorDataCredits(cs: Slice): ElectorDataCredits {
  return {
    amount: cs.loadCoins(),
  };
}

function storeElectorDataCredits(src: ElectorDataCredits) {
  return (builder: Builder) => {
    builder.storeCoins(src.amount);
  };
}

const electorDataCreditsValue: DictionaryValue<ElectorDataCredits> = {
  parse(cs: Slice): ElectorDataCredits {
    return loadElectorDataCredits(cs);
  },
  serialize(src: ElectorDataCredits, builder: Builder) {
    builder.store(storeElectorDataCredits(src));
  },
};

// cur_elect credits past_elections grams active_id active_hash
export type ElectorData = {
  elect: ElectorDataElect | null;
  // credits~credit_to(reward_addr, reward);
  credits: Dictionary<bigint, ElectorDataCredits>;
  // past_elections~udict_set_builder(32, active_id, pack_past_election(unfreeze_at, stake_held, hash, dict, total_stake, bonuses, complaints));
  pastElections: Dictionary<bigint, ElectorDataPastElection>;
  grams: bigint;
  activeId: bigint;
  activeHash: Buffer;
};

export function loadElectorData(cs: Slice): ElectorData {
  return {
    elect: cs.loadBit()
      ? loadElectorDataElect(cs.loadRef().beginParse())
      : null,
    credits: cs.loadDict(Dictionary.Keys.BigInt(256), electorDataCreditsValue),
    pastElections: cs.loadDict(
      Dictionary.Keys.BigInt(32),
      electorDataPastElectionValue,
    ),
    grams: cs.loadCoins(),
    activeId: cs.loadUintBig(32),
    activeHash: cs.loadBuffer(256 / 8),
  };
}

export function storeElectData(src: ElectorData) {
  return (builder: Builder): void => {
    builder.storeMaybeRef(
      src.elect ? beginCell().store(storeElectorDataElect(src.elect)) : null,
    );
    builder.storeDict(src.credits);
    builder.storeDict(src.pastElections);
    builder.storeCoins(src.grams);
    builder.storeUint(src.activeId, 32);
    builder.storeBuffer(src.activeHash);
  };
}
