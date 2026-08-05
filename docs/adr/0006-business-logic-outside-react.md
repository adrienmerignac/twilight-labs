# ADR-0006 — Business Logic Never Belongs Inside React

## Status

Accepted

## Context

React components are responsible for interaction state and rendering. Putting
OCR parsing, game mapping, aggregate validation, or normalization in components
duplicates behavior and makes it difficult to test outside the browser.

## Decision

Business logic belongs in reusable packages:

- OCR text transformations and confidence normalization belong in
  `@twilight-labs/ocr`.
- Generic parsing belongs in `@twilight-labs/parser`.
- Twilight-specific mappings belong in `@twilight-labs/game-twilight`.
- Stable models and aggregate validation belong in `@twilight-labs/domain`.

React components call these APIs with structured inputs and render outputs.

## Consequences

- Browser UI remains a composition layer.
- Business rules can be tested without React.
- Future applications can reuse the same OCR and domain behavior.
