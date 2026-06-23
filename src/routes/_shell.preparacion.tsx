import { createFileRoute } from "@tanstack/react-router";
import { PREPARACION, PREPARACION_LABEL, type EstadoPreparacion } from "@/lib/demo-data";
import { Package, Clock, CheckCircle2, Truck, Plus } from "lucide-react";

export const Route = createFileRoute("/_shell/preparacion")({
  component: PreparacionPage,
});

const COLUMNAS: Array<{ key: EstadoPreparacion; icon: typeof Clock; tone: string; ring: string }> = [
  { key: "pendiente",      icon: Clock,         tone: "text-muted-foreground", ring: "ring-border" },
  { key: "en_preparacion", icon: Package,       tone: "text-info",             ring: "ring-info/30" },
  { key: "listo",          icon: CheckCircle2,  tone: "text-success",          ring: "ring-success/30" },
  { key: "despachado",     icon: Truck,         tone: "text-primary",          ring: "ring-primary/30" },
];

function PreparacionPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Preparación</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Depósito Barracas · {PREPARACION.length} pedidos en proceso
          </p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted">
          <Plus className="h-4 w-4" /> Mover pedido manualmente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {COLUMNAS.map((col) => {
          const items = PREPARACION.filter((p) => p.estado === col.key);
          const Icon = col.icon;
          return (
            <div key={col.key} className="flex min-h-[400px] flex-col rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon className={"h-4 w-4 " + col.tone} />
                  <span className="text-sm font-semibold">{PREPARACION_LABEL[col.key]}</span>
                </div>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-2.5 p-3">
                {items.map((p) => (
                  <div
                    key={p.pedido}
                    className={"rounded-md border border-border bg-card p-3 shadow-sm ring-1 " + col.ring}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-muted-foreground">{p.pedido}</span>
                      <span className="text-[11px] text-muted-foreground">{p.fechaProgramada}</span>
                    </div>
                    <div className="mt-1.5 text-sm font-medium text-foreground">{p.cliente}</div>
                    <div className="text-xs text-muted-foreground">{p.producto}</div>
                    {p.responsable && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {p.responsable}
                      </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-md border border-dashed border-border bg-card/50 p-4 text-center text-xs text-muted-foreground">
                    Sin pedidos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
