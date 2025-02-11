import { resolve } from "node:path";

export const constants = {
  envPath: resolve(__dirname, "../../../.env"),
  mainnetGlobalConfig: "https://ton.org/global.config.json",
  testnetGlobalConfig: "https://ton.org/testnet-global.config.json",
};
