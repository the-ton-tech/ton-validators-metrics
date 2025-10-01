import { Address } from "@ton/core";

export function toFriendlyFormat(
  address: Address,
  network?: "mainnet" | "testnet",
  bounceable?: boolean,
): string {
  return address.toString({
    urlSafe: true,
    bounceable: bounceable ?? false,
    testOnly: network === "testnet",
  });
}
