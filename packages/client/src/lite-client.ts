import {
  BlockID,
  ClientAccountState,
  LiteClient,
  LiteRoundRobinEngine,
  LiteSingleEngine,
} from "ton-lite-client";
import z from "zod";
import axios from "axios";
import { intToIP } from "types";
import { callForAll } from "utils";
import DataLoader from "dataloader";
import { Contract, openContract, OpenedContract } from "@ton/core";
import { createLiteClientProvider } from "ton-lite-client/dist/liteClientProvider";

/**
 * A lite client with block.
 *
 * Extends `LiteClient` with an additional method `openWithBlock` that opens a contract at a specific block.
 */
type LiteClientWithBlock = LiteClient & {
  openWithBlock<T extends Contract>(
    contract: T,
    block: number | null,
  ): Promise<T>;
};

/**
 * A lite client configuration
 *
 * Example:
 *   {
 *     "ip": 84478511,
 *     "port": 19949,
 *     "id": {
 *       "@type": "pub.ed25519",
 *       "key": "n4VDnSCUuSpjnCyUk9e3QOOd6o0ItSWYbTnW3Wnn8wk="
 *     }
 *   },
 */
const GlobalConfig = z.object({
  liteservers: z.array(
    z.object({
      ip: z.number(),
      port: z.number(),
      id: z.object({
        "@type": z.string(),
        key: z.string(),
      }),
    }),
  ),
});

/**
 * A DataLoader for lite clients
 */
const liteClient = new DataLoader<string, LiteClientWithBlock>(
  callForAll(createLiteClient),
  { cache: true },
);

/**
 * Create a lite client
 * @param configUrl - URL to the lite client config (e.g. https://ton.org/global.config.json)
 */
async function createLiteClient(
  configUrl: string,
): Promise<LiteClientWithBlock> {
  const { data } = await axios(configUrl);
  const config = GlobalConfig.parse(data);

  const liteServers = config.liteservers;

  const engines: LiteSingleEngine[] = [];

  for (const server of liteServers) {
    const ls = server;
    const engine = new LiteSingleEngine({
      host: `tcp://${intToIP(ls.ip)}:${ls.port}`,
      publicKey: Buffer.from(ls.id.key, "base64"),
      reconnectTimeout: 1000,
    });
    engines.push(engine);
  }

  const engine = new LiteRoundRobinEngine(engines);
  const client = new LiteClient({
    engine,
    batchSize: 1,
  });

  return new Proxy<LiteClientWithBlock>(client as LiteClientWithBlock, {
    get(target, prop, receiver) {
      if (prop === "openWithBlock") {
        return function openWithBlock<T extends Contract>(
          contract: T,
          block: number | null,
        ): OpenedContract<T> {
          return openContract(contract, (args) =>
            createLiteClientProvider(client, block, args.address, {
              code: args.init.code,
              data: args.init.data,
            }),
          );
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

/**
 * Get a lite client
 * @param configUrl — URL to the lite client config (e.g. https://ton.org/global.config.json)
 */
export async function getLiteClient(
  configUrl: string = "https://ton.org/global.config.json",
): Promise<LiteClientWithBlock> {
  return liteClient.load(configUrl);
}

// re-export types
export { LiteClientWithBlock as LiteClient };
export { BlockID, ClientAccountState };
