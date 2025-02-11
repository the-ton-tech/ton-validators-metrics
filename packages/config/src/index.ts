import {Address} from "@ton/core";
import dotenv from "dotenv";
import * as process from "process";

export type AppConfig = {
  network: "mainnet" | "testnet";
  validators: Address[];
  port: number;
};

export async function getAppConfig(env: string): Promise<AppConfig> {
  const config: Partial<AppConfig> = {};

  try {
    dotenv.config({ path: env });

    if (!process.env.NETWORK) {
      throw new Error("NETWORK is required");
    }
    if (
      process.env.NETWORK !== "mainnet" &&
      process.env.NETWORK !== "testnet"
    ) {
      throw new Error("NETWORK must be either mainnet or testnet");
    }
    config.network = process.env.NETWORK;

    if (!process.env.VALIDATORS) {
      throw new Error("VALIDATORS is required");
    }
    const validators = process.env.VALIDATORS.split(",");
    if (validators.length === 0) {
      throw new Error("VALIDATORS must be a non-empty list");
    }
    if (!validators.every((v) => Address.isFriendly(v))) {
      throw new Error("VALIDATORS must be a list of valid addresses");
    }
    config.validators = validators.map((v) => Address.parse(v));

    if (!process.env.PORT) {
      throw new Error("PORT is required");
    }
    if (isNaN(parseInt(process.env.PORT, 10))) {
      throw new Error("PORT must be a number");
    }
    if (
      parseInt(process.env.PORT, 10) < 0 ||
      parseInt(process.env.POR, 10) > 65535
    ) {
      throw new Error("PORT must be a valid port number");
    }
    if (parseInt(process.env.PORT, 10) !== parseFloat(process.env.PORT)) {
      throw new Error("PORT must be an integer");
    }
    config.port = parseInt(process.env.PORT, 10);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  return {
    network: config.network,
    validators: config.validators,
    port: config.port,
  };
}
