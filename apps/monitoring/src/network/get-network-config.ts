import { parseFullConfig, Slice } from "@ton/ton";
import { BlockID, LiteClient } from "client";
import { callForSuccess } from "utils";

export type NetworkConfig = Awaited<ReturnType<typeof parseFullConfig>>;

export async function getNetworkConfig(
  client: LiteClient,
  blockId: BlockID,
): Promise<NetworkConfig> {
  return callForSuccess(async () => {
    const { config: configDict } = await client.getConfig(blockId);
    const configMap = new Map<number, Slice>();
    for (const key of configDict.keys()) {
      const value = configDict.get(key).beginParse();
      configMap.set(key, value);
    }
    return parseFullConfig(configMap);
  });
}
