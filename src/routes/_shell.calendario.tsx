import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { SEMANA } from "@/lib/demo-data";

export const Route = createFileRoute("/_shell/calendario")({
  component: CalendarioPage,
});

function CalendarioPage() {
  const [sel, setSel] = useState(0);
  const day = SEMANA[sel];
  const max = Math.max(...SEMANA.map((d) => d.total));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
          <p className="mt-1 text-sm text-muted-foreground">Semana del 22 al 28 de junio · 100 entregas planificadas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-md border border-border bg-card">
            <button className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="border-x border-border px-3 text-sm font-medium">Junio 2026</span>
            <button className="inline-flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Agendar entrega
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {SEMANA.map((d, i) => {
          const active = i === sel;
          const height = Math.max(6, (d.total / max) * 64);
          return (
            <button
              key={d.dia}
              onClick={() => setSel(i)}
              className={
                "flex flex-col items-start rounded-lg border bg-card p-4 text-left transition " +
                (active ? "border-primary ring-2 ring-primary/15" : "border-border hover:border-primary/40")
              }
            >
              <div className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>{d.dia}</span>
                <span>{d.fecha}</span>
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{d.total}</div>
              <div className="text-xs text-muted-foreground">entregas</div>
              <div className="mt-3 flex h-16 w-full items-end gap-1">
                <div className="flex-1 rounded-sm bg-success/80" style={{ height: `${(d.entregados / max) * 64}px` }} />
                <div className="flex-1 rounded-sm bg-warning/80" style={{ height: `${(d.pendientes / max) * 64}px` }} />
                <div className="flex-1 rounded-sm bg-destructive/80" style={{ height: `${(d.reprogramados / max) * 64}px` }} />
                <div className="flex-1 rounded-sm bg-muted" style={{ height: `${height}px`, visibility: "hidden" }} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">
            {day.dia} {day.fecha} · {day.total} entregas
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Detalle operativo del día seleccionado.</p>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-4">
          {[
            { label: "Programadas", value: day.total, color: "text-foreground", bar: "bg-foreground/70" },
            { label: "Entregadas", value: day.entregados, color: "text-success", bar: "bg-success" },
            { label: "Pendientes", value: day.pendientes, color: "text-warning", bar: "bg-warning" },
            { label: "Reprogramadas", value: day.reprogramados, color: "text-destructive", bar: "bg-destructive" },
          ].map((s) => (
            <div key={s.label} className="bg-card p-6">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className={"mt-2 text-2xl font-semibold " + s.color}>{s.value}</div>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={"h-full rounded-full " + s.bar}
                  style={{ width: `${day.total ? (s.value / day.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
          <div className="rounded-md border border-border p-4">
            <div className="text-sm font-medium">Camión 1 · Roberto Giménez</div>
            <div className="mt-1 text-xs text-muted-foreground">Zona Norte · 6 paradas</div>
            <div className="mt-3 text-2xl font-semibold">06:30 — 13:40</div>
          </div>
          <div className="rounded-md border border-border p-4">
            <div className="text-sm font-medium">Camión 2 · Marcelo Núñez</div>
            <div className="mt-1 text-xs text-muted-foreground">Zona Centro · 5 paradas</div>
            <div className="mt-3 text-2xl font-semibold">07:00 — 14:20</div>
          </div>
          <div className="rounded-md border border-border p-4">
            <div className="text-sm font-medium">Camión 3 · Esteban Ortiz</div>
            <div className="mt-1 text-xs text-muted-foreground">Zona Sur · 4 paradas</div>
            <div className="mt-3 text-2xl font-semibold">07:15 — 12:50</div>
          </div>
        </div>
      </div>
    </div>
  );
}
