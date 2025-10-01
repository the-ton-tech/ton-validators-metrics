import { logger } from "logger";

class GenericWorker {
  private isStarted = false;

  private isWorking = false;

  private readonly workFunction: () => Promise<void>;

  constructor(workFunction: () => Promise<void>) {
    this.workFunction = workFunction;
  }

  start(interval = 1000): void {
    if (this.isStarted) {
      return;
    }

    setImmediate((): Promise<void> => this.doWork());
    setInterval((): Promise<void> => this.doWork(), interval);
  }

  async doWork(): Promise<void> {
    if (this.isWorking) return;

    this.isWorking = true;

    try {
      await this.workFunction();
    } catch (e) {
      logger.error(`worker error: ${e.message}, stack: ${e.stack}`);
    } finally {
      this.isWorking = false;
    }
  }

  static create(
    workFunction: () => Promise<void>,
    interval = 1000,
  ): GenericWorker {
    const worker = new GenericWorker(workFunction);
    worker.start(interval);
    return worker;
  }
}

export function performanceLog(worker: () => Promise<void>, name: string) {
  return async (): Promise<void> => {
    const start = performance.now();
    try {
      logger.info(`do work start ${name}`);
      await worker();
    } finally {
      logger.info(
        `do work end ${name} ${((performance.now() - start) / 1000).toFixed(2)}s`,
      );
    }
  };
}

export { GenericWorker };
