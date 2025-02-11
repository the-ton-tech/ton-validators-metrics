import { logger } from "logger";
import { GenericWorker, performanceLog } from "utils";
import { startServer } from "./server";
import { updateElection } from "./tasks/update-election";
import { updateValidatorsBalance } from "./tasks/update-validators-balance";
import { updateValidatorsMessages } from "./tasks/update-validators-messages";
import { updatePoolsBalance } from "./tasks/update-pools-balance";
import { updatePools } from "./tasks/update-pools";
import { updatePoolsElectorBalance } from "./tasks/update-pools-elector-balance";
import { updateValidatorEfficiency } from "./tasks/update-validator-efficiency";

GenericWorker.create(
  performanceLog(updateValidatorsBalance, "updateValidatorBalance"),
  1000 * 5
);
GenericWorker.create(
  performanceLog(updateValidatorsMessages, "updateValidatorMessages"),
  1000 * 5
);
GenericWorker.create(
  performanceLog(updateElection, "updateElection"),
  1000 * 5
);
GenericWorker.create(
  performanceLog(updatePoolsBalance, "updatePoolsBalance"),
  1000 * 5
);
GenericWorker.create(performanceLog(updatePools, "updatePools"), 1000 * 5);
GenericWorker.create(
  performanceLog(updatePoolsElectorBalance, "updatePoolsElectorBalance"),
  1000 * 5
);
GenericWorker.create(
  performanceLog(updateValidatorEfficiency, "updateValidatorEfficiency"),
  1000 * 5
);

startServer()
  .then(() => logger.info("Monitoring started"))
  .catch(() => process.exit(1));
