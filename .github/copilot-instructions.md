# Twilight Labs AI Development Instructions

## Project architecture

Twilight Labs is a pnpm workspace. Keep package dependencies pointing inward:

```text
apps
  -> UI and integrations
  -> parser and domain
```

- `@twilight-labs/domain` owns stable, game-agnostic models and aggregates.
- `@twilight-labs/parser` owns generic parsing utilities.
- `@twilight-labs/game-twilight` maps Twilight-specific data into domain models.
- `@twilight-labs/ocr` owns OCR orchestration and OCR text transformations.
- `@twilight-labs/evidence` owns evidence contracts.
- `apps/web` composes packages and renders UI; it does not own business logic.

Read [ARCHITECTURE.md](../ARCHITECTURE.md) and the relevant ADRs before
changing boundaries or public models.

## Development workflow

1. Inspect existing code and reuse established patterns.
2. Make the smallest coherent change that satisfies the request.
3. Keep domain, parser, OCR, game mapping, and UI responsibilities separate.
4. Add or update focused tests for changed behavior.
5. Run the full quality gate before committing.

## Coding principles

- Preserve unknown values instead of inventing defaults.
- Keep aggregate collections immutable and validate identifiers at boundaries.
- Keep raw OCR parsing in OCR/parser layers, not React or domain aggregates.
- Keep game-specific mappings out of generic domain types.
- Do not add dependencies unless explicitly requested.
- Prefer explicit types, small functions, and composition over duplication.

## Testing workflow

Run all commands from the repository root:

```bash
pnpm lint
pnpm check-types
pnpm test
pnpm build
```

Fix failures and rerun the full sequence until every command succeeds.

## Git workflow

- Work on the current sprint branch.
- Create one local Conventional Commit per sprint.
- Do not push, merge, rebase, reset, or amend unless explicitly requested.
- Do not commit generated review artifacts unless explicitly requested.

## Review workflow

After a commit, generate the review patch when requested:

```bash
git format-patch -1 HEAD --stdout > review.patch
```

Leave review approval and any subsequent merge to the requested workflow.
