# Contributing

## Core rule

Never present an assumption as a verified fact. When information is incomplete,
record it as incomplete.

## Development

```bash
pnpm install
pnpm dev
```

## Branch naming

Use short-lived, descriptive branches:

```text
sprint/019-research-timeline
feat/character-import
fix/ocr-confidence
docs/architecture-guide
```

## Commit naming

Use Conventional Commits with a focused scope:

```text
feat(domain): add research session aggregate
fix(ocr): normalize confidence values
refactor(game): simplify stat mapping
docs: describe package boundaries
```

Create one coherent local commit per sprint unless the requested workflow says
otherwise. Do not push, merge, rebase, reset, or amend without explicit
approval.

## Quality gate

Run all commands from the repository root before requesting review:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Fix every failure and repeat the full sequence until all commands succeed.

## Review process

1. Keep the change focused on one approved objective.
2. Commit locally after the quality gate passes.
3. Generate `review.patch` when requested with `git format-patch`.
4. Wait for review approval before merging or deleting a sprint branch.

## Coding conventions

- Follow existing package boundaries and dependency direction.
- Keep business logic out of React components.
- Prefer immutable domain aggregates and readonly collections.
- Keep OCR parsing in OCR/parser layers and Twilight mappings in the game layer.
- Reuse existing utilities before adding new code.
- Do not add dependencies unless explicitly requested.
- Add focused tests for changed behavior.

## Data contributions

Include the observation date, game version, server or region, class, source
type, original in-game label, exact value, media reference, and uncertainty
notes when available.

Do not replace unknown or unreadable values with zero or guesses.
