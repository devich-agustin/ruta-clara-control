import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Share2, Navigation, Phone, Truck, MoreHorizontal } from "lucide-react";
import { CAMIONES } from "@/lib/demo-data";
import { EstadoBadge } from "@/components/estado-badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/rutas")({
  component: RutasPage,
});

function RutasPage() {
  const [sel, setSel] = useState(0);
  const camion = CAMIONES[sel];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rutas del día</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lunes 22 de junio · {CAMIONES.length} camiones operativos</p>
        </div>
        <button
          onClick={() => toast.info("Compartir ruta", { description: `Se enviaría el PDF de la ruta de ${camion.chofer} por WhatsApp.` })}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Share2 className="h-4 w-4" /> Compartir ruta
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Lista */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex gap-2">
            {CAMIONES.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setSel(i)}
                className={
                  "flex-1 rounded-md border px-3 py-2 text-left transition " +
                  (sel === i
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40")
                }
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  {c.id}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{c.patente}</div>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="text-sm font-semibold">{camion.id} · {camion.chofer}</div>
                <div className="text-xs text-muted-foreground">{camion.paradas.length} paradas</div>
              </div>
              <button
                onClick={() => toast.info("Opciones de ruta", { description: "Editar paradas, reordenar y exportar disponible en versión completa." })}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <ol className="relative">
              {camion.paradas.map((p, i) => (
                <li key={p.orden} className="relative px-5 py-4">
                  {i < camion.paradas.length - 1 && (
                    <span className="absolute left-[34px] top-12 bottom-0 w-px bg-border" />
                  )}
                  <div className="flex gap-3">
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {p.orden}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{p.cliente}</span>
                        <EstadoBadge estado={p.estado} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.direccion}</p>
                      <p className="mt-1.5 text-xs text-foreground">{p.producto}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {p.telefono}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-3">
          <div className="relative h-[560px] overflow-hidden rounded-lg border border-border bg-card">
            {/* Fake map */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "#eef2f7",
                backgroundImage:
                  "linear-gradient(#dbe3ee 1px, transparent 1px), linear-gradient(90deg, #dbe3ee 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Avenidas */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 560" preserveAspectRatio="none">
              <path d="M 0 120 Q 200 100 380 200 T 600 320" stroke="#cfd9e6" strokeWidth="18" fill="none" />
              <path d="M 80 560 Q 180 320 320 240 T 600 80" stroke="#cfd9e6" strokeWidth="14" fill="none" />
              <path d="M 0 420 L 600 380" stroke="#cfd9e6" strokeWidth="10" fill="none" />
              {/* Ruta */}
              <path
                d="M 80 460 L 200 380 L 280 300 L 400 220 L 500 120"
                stroke="#2563eb"
                strokeWidth="3"
                strokeDasharray="6 4"
                fill="none"
              />
            </svg>

            {/* Puntos */}
            {[
              { x: 80, y: 460, label: "1" },
              { x: 200, y: 380, label: "2" },
              { x: 280, y: 300, label: "3" },
              { x: 400, y: 220, label: "4" },
              { x: 500, y: 120, label: "★" },
            ].map((pt) => (
              <div
                key={pt.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(pt.x / 600) * 100}%`, top: `${(pt.y / 560) * 100}%` }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md ring-4 ring-white">
                  {pt.label}
                </div>
              </div>
            ))}

            {/* Leyenda */}
            <div className="absolute bottom-4 left-4 rounded-md border border-border bg-card/95 p-3 text-xs shadow-sm backdrop-blur">
              <div className="font-semibold">{camion.id}</div>
              <div className="text-muted-foreground">Ruta optimizada · 38 km · ~3h 20min</div>
            </div>
            <button
              onClick={() => toast.info("Mapa en tiempo real disponible en Fase 2 de Rutia.")}
              className="absolute right-4 top-4 inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
            >
              <Navigation className="h-4 w-4" /> Recentrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
