import {
  EvidenceType,
  ResearchStatus,
  type ResearchProject,
} from "./types";

export const researchProjects: ResearchProject[] = [
  {
    id: "TL-001",
    title: "Ysatsu vs Whale 25B",
    summary:
      "Compare two observed profiles to identify statistics that scale disproportionately at high combat power.",
    status: ResearchStatus.Testing,
    confidence: 0.28,
    updatedAt: "2026-08-03T00:00:00.000Z",
    evidence: [
      {
        id: "TL-001-E01",
        type: EvidenceType.ManualProfile,
        title: "Ysatsu profile",
        description:
          "Manual transcription of the Assassin profile around 1.85B combat power.",
      },
      {
        id: "TL-001-E02",
        type: EvidenceType.Video,
        title: "Whale 25B profile",
        description:
          "Statistics observed from a recorded profile inspection around 25B combat power.",
      },
    ],
    hypotheses: [
      {
        id: "TL-001-H01",
        title: "High-CP profiles emphasize multiplicative statistics",
        statement:
          "At high combat power, percentage-based and multiplicative statistics may scale faster than raw basic attributes.",
        confidence: 0.28,
        status: ResearchStatus.Testing,
        evidenceIds: ["TL-001-E01", "TL-001-E02"],
        limitations: [
          "Only two profiles are currently available.",
          "The two profiles may differ in class, progression systems, or spending level.",
          "Observed stat differences do not prove damage efficiency.",
        ],
      },
    ],
  },
];
