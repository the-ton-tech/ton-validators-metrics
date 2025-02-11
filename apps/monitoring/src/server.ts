import { getAppConfig } from "config";
import express from "express";
import { register } from "prom-client";
import { logger } from "logger";
import { constants } from "./constants";
import "./metrics";

export async function startServer(): Promise<void> {
  const appConfig = await getAppConfig(constants.envPath);
  const port = appConfig.port;
  logger.info(
    `Server listening to ${port}, metrics exposed on /metrics endpoint`
  );
  logger.info(`Open http://localhost:${port}/metrics to see the metrics.`);

  const server = express();
  server.get("/metrics", async (req, res) => {
    try {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });
  server.listen(port);
}
