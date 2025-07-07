import axios from "axios";
import { z } from "zod";

const CycleScoreboardSchema = z.object({
  scoreboard: z.array(
    z.object({
      cycle_id: z.number(),
      utime_since: z.number(),
      utime_until: z.number(),
      adnl_addr: z.string(),
      pubkey: z.string(),
      pubkey_hash: z.string(),
      weight: z.number(),
      idx: z.number(),
      stake: z.number(),
      validator_adnl: z.string()
        .nullable()
        .transform((val) =>
          val ? Buffer.from(val, "hex") : Buffer.alloc(64)),
      efficiency: z.number()
        .nullable()
        .default(0),
    })
  ),
});

type CycleScoreboard = z.infer<typeof CycleScoreboardSchema>;

/**
 * The cycle scoreboard entry
 */
export type CycleScoreboardEntry = CycleScoreboard["scoreboard"][number];

/**
 * Get the cycle scoreboard for a given cycle id
 * @param cycleId - The cycle id
 * @returns The cycle scoreboard
 */
export async function getCycleScoreboard(
  cycleId: string
): Promise<CycleScoreboardEntry[]> {
  const url = `https://toncenter.com/api/qos/cycleScoreboard?cycle_id=${cycleId}`;
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch cycle ${cycleId} scoreboard: ${response.statusText}`
    );
  }
  const scoreboard = CycleScoreboardSchema.parse(response.data);
  return scoreboard.scoreboard;
}
