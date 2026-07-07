import Container from "@/components/ui/Container";

function Bone({ className }) {
  return <div className={`animate-pulse rounded-card bg-sand ${className}`} />;
}

/** Squelette affiché pendant le chargement de la page collection. */
export default function BoutiqueLoading() {
  return (
    <>
      {/* Bannière */}
      <div className="h-48 animate-pulse bg-sand sm:h-64 lg:h-80" />

      <Container>
        {/* Fil d'Ariane */}
        <div className="flex items-center gap-2 py-3">
          <Bone className="h-4 w-14" />
          <span className="text-sand">/</span>
          <Bone className="h-4 w-20" />
          <span className="text-sand">/</span>
          <Bone className="h-4 w-24" />
        </div>

        {/* Barre de filtres */}
        <div className="border-b border-sand py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Bone className="h-9 w-28" />
            <Bone className="h-9 w-24" />
            <Bone className="h-9 w-36" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 pb-1">
            {Array.from({ length: 11 }).map((_, i) => (
              <Bone key={i} className="h-8 w-10" />
            ))}
            <span className="w-px" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Bone key={i} className="h-7 w-14 rounded-full" />
            ))}
          </div>
        </div>

        {/* Grille produits */}
        <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Bone className="aspect-[4/5] w-full" />
              <Bone className="h-4 w-3/4" />
              <Bone className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
