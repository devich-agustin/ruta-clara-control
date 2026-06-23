import { createFileRoute } from "@tanstack/react-router";
import { Plus, Truck } from "lucide-react";
import { VEHICULOS } from "@/lib/demo-data";

export const Route = createFileRoute("/_shell/vehiculos")({
  component: VehiculosPage,
});

const ESTADO_TONE: Record<string, string> = {
  "En ruta": "bg-primary/10 text-primary ring-primary/20",
  "Disponible": "bg-success/10 text-success ring-success/20",
  "En taller": "bg-destructive/10 text-destructive ring-destructive/20",
};

function VehiculosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vehículos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{VEHICULOS.length} vehículos en la flota</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo vehículo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {VEHICULOS.map((v) => (
          <div key={v.patente} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{v.modelo}</div>
                  <div className="font-mono text-xs text-muted-foreground">{v.patente}</div>
                </div>
              </div>
              <span
                className={
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset " +
                  (ESTADO_TONE[v.estado] ?? "bg-muted text-muted-foreground ring-border")
                }
              >
                {v.estado}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Capacidad</dt>
                <dd className="mt-0.5 font-medium">{v.capacidad}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Chofer asignado</dt>
                <dd className="mt-0.5 font-medium">{v.chofer}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
