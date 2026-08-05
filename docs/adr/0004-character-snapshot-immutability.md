# ADR-0004 — CharacterSnapshot Is Immutable

## Status

Accepted

## Context

OCR output can be incomplete or corrected later. Mutating a previously
extracted snapshot would lose the evidence trail needed to compare results and
audit corrections.

## Decision

`CharacterSnapshot` represents one extraction from one evidence item. Its ID,
evidence reference, extraction timestamp, metadata, and statistics are treated
as immutable values after creation.

New OCR runs or corrections create a new snapshot rather than modifying an
existing snapshot.

## Consequences

- OCR results remain traceable to their source evidence.
- Corrections can be compared with earlier extraction attempts.
- Future enrichment uses separate models rather than altering OCR output.
