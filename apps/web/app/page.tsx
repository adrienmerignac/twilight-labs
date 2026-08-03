import Link from "next/link";

const features = [
  {
    href: "/import",
    eyebrow: "Collect",
    title: "Importer un profil",
    description:
      "Transforme les statistiques brutes du jeu en données structurées.",
    action: "Nouvel import",
  },
  {
    href: "/characters",
    eyebrow: "Understand",
    title: "Gérer les personnages",
    description:
      "Consulte les profils sauvegardés et leurs sources de données.",
    action: "Voir les profils",
  },
  {
    href: "/compare",
    eyebrow: "Analyze",
    title: "Comparer les builds",
    description:
      "Mesure les écarts absolus et relatifs entre deux personnages.",
    action: "Ouvrir le comparateur",
  },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <section className="overflow-hidden rounded-[32px] bg-[#111116] px-7 py-10 text-white shadow-xl shadow-zinc-950/10 md:px-12 md:py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-400">
            Twilight Labs Alpha
          </p>

          <h1 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-6xl">
            Comprendre le jeu.
            <br />
            Ne pas deviner.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
            Une plateforme de recherche pour analyser les mécaniques de
            Ragnarok: Twilight Global à partir de données vérifiables.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/import"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Importer mon personnage
            </Link>

            <Link
              href="/compare"
              className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Comparer deux profils
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-950/5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              {feature.eyebrow}
            </p>

            <h2 className="mt-4 text-xl font-bold tracking-tight">
              {feature.title}
            </h2>

            <p className="mt-3 min-h-14 text-sm leading-6 text-zinc-500">
              {feature.description}
            </p>

            <p className="mt-7 text-sm font-bold">
              {feature.action}
              <span className="ml-2 inline-block transition group-hover:translate-x-1">
                →
              </span>
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            Research status
          </p>

          <h2 className="mt-4 text-2xl font-bold tracking-tight">
            TL-001 — Ysatsu vs Whale 25B
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-zinc-500">
            Première comparaison de profils destinée à identifier les
            statistiques qui progressent de manière disproportionnée à haut CP.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
              En cours
            </span>

            <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600">
              Confiance faible
            </span>
          </div>
        </article>

        <article className="rounded-3xl bg-violet-600 p-7 text-white shadow-lg shadow-violet-600/15">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
            Principe
          </p>

          <blockquote className="mt-5 text-2xl font-bold leading-snug tracking-tight">
            “Twilight Labs ne cherche pas à avoir raison. Il cherche à être
            vérifiable.”
          </blockquote>
        </article>
      </section>
    </main>
  );
}
