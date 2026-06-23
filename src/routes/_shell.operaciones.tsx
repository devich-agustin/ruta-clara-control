import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Truck,
  Package,
  Clock,
  RefreshCcw,
  AlertTriangle,
  Wrench,
  MapPin,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { CAMIONES, INCIDENCIAS, VEHICULOS, PEDIDOS } from "@/lib/demo-data";
import { MessageCircle } from "lucide-react";
import { EstadoBadge } from "@/components/estado-badge";

export const Route = createFileRoute("/_shell/operaciones")({
  component: OperacionesPage,
});

function OperacionesPage() {
  const camionesActivos = VEHICULOS.filter((v) => v.estado === "En ruta").length;
  const enTaller = VEHICULOS.filter((v) => v.estado === "En taller").length;
  const incidenciasAbiertas = INCIDENCIAS.filter((i) => i.estado !== "resuelta");
  const sinConfirmar = PEDIDOS.filter(
    (p) => p.fecha === "22/06/2026" && p.estado !== "entregado" && p.confirmacion !== "confirmado"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Centro de Operaciones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lunes 22 de junio · Vista en vivo de la operación
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success ring-1 ring-success/20">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          Actualizado hace 1 min
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Package}      label="Entregas del día"   value="42" tone="text-foreground" />
        <Kpi icon={CheckCircle2} label="Entregadas"         value="28" tone="text-success" />
        <Kpi icon={Truck}        label="En curso"           value="6"  tone="text-primary" />
        <Kpi icon={Clock}        label="Pendientes"         value="10" tone="text-warning" />
        <Kpi icon={RefreshCcw}   label="Reprogramaciones"   value="4"  tone="text-destructive" />
        <Kpi icon={Wrench}       label="Vehículos en taller"value={String(enTaller)} tone="text-destructive" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Camiones activos */}
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-base font-semibold">Camiones activos</h2>
              <p className="text-xs text-muted-foreground">{camionesActivos} en ruta ahora</p>
            </div>
            <Link to="/rutas" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Ver rutas <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {CAMIONES.map((c) => {
              const entregadas = c.paradas.filter((p) => p.estado === "entregado").length;
              const pct = Math.round((entregadas / c.paradas.length) * 100);
              return (
                <li key={c.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">{c.id}</span>
                        <span className="font-mono text-xs text-muted-foreground">{c.patente}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">Chofer: {c.chofer}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{entregadas} / {c.paradas.length} entregas</div>
                      <div className="text-xs text-muted-foreground">{pct}% completado</div>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Próxima parada:{" "}
                    <span className="font-medium text-foreground">
                      {c.paradas.find((p) => p.estado !== "entregado")?.cliente ?? "—"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Alertas críticas */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Alertas críticas</h2>
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {incidenciasAbiertas.length}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {incidenciasAbiertas.slice(0, 5).map((i) => (
              <li key={i.id} className="flex gap-3 px-6 py-3.5">
                <span
                  className={
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md " +
                    (i.prioridad === "alta"
                      ? "bg-destructive/10 text-destructive"
                      : i.prioridad === "media"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug">{i.titulo}</p>
                  <p className="text-xs text-muted-foreground">{i.fecha}{i.referencia ? ` · ${i.referencia}` : ""}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-border px-6 py-3">
            <Link to="/incidencias" className="text-xs font-medium text-primary hover:underline">
              Ver todas las incidencias →
            </Link>
          </div>
        </div>
      </div>

      {/* Alerta de confirmaciones */}
      {sinConfirmar.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-5 py-4">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-semibold">
              {sinConfirmar.length} pedido{sinConfirmar.length > 1 ? "s" : ""} sin confirmar para hoy
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {sinConfirmar.filter((p) => p.confirmacion === "no_responde").length > 0
                ? `${sinConfirmar.filter((p) => p.confirmacion === "no_responde").length} no responden — riesgo de viaje fallido.`
                : "Contactar antes de despachar."}
            </p>
            <Link to="/armado-dia" className="mt-1 inline-flex text-xs font-medium text-primary hover:underline">
              Ver Armado del Día →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Entregas en curso */}
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Entregas en curso</h2>
            <span className="text-xs text-muted-foreground">Camión 1 y Camión 2</span>
          </div>
          <ul className="divide-y divide-border">
            {CAMIONES.flatMap((c) => c.paradas.filter((p) => p.estado !== "entregado").map((p) => ({ ...p, camion: c.id })))
              .slice(0, 6)
              .map((p, i) => (
                <li key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                    {p.orden}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{p.cliente}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.direccion} · {p.producto}</div>
                  </div>
                  <div className="hidden text-xs text-muted-foreground sm:block">{p.camion}</div>
                  <EstadoBadge estado={p.estado} />
                </li>
              ))}
          </ul>
        </div>

        {/* Flota */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Estado de la flota</h2>
          </div>
          <ul className="divide-y divide-border">
            {VEHICULOS.map((v) => (
              <li key={v.patente} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <div className="text-sm font-medium">{v.modelo}</div>
                  <div className="font-mono text-xs text-muted-foreground">{v.patente} · {v.chofer}</div>
                </div>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset " +
                    (v.estado === "En ruta"
                      ? "bg-primary/10 text-primary ring-primary/20"
                      : v.estado === "Disponible"
                        ? "bg-success/10 text-success ring-success/20"
                        : "bg-destructive/10 text-destructive ring-destructive/20")
                  }
                >
                  {v.estado}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={"h-4 w-4 " + tone} />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
