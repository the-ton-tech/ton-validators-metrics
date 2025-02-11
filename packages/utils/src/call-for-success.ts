import { logger } from "logger";
import { delay } from "./delay";

/**
 * Function to call ton api until we get response.
 * Because ton network is pretty unstable we need to make sure response is final.
 * @param toCall - function to call
 * @param attempts - number of attempts
 * @param delayMs - delay in ms
 */
export async function callForSuccess<
  T extends (...args: unknown[]) => Promise<unknown>,
>(toCall: T, attempts = 20, delayMs = 100): Promise<Awaited<ReturnType<T>>> {
  if (typeof toCall !== "function") {
    throw new Error(`Expected a function, got ${typeof toCall}`);
  }

  let i = 0;
  let lastError: unknown;

  while (i < attempts) {
    try {
      const result = await toCall();
      return result as Awaited<ReturnType<T>>;
    } catch (err) {
      lastError = err;
      i++;
      await delay(delayMs);
    }
  }

  logger.error("Error after attempts", i);
  throw lastError;
}
