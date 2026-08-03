# ADR-0002 — Package Boundaries

## Status

Accepted

## Context

Twilight Labs contains reusable concepts, generic parsing utilities,
game-specific knowledge, user-interface components, and applications.

Mixing these responsibilities would make the project harder to test, reuse,
and extend to other games.

## Decision

The repository uses the following package boundaries:

- `@twilight-labs/domain` defines game-agnostic domain types.
- `@twilight-labs/parser` contains generic parsing utilities.
- `@twilight-labs/game-twilight` contains Ragnarok: Twilight Global mappings
  and game-specific parsing.
- `@repo/ui` contains reusable presentation components.
- Applications consume these packages but do not own their business logic.

Dependencies must point inward:

```text
applications
    ↓
game integrations and UI
    ↓
generic parser and domain
```

The generic domain and parser must never import a game integration or an
application.

## Consequences

- Supporting another game does not require changing the generic domain.
- Game-specific labels remain isolated from reusable parsing logic.
- Direct package imports must always be declared explicitly.
- Circular dependencies between packages are forbidden.
