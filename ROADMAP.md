# Roadmap

Twilight Labs evolves from traceable capture toward reproducible video-based
research and evidence-backed recommendations.

## Completed

- OCR profiles, preprocessing, and browser/local OCR execution
- Twilight statistic parser and parser diagnostics
- Immutable `CharacterSnapshot` as canonical OCR output
- Immutable `ResearchSession` aggregate for video evidence and snapshots

## Planned

### Research workflow

- ResearchTimeline for ordered video observations
- Exportable research sessions and evidence packages
- AI Analysis for assisted review of traceable research data

### Extraction surfaces

- Cards OCR
- Equipment OCR
- Skills OCR
- Core OCR

### Decision support

- Recommendation Engine with evidence-backed conclusions
- Explicit uncertainty and confidence visibility

## Guiding constraints

Planned capabilities will preserve raw evidence, retain provenance, distinguish
unknown values from zero, and extend ResearchSession rather than creating
unrelated competing aggregates.
