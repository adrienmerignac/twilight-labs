# ADR-0003 — Data Provenance

## Status

Accepted

## Context

Twilight Labs may ingest values from manual entries, screenshots, videos,
OCR, combat experiments, and community contributions.

A normalized value without its origin cannot be reliably verified or corrected.

## Decision

Every imported profile must retain source metadata.

Future stat-level observations should support:

- source type;
- source reference;
- capture or observation date;
- extraction confidence;
- manual validation status;
- original in-game label;
- raw displayed value.

Raw data must remain immutable. Corrections create a new normalized observation
instead of silently modifying the original source.

## Consequences

- Research conclusions can be traced back to their evidence.
- OCR mistakes can be identified and corrected.
- Conflicting observations can coexist.
- Storage requirements will be larger, but the resulting data is auditable.
