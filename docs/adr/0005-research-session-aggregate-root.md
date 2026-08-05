# ADR-0005 — ResearchSession Is the Aggregate Root

## Status

Accepted

## Context

Video analysis produces multiple evidences and character snapshots. Treating
them as unrelated records makes it difficult to reason about one analysis
session and to add future video-derived research data.

## Decision

`ResearchSession` is the root aggregate for a video analysis. It owns the
evidences and `CharacterSnapshot` values produced from one `videoId`.

The factory validates duplicate evidence and snapshot identifiers, copies input
collections, and returns readonly, frozen collections.

## Consequences

- A video analysis has one explicit aggregation boundary.
- Future cards, equipment, skills, core, and recommendations can join the same
  aggregate.
- Collection updates require a new aggregate rather than in-place mutation.
