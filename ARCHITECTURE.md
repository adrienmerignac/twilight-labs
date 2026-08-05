# Architecture

## Overview

Twilight Labs turns traceable game evidence into structured research data.
Packages isolate reusable concepts from Twilight-specific mappings and browser
presentation.

```text
Screenshot or video frame
          |
          v
        Evidence
          |
          v
         OCR ----> structured OCR metadata
          |
          v
  Twilight stat parser
          |
          v
 CharacterSnapshot
          |
          v
  ResearchSession
```

## Package responsibilities

| Package or application         | Responsibility                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `@twilight-labs/domain`        | Stable, game-agnostic models, value contracts, and aggregate factories.                       |
| `@twilight-labs/parser`        | Generic numeric parsing utilities.                                                            |
| `@twilight-labs/game-twilight` | Twilight label resolution, stat parsing, and mapping into domain models.                      |
| `@twilight-labs/vision`        | Game-agnostic normalized geometry, grids, pixel projections, and region assignment.           |
| `@twilight-labs/ocr`           | OCR engines, profiles, OCR reconstruction, metadata extraction, and confidence normalization. |
| `@twilight-labs/evidence`      | Traceable evidence contracts and screen definitions.                                          |
| `@twilight-labs/video`         | Video frame extraction and timeline primitives.                                               |
| `@repo/ui`                     | Reusable presentational UI components.                                                        |
| `apps/web`                     | Client-side composition, browser storage, interaction state, and rendering.                   |
| `apps/docs`                    | Project documentation site.                                                                   |

## Dependency direction

Dependencies point from applications toward reusable layers. Generic layers do
not import applications or game integrations.

```text
apps/web
  |-- @repo/ui
  |-- @twilight-labs/game-twilight
  |-- @twilight-labs/ocr
  |-- @twilight-labs/evidence
  `-- @twilight-labs/domain

@twilight-labs/game-twilight
  |-- @twilight-labs/parser
  |-- @twilight-labs/domain
  `-- @twilight-labs/vision

@twilight-labs/ocr
  |-- @twilight-labs/vision
  `-- OCR engine implementations
```

The domain and generic parser remain independent of UI, OCR engines, and
Twilight-specific mappings.

## Aggregate roots and immutable objects

`ResearchSession` is the root aggregate for video analysis. It owns the
evidences and `CharacterSnapshot` values collected from one video.

```text
ResearchSession
  |-- evidences[]
  `-- snapshots[]
```

Aggregate factories validate duplicate identifiers, copy input collections, and
freeze aggregate collections. Consumers receive readonly collections and must
create a new aggregate instead of mutating an existing one.

`CharacterSnapshot` is an immutable OCR output associated with an evidence
item. It deliberately does not require character identity, server, UID, or
combat power. Later extraction surfaces enrich research data through new
models rather than altering the original OCR output.

## OCR pipeline

OCR profiles select an engine and preprocessing strategy. OCR output may be
reconstructed for character attributes, then transformed into structured OCR
metadata such as class, level, EXP level, and normalized confidence.

Vision layouts remain independent of OCR engines and game rules. Twilight
packages define named layouts, while the Vision package evaluates normalized
regions and the OCR package adapts OCR polygons to those regions.

```text
OCR engine result
  -> profile reconstruction
  -> metadata extraction and confidence normalization
  -> structured input for game mapping
```

Raw OCR text parsing belongs to the OCR layer. React components only invoke
these transformations and render their results.

## Parser pipeline

The Twilight parser resolves known game labels, parses numeric values, and
produces normalized parsed statistics. The game mapper validates duplicate stat
IDs and creates a `CharacterSnapshot` from structured values.

```text
OCR text
  -> analyzeTwilightStats
  -> ParsedStat[]
  -> createCharacterSnapshot
  -> CharacterSnapshot
```

Parser Output remains a diagnostic view. `CharacterSnapshot` is the canonical
structured OCR output.

## Domain layer

The domain layer defines stable contracts such as `Stat`, `Metadata`,
`CharacterSnapshot`, and `ResearchSession`. It does not parse OCR text, access
browser APIs, store UI state, or contain Twilight label knowledge.

## UI responsibilities

The web application:

- runs browser interactions and OCR requests;
- keeps transient form and tab state;
- calls package APIs with structured inputs;
- renders parser diagnostics and canonical outputs;
- persists browser-local evidence.

The web application must not duplicate parsing, mapping, aggregate validation,
or confidence normalization business logic.
