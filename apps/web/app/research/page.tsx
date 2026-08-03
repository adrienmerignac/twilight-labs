import {
  researchProjects,
  ResearchStatus,
} from "@twilight-labs/research";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Metric } from "@repo/ui/metric";
import { PageHeader } from "@repo/ui/page-header";

const statusVariant = {
  [ResearchStatus.Draft]: "neutral",
  [ResearchStatus.Testing]: "warning",
  [ResearchStatus.Partial]: "research",
  [ResearchStatus.Validated]: "success",
  [ResearchStatus.Refuted]: "danger",
} as const;

const formatConfidence = (confidence: number) =>
  `${Math.round(confidence * 100)}%`;

export default function ResearchPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Knowledge base"
        title="Research"
        description="Track hypotheses, evidence, confidence, and limitations without presenting assumptions as facts."
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Projects"
          value={String(researchProjects.length)}
        />

        <Metric
          label="Hypotheses"
          value={String(
            researchProjects.reduce(
              (total, project) => total + project.hypotheses.length,
              0,
            ),
          )}
        />

        <Metric
          label="Evidence items"
          value={String(
            researchProjects.reduce(
              (total, project) => total + project.evidence.length,
              0,
            ),
          )}
        />

        <Metric
          label="Validated"
          value={String(
            researchProjects.filter(
              (project) => project.status === ResearchStatus.Validated,
            ).length,
          )}
        />
      </section>

      <section className="mt-8 flex flex-col gap-6">
        {researchProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                  {project.id}
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  {project.title}
                </h2>

                <p className="mt-3 max-w-3xl leading-7 text-zinc-500">
                  {project.summary}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[project.status]}>
                  {project.status}
                </Badge>

                <Badge variant="research">
                  Confidence {formatConfidence(project.confidence)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-8 xl:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Hypotheses
                  </p>

                  <div className="mt-4 flex flex-col gap-4">
                    {project.hypotheses.map((hypothesis) => (
                      <article
                        key={hypothesis.id}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-mono text-xs text-zinc-400">
                              {hypothesis.id}
                            </p>

                            <h3 className="mt-1 font-bold">
                              {hypothesis.title}
                            </h3>
                          </div>

                          <Badge variant={statusVariant[hypothesis.status]}>
                            {formatConfidence(hypothesis.confidence)}
                          </Badge>
                        </div>

                        <p className="mt-4 leading-7 text-zinc-600">
                          {hypothesis.statement}
                        </p>

                        <div className="mt-5">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                            Limitations
                          </p>

                          <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-500">
                            {hypothesis.limitations.map((limitation) => (
                              <li key={limitation}>• {limitation}</li>
                            ))}
                          </ul>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <aside>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Evidence
                </p>

                <div className="mt-4 flex flex-col gap-3">
                  {project.evidence.map((evidence) => (
                    <article
                      key={evidence.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-mono text-xs text-zinc-400">
                          {evidence.id}
                        </p>

                        <Badge variant="neutral">
                          {evidence.type}
                        </Badge>
                      </div>

                      <h3 className="mt-3 font-bold">
                        {evidence.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {evidence.description}
                      </p>
                    </article>
                  ))}
                </div>
              </aside>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
