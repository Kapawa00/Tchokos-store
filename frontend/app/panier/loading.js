import Container from "@/components/ui/Container";

function Bone({ className }) {
  return <div className={`animate-pulse rounded-card bg-sand ${className}`} />;
}

/** Squelette de la page panier affiché pendant le chargement. */
export default function CartLoading() {
  return (
    <Container className="py-8 sm:py-12">
      {/* Fil d'Ariane */}
      <div className="mb-6 flex items-center gap-2">
        <Bone className="h-4 w-14" />
        <span className="text-sand">/</span>
        <Bone className="h-4 w-20" />
      </div>

      {/* Titre */}
      <Bone className="mb-8 h-8 w-48" />

      {/* Grille panier */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Liste articles */}
        <div className="divide-y divide-sand">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-5">
              <Bone className="h-[90px] w-[72px] shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Bone className="h-4 w-3/4" />
                <Bone className="h-3 w-1/3" />
                <Bone className="h-4 w-1/4" />
                <div className="mt-2 flex items-center justify-between">
                  <Bone className="h-8 w-28" />
                  <Bone className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Récapitulatif */}
        <div className="rounded-card border border-sand p-6">
          <Bone className="mb-4 h-6 w-32" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Bone className="h-4 w-24" />
              <Bone className="h-4 w-20" />
            </div>
            <div className="flex justify-between border-t border-sand pt-3">
              <Bone className="h-4 w-20" />
              <Bone className="h-4 w-16" />
            </div>
          </div>
          <Bone className="mt-6 h-14 w-full" />
          <Bone className="mx-auto mt-3 h-3 w-40" />
        </div>
      </div>
    </Container>
  );
}
