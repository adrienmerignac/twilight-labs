import type { Character } from "@twilight-labs/domain";

export type QualityIssueSeverity = "info" | "warning" | "critical";

export type QualityIssue = {
  id: string;
  severity: QualityIssueSeverity;
  title: string;
  description: string;
};

export type ProfileQualityReport = {
  characterId: string;
  score: number;
  identityScore: number;
  dataScore: number;
  provenanceScore: number;
  issues: QualityIssue[];
};

const clampScore = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));

export function analyzeProfileQuality(
  character: Character,
): ProfileQualityReport {
  const issues: QualityIssue[] = [];

  let identityScore = 0;

  if (character.gameIdentity?.uid) {
    identityScore += 50;
  } else {
    issues.push({
      id: "missing-uid",
      severity: "warning",
      title: "Missing game UID",
      description:
        "The profile cannot be matched reliably across future imports or name changes.",
    });
  }

  if (character.gameIdentity?.server) {
    identityScore += 20;
  } else {
    issues.push({
      id: "missing-server",
      severity: "info",
      title: "Server not recorded",
      description:
        "Server information would improve deduplication and future profile sharing.",
    });
  }

  if (character.gameIdentity?.region) {
    identityScore += 15;
  } else {
    issues.push({
      id: "missing-region",
      severity: "info",
      title: "Region not recorded",
      description:
        "The region is optional, but useful when comparing players across deployments.",
    });
  }

  if (character.gameIdentity?.regionConfidence === "verified") {
    identityScore += 15;
  } else if (character.gameIdentity?.regionConfidence === "inferred") {
    identityScore += 8;
    issues.push({
      id: "region-inferred",
      severity: "info",
      title: "Region is inferred",
      description:
        "The region is recorded as a hypothesis rather than a verified fact.",
    });
  } else if (character.gameIdentity?.region) {
    issues.push({
      id: "region-unverified",
      severity: "warning",
      title: "Region confidence is unknown",
      description:
        "A region value exists without a confidence level.",
    });
  }

  let dataScore = 0;

  if (character.cp > 0) {
    dataScore += 20;
  } else {
    issues.push({
      id: "invalid-cp",
      severity: "critical",
      title: "Invalid combat power",
      description:
        "Combat power must be greater than zero for comparisons and scaling analysis.",
    });
  }

  const statCount = character.stats.length;

  if (statCount >= 25) {
    dataScore += 50;
  } else if (statCount >= 15) {
    dataScore += 38;
    issues.push({
      id: "partial-stat-set",
      severity: "info",
      title: "Partial statistic set",
      description:
        "The profile is usable, but additional statistics would improve comparisons.",
    });
  } else if (statCount >= 5) {
    dataScore += 22;
    issues.push({
      id: "limited-stat-set",
      severity: "warning",
      title: "Limited statistic set",
      description:
        "Only a small portion of the visible profile statistics has been captured.",
    });
  } else {
    dataScore += statCount * 3;
    issues.push({
      id: "insufficient-stats",
      severity: "critical",
      title: "Insufficient statistics",
      description:
        "The profile contains too few normalized statistics for reliable analysis.",
    });
  }

  const uniqueStatIds = new Set(
    character.stats.map((stat) => stat.id),
  );

  if (uniqueStatIds.size === statCount) {
    dataScore += 20;
  } else {
    issues.push({
      id: "duplicate-stats",
      severity: "warning",
      title: "Duplicate statistic identifiers",
      description:
        "One or more normalized statistic identifiers appear multiple times.",
    });
  }

  const invalidValues = character.stats.filter(
    (stat) => !Number.isFinite(stat.value),
  );

  if (invalidValues.length === 0) {
    dataScore += 10;
  } else {
    issues.push({
      id: "invalid-stat-values",
      severity: "critical",
      title: "Invalid statistic values",
      description:
        `${invalidValues.length} statistic value(s) are not finite numbers.`,
    });
  }

  let provenanceScore = 0;

  if (character.metadata.source) {
    provenanceScore += 35;
  }

  if (
    character.metadata.confidence >= 0 &&
    character.metadata.confidence <= 1
  ) {
    provenanceScore += 35;
  } else {
    issues.push({
      id: "invalid-confidence",
      severity: "critical",
      title: "Invalid confidence value",
      description:
        "Metadata confidence must be stored between 0 and 1.",
    });
  }

  if (character.metadata.updatedAt) {
    provenanceScore += 30;
  } else {
    issues.push({
      id: "missing-updated-at",
      severity: "warning",
      title: "Missing observation timestamp",
      description:
        "The profile does not record when its data was imported or updated.",
    });
  }

  identityScore = clampScore(identityScore);
  dataScore = clampScore(dataScore);
  provenanceScore = clampScore(provenanceScore);

  return {
    characterId: character.id,
    score: clampScore(
      identityScore * 0.3 +
        dataScore * 0.45 +
        provenanceScore * 0.25,
    ),
    identityScore,
    dataScore,
    provenanceScore,
    issues,
  };
}
