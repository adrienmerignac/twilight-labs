import type { Character, Stat } from "@twilight-labs/domain";

export type ScalingInsight = {
  statId: string;
  label: string;
  unit: Stat["unit"];
  referenceValue: number;
  comparedValue: number;
  statRatio: number;
  cpRatio: number;
  scalingIndex: number;
  interpretation:
    | "scales-faster-than-cp"
    | "tracks-cp"
    | "scales-slower-than-cp";
};

export type CharacterScalingAnalysis = {
  referenceCharacterId: string;
  comparedCharacterId: string;
  cpRatio: number;
  insights: ScalingInsight[];
};

const classifyScaling = (
  scalingIndex: number,
): ScalingInsight["interpretation"] => {
  if (scalingIndex >= 1.15) return "scales-faster-than-cp";
  if (scalingIndex <= 0.85) return "scales-slower-than-cp";
  return "tracks-cp";
};

export function analyzeCharacterScaling(
  reference: Character,
  compared: Character,
): CharacterScalingAnalysis {
  if (reference.cp <= 0) {
    throw new Error("Reference character CP must be greater than zero.");
  }

  const cpRatio = compared.cp / reference.cp;
  const referenceStats = new Map(
    reference.stats.map((stat) => [stat.id, stat] as const),
  );
  const comparedStats = new Map(
    compared.stats.map((stat) => [stat.id, stat] as const),
  );

  const insights: ScalingInsight[] = [];

  for (const [statId, referenceStat] of referenceStats) {
    const comparedStat = comparedStats.get(statId);

    if (
      !comparedStat ||
      referenceStat.value <= 0 ||
      referenceStat.unit !== comparedStat.unit
    ) {
      continue;
    }

    const statRatio = comparedStat.value / referenceStat.value;
    const scalingIndex = cpRatio === 0 ? 0 : statRatio / cpRatio;

    insights.push({
      statId,
      label: referenceStat.label,
      unit: referenceStat.unit,
      referenceValue: referenceStat.value,
      comparedValue: comparedStat.value,
      statRatio,
      cpRatio,
      scalingIndex,
      interpretation: classifyScaling(scalingIndex),
    });
  }

  insights.sort(
    (first, second) => second.scalingIndex - first.scalingIndex,
  );

  return {
    referenceCharacterId: reference.id,
    comparedCharacterId: compared.id,
    cpRatio,
    insights,
  };
}
