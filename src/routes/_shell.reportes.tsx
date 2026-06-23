import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { toast } from "sonner";
import {
  REPORTES_KPIS,
  MOTIVOS_FALLOS,
  RENDIMIENTO_CHOFER,
  RENDIMIENTO_VEHICULO,
  ZONAS_ENTREGAS,
} from "@/lib/demo-data";

export const Route = createFileRoute("/_shell/reportes")({
  component: ReportesPage,
});

const BARRAS = [
  { dia: "Lun", v: 42 },
  { dia: "Mar", v: 58 },
  { dia: "Mié", v: 51 },
  { dia: "Jue", v: 63 },
  { dia: "Vie", v: 72 },
  { dia: "Sáb", v: 38 },
];

function ReportesPage() {
  const max = Math.max(...BARRAS.map((b) => b.v));
  const maxMotivo = Math.max(...MOTIVOS_FALLOS.map((m) => m.v));
  const maxZona = Math.max(...ZONAS_ENTREGAS.map((z) => z.entregas));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes operativos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Métricas de entrega de los últimos 30 días
          </p>
        </div>
        <button
          onClick={() => toast.info("Descargar reporte", { description: "La exportación a PDF/Excel estará disponible con backend conectado." })}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
        >
          <Download className="h-4 w-4" /> Descargar reporte
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {REPORTES_KPIS.map((k) => {
          const positive = k.invert ? !k.up : k.up;
          return (
            <div key={k.label} className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-medium text-muted-foreground">{k.label}</div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{k.value}</div>
              <div
                className={
                  "mt-2 inline-flex items-center gap-1 text-xs font-medium " +
                  (positive ? "text-success" : "text-destructive")
                }
              >
                {k.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {k.delta} vs. mes anterior
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Entregas por día — Última semana</h2>
          <div className="mt-6 flex h-64 items-end gap-4">
            {BARRAS.map((b) => (
              <div key={b.dia} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-xs font-medium text-foreground">{b.v}</div>
                <div className="w-full overflow-hidden rounded-t-md bg-muted">
                  <div className="bg-primary" style={{ height: `${(b.v / max) * 200}px` }} />
                </div>
                <div className="text-xs text-muted-foreground">{b.dia}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Motivos de fallos</h2>
          <p className="text-xs text-muted-foreground">¿Por qué no se pudo entregar?</p>
          <ul className="mt-5 space-y-3">
            {MOTIVOS_FALLOS.map((m) => (
              <li key={m.motivo}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{m.motivo}</span>
                  <span className="text-muted-foreground">{m.v}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-destructive" style={{ width: `${(m.v / maxMotivo) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Rendimiento por chofer</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="pb-2">Chofer</th>
                <th className="pb-2 text-right">Entregas</th>
                <th className="pb-2 text-right">% éxito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RENDIMIENTO_CHOFER.map((c) => (
                <tr key={c.nombre}>
                  <td className="py-2.5 font-medium">{c.nombre}</td>
                  <td className="py-2.5 text-right">{c.entregas}</td>
                  <td className="py-2.5 text-right">
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      {c.exito}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Rendimiento por vehículo</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="pb-2">Patente</th>
                <th className="pb-2 text-right">Entregas</th>
                <th className="pb-2 text-right">Disponibilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RENDIMIENTO_VEHICULO.map((v) => (
                <tr key={v.patente}>
                  <td className="py-2.5 font-mono text-xs">{v.patente}</td>
                  <td className="py-2.5 text-right">{v.entregas}</td>
                  <td className="py-2.5 text-right text-muted-foreground">{v.disponibilidad}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Entregas por zona</h2>
            <p className="text-xs text-muted-foreground">Volumen y fallos por barrio de CABA</p>
          </div>
        </div>
        <ul className="mt-5 space-y-4">
          {ZONAS_ENTREGAS.map((z) => {
            const tasaFallo = Math.round((z.fallos / z.entregas) * 100);
            return (
              <li key={z.zona}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{z.zona}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{z.entregas} entregas</span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 font-medium " +
                        (tasaFallo >= 8
                          ? "bg-destructive/10 text-destructive"
                          : tasaFallo >= 5
                            ? "bg-warning/10 text-warning"
                            : "bg-success/10 text-success")
                      }
                    >
                      {z.fallos} fallos · {tasaFallo}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(z.entregas / maxZona) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
