import Container from "@/components/ui/Container";

function Bone({ className }) {
  return <div className={`animate-pulse rounded-card bg-sand ${className}`} />;
}

/** Squelette de la fiche produit affiché pendant le chargement ISR. */
export default function ProductLoading() {
  return (
    <Container className="py-6 sm:py-10">
      {/* Fil d'Ariane */}
      <div className="mb-6 flex items-center gap-2">
        <Bone className="h-4 w-14" />
        <span className="text-sand">/</span>
        <Bone className="h-4 w-20" />
        <span className="text-sand">/</span>
        <Bone className="h-4 w-32" />
      </div>

      {/* Grille 2 colonnes */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">

        {/* Colonne gauche : galerie */}
        <div className="flex gap-3 lg:flex-row-reverse lg:items-start">
          {/* Grand média */}
          <Bone className="aspect-[4/5] flex-1" />
          {/* Vignettes */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} className="h-[75px] w-[60px]" />
            ))}
          </div>
        </div>

        {/* Colonne droite : infos */}
        <div className="flex flex-col gap-5">
          <Bone className="h-4 w-16 rounded-full" />
          <Bone className="h-8 w-3/4" />
          <Bone className="h-8 w-1/3" />

          {/* Pointures */}
          <div>
            <Bone className="mb-2 h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Bone key={i} className="h-10 w-12" />
              ))}
            </div>
          </div>

          {/* Couleurs */}
          <div>
            <Bone className="mb-2 h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Bone key={i} className="h-9 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Boutons */}
          <Bone className="h-14 w-full" />
          <Bone className="h-12 w-full" />

          {/* Encadré grossiste */}
          <Bone className="h-20 w-full" />
        </div>
      </div>

      {/* Accordéon */}
      <div className="mt-12 space-y-0 border-t border-sand pt-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-b border-sand py-4">
            <Bone className="h-5 w-40" />
          </div>
        ))}
      </div>

      {/* Produits similaires */}
      <div className="mt-16 border-t border-sand pt-10">
        <Bone className="mb-6 h-7 w-48" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Bone className="aspect-[4/5] w-full" />
              <Bone className="h-4 w-3/4" />
              <Bone className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
