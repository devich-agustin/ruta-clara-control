import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { INCIDENCIAS, INCIDENCIA_LABEL, type TipoIncidencia } from "@/lib/demo-data";
import {
  UserX,
  Clock,
  RefreshCcw,
  Truck,
  Megaphone,
  Filter,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/_shell/incidencias")({
  component: IncidenciasPage,
});

const TIPO_ICON: Record<TipoIncidencia, typeof Clock> = {
  cliente_ausente: UserX,
  demora: Clock,
  reprogramacion: RefreshCcw,
  vehiculo: Truck,
  chofer: Megaphone,
};

const TIPO_TONE: Record<TipoIncidencia, string> = {
  cliente_ausente: "bg-destructive/10 text-destructive",
  demora:          "bg-warning/10 text-warning",
  reprogramacion:  "bg-warning/10 text-warning",
  vehiculo:        "bg-destructive/10 text-destructive",
  chofer:          "bg-primary/10 text-primary",
};

const FILTROS: Array<{ key: "todas" | "abierta" | "en_revision" | "resuelta"; label: string }> = [
  { key: "todas", label: "Todas" },
  { key: "abierta", label: "Abiertas" },
  { key: "en_revision", label: "En revisión" },
  { key: "resuelta", label: "Resueltas" },
];

function IncidenciasPage() {
  const [filtro, setFiltro] = useState<typeof FILTROS[number]["key"]>("todas");
  const items = INCIDENCIAS.filter((i) => filtro === "todas" || i.estado === filtro);
  const abiertas = INCIDENCIAS.filter((i) => i.estado !== "resuelta").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incidencias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bandeja de trabajo · {abiertas} incidencias activas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(["cliente_ausente", "demora", "reprogramacion", "vehiculo", "chofer"] as TipoIncidencia[]).map((t) => {
          const n = INCIDENCIAS.filter((i) => i.tipo === t && i.estado !== "resuelta").length;
          const Icon = TIPO_ICON[t];
          return (
            <div key={t} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Icon className="h-3.5 w-3.5" /> {INCIDENCIA_LABEL[t]}
              </div>
              <div className="mt-2 text-2xl font-semibold">{n}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background p-1">
            {FILTROS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={
                  "rounded px-3 py-1 text-xs font-medium transition-colors " +
                  (filtro === f.key
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="ml-auto inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted">
            <Filter className="h-4 w-4" /> Prioridad <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <ul className="divide-y divide-border">
          {items.map((i) => {
            const Icon = TIPO_ICON[i.tipo];
            return (
              <li key={i.id} className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30">
                <span className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-md " + TIPO_TONE[i.tipo]}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{i.titulo}</span>
                    {i.referencia && (
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {i.referencia}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{i.detalle}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{i.fecha} · {INCIDENCIA_LABEL[i.tipo]}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[11px] font-medium " +
                      (i.prioridad === "alta"
                        ? "bg-destructive/10 text-destructive"
                        : i.prioridad === "media"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground")
                    }
                  >
                    {i.prioridad === "alta" ? "Alta" : i.prioridad === "media" ? "Media" : "Baja"}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset " +
                      (i.estado === "abierta"
                        ? "bg-destructive/5 text-destructive ring-destructive/20"
                        : i.estado === "en_revision"
                          ? "bg-warning/5 text-warning ring-warning/25"
                          : "bg-success/5 text-success ring-success/20")
                    }
                  >
                    {i.estado === "abierta" ? "Abierta" : i.estado === "en_revision" ? "En revisión" : "Resuelta"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
