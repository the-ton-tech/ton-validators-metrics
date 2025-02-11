import { Address } from "@ton/core";

export function toFriendlyFormat(
  address: Address,
  network?: "mainnet" | "testnet",
): string {
  return address.toString({
    urlSafe: true,
    bounceable: false,
    testOnly: network === "testnet",
  });
}
