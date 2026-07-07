import Container from "@/components/ui/Container";

function Bone({ className }) {
  return <div className={`animate-pulse rounded-card bg-sand ${className}`} />;
}

/** Squelette de la page commande affiché pendant le chargement. */
export default function CheckoutLoading() {
  return (
    <Container className="py-8 sm:py-12">
      {/* Fil d'Ariane */}
      <div className="mb-6 flex items-center gap-2">
        <Bone className="h-4 w-14" />
        <span className="text-sand">/</span>
        <Bone className="h-4 w-20" />
        <span className="text-sand">/</span>
        <Bone className="h-4 w-24" />
      </div>

      {/* Titre */}
      <Bone className="mb-8 h-8 w-64" />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Formulaire */}
        <div className="flex flex-col gap-6">
          <Bone className="h-6 w-40" />
          <Bone className="h-12 w-full" />
          <Bone className="h-12 w-full" />
          <Bone className="h-12 w-full" />

          <Bone className="mt-2 h-6 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Bone className="h-12 w-full" />
            <Bone className="h-12 w-full" />
          </div>
          <Bone className="h-20 w-full" />

          <Bone className="h-6 w-40" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Bone className="h-20 w-full" />
            <Bone className="h-20 w-full" />
            <Bone className="h-20 w-full" />
          </div>

          <div className="flex flex-col gap-3 border-t border-sand pt-4">
            <Bone className="h-14 w-full" />
            <Bone className="h-12 w-full" />
          </div>
        </div>

        {/* Récapitulatif */}
        <div className="rounded-card border border-sand p-6">
          <Bone className="mb-4 h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mb-3 flex items-center gap-3">
              <Bone className="h-[60px] w-[48px] shrink-0" />
              <div className="flex-1">
                <Bone className="mb-1 h-3 w-3/4" />
                <Bone className="h-3 w-1/2" />
              </div>
              <Bone className="h-3 w-14" />
            </div>
          ))}
          <div className="mt-4 space-y-2 border-t border-sand pt-4">
            <div className="flex justify-between">
              <Bone className="h-3 w-20" />
              <Bone className="h-3 w-16" />
            </div>
            <div className="flex justify-between">
              <Bone className="h-4 w-16" />
              <Bone className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
