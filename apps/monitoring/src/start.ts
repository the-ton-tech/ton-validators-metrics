import { logger } from "logger";
import { GenericWorker, performanceLog } from "utils";
import { startServer } from "./server";
import { updateElection } from "./tasks/update-election";
import { updateValidatorsBalance } from "./tasks/update-validators-balance";
import { updateValidatorsMessages } from "./tasks/update-validators-messages";
import { updateNominatorPoolsBalance } from "./tasks/update-nominator-pools-balance";
import { updateNominatorPools } from "./tasks/update-nominator-pools";
import { updateNominatorPoolsElectorBalance } from "./tasks/update-nominator-pools-elector-balance";
import { updateValidatorEfficiency } from "./tasks/update-validator-efficiency";
import { updateSingleNominatorPools } from "./tasks/update-single-nominator-pools";
import { updateSingleNominatorPoolsBalance } from "./tasks/update-single-nominator-pools-balance";
import { updateSingleNominatorPoolsElectorBalance } from "./tasks/update-single-nominator-pools-elector-balance";

GenericWorker.create(
  performanceLog(updateValidatorsBalance, "updateValidatorBalance"),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(updateValidatorsMessages, "updateValidatorMessages"),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(updateElection, "updateElection"),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(updateNominatorPoolsBalance, "updateNominatorPoolsBalance"),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(updateNominatorPools, "updateNominatorPools"),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(
    updateNominatorPoolsElectorBalance,
    "updateNominatorPoolsElectorBalance",
  ),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(updateValidatorEfficiency, "updateValidatorEfficiency"),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(updateSingleNominatorPools, "updateSingleNominatorPools"),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(
    updateSingleNominatorPoolsBalance,
    "updateSingleNominatorPoolsBalance",
  ),
  1000 * 5,
);
GenericWorker.create(
  performanceLog(
    updateSingleNominatorPoolsElectorBalance,
    "updateSingleNominatorPoolsElectorBalance",
  ),
  1000 * 5,
);

startServer()
  .then(() => logger.info("Monitoring started"))
  .catch(() => process.exit(1));
