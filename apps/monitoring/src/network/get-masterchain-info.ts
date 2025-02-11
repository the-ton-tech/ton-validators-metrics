import { LiteClient, BlockID } from "client";

/**
 * The last masterchain seqno for in-memory caching.
 */
let lastMasterchainSeqno: number = 0;

/**
 * The timeout for the masterchain info request.
 */
const MASTERCHAIN_INFO_TIMEOUT = 1_000; // 1 second

/**
 * Retrieves the masterchain info from the given client. If the lite server
 * is not synced to the latest seqno, it will wait for the latest seqno. If
 * the response is not received within timeout, it will raise an error.
 *
 * @param {LiteClient} client - The lite client
 * @returns {Promise<BlockID>} The masterchain info
 */
export async function getMasterchainInfo(client: LiteClient): Promise<BlockID> {
  const masterchainInfo = await client.getMasterchainInfo({
    timeout: MASTERCHAIN_INFO_TIMEOUT,
    awaitSeqno: lastMasterchainSeqno,
  });
  lastMasterchainSeqno = masterchainInfo.last.seqno;
  return masterchainInfo.last;
}
