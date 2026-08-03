import type { Stat } from "@twilight-labs/domain";
import { parseNumber } from "@twilight-labs/parser";

import { parseTwilightStats } from "./parse-stats";
import { resolveTwilightStatId } from "./stat-labels";

export type UnrecognizedStatLine = {
  line: string;
  reason: "malformed" | "unknown-label" | "invalid-value";
  label?: string;
  rawValue?: string;
};

export type TwilightStatsAnalysis = {
  recognized: Stat[];
  unrecognized: UnrecognizedStatLine[];
  totalLines: number;
  recognitionRate: number;
};

const LINE_PATTERN =
  /^(.+?)\s+([+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)[KMBT]?%?)$/i;

export function analyzeTwilightStats(input: string): TwilightStatsAnalysis {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const unrecognized: UnrecognizedStatLine[] = [];

  for (const line of lines) {
    const match = line.match(LINE_PATTERN);

    if (!match) {
      unrecognized.push({
        line,
        reason: "malformed",
      });

      continue;
    }

    const label = match[1]?.trim();
    const rawValue = match[2];

    if (!label || !rawValue) {
      unrecognized.push({
        line,
        reason: "malformed",
      });

      continue;
    }

    const statId = resolveTwilightStatId(label);

    if (!statId) {
      unrecognized.push({
        line,
        label,
        rawValue,
        reason: "unknown-label",
      });

      continue;
    }

    try {
      parseNumber(rawValue);
    } catch {
      unrecognized.push({
        line,
        label,
        rawValue,
        reason: "invalid-value",
      });
    }
  }

  const recognized = parseTwilightStats(input);
  const totalLines = lines.length;

  return {
    recognized,
    unrecognized,
    totalLines,
    recognitionRate:
      totalLines === 0 ? 0 : (recognized.length / totalLines) * 100,
  };
}
