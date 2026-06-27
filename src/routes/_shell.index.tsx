import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  CheckCircle2,
  Clock,
  RefreshCcw,
  ArrowUpRight,
  AlertTriangle,
  UserX,
  CalendarClock,
  PackageSearch,
  Truck,
  Flag,
} from "lucide-react";
import { EstadoBadge } from "@/components/estado-badge";
import { usePedidos, useIncidencias } from "@/lib/use-pedidos";
import {
  getColumns,
  getActividadReciente,
  getIdsCreadosEnSesion,
  COLUMN_INFO,
} from "@/lib/store";
import {
  INCIDENCIA_LABEL,
  type TipoEvento,
  type TipoIncidencia,
} from "@/lib/demo-data";

export const Route = createFileRoute("/_shell/")({
  component: Dashboard,
});

const HOY = "22/06/2026";
const MAX_POR_VEHICULO = 4; // umbral de sobrecarga por camión

type Tono = "warning" | "primary" | "destructive";

const TONE: Record<Tono, string> = {
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
};

const ACCION_BTN: Record<Tono, string> = {
  warning: "text-warning",
  primary: "text-primary",
  destructive: "text-destructive",
};

// Orden de severidad para las acciones prioritarias.
const SEVERIDAD: Record<Tono, number> = { destructive: 0, warning: 1, primary: 2 };

// Color del punto en el feed de actividad, por tipo de evento.
const EVENTO_DOT: Record<TipoEvento, string> = {
  creado:              "bg-primary",
  preparado:           "bg-info",
  programado:          "bg-primary",
  confirmacion:        "bg-success",
  ruta:                "bg-primary",
  asignado:            "bg-primary",
  entregado:           "bg-success",
  fallido:             "bg-destructive",
  ausente:             "bg-destructive",
  reprogramado:        "bg-warning",
  incidencia_resuelta: "bg-success",
  prioridad:           "bg-warning",
};

// Icono por tipo de incidencia (para el panel de alertas operativas).
const INCIDENCIA_ICON: Record<TipoIncidencia, typeof Clock> = {
  cliente_ausente: UserX,
  demora:          Clock,
  reprogramacion:  RefreshCcw,
  vehiculo:        Truck,
  chofer:          AlertTriangle,
};

function Dashboard() {
  // ── KPIs derivados del store (reactivos a pedidos creados y cambios) ──────
  const pedidos = usePedidos();
  const incidencias = useIncidencias();
  const columns = getColumns(); // re-render garantizado: usePedidos se suscribe al mismo store

  const total         = pedidos.length;
  const entregados    = pedidos.filter((p) => p.estado === "entregado").length;
  const enRuta        = pedidos.filter((p) => p.estado === "en_ruta").length;
  const pendientes    = pedidos.filter((p) => p.estado === "pendiente").length;
  const reprogramados = pedidos.filter((p) => p.estado === "reprogramado").length;
  const sinAsignar    = columns.sin_asignar.length;
  const pctEntregados = total > 0 ? Math.round((entregados / total) * 100) : 0;

  const STATS = [
    { label: "Pedidos hoy",   value: total,         icon: Package,      tone: "text-foreground",  sub: "+6 vs. ayer" }, // delta vs. ayer: demo (sin historial)
    { label: "Entregados",    value: entregados,    icon: CheckCircle2, tone: "text-success",     sub: `${pctEntregados}% del total` },
    { label: "Pendientes",    value: pendientes,    icon: Clock,        tone: "text-warning",     sub: `${sinAsignar} sin asignar` },
    { label: "Reprogramados", value: reprogramados, icon: RefreshCcw,   tone: "text-destructive", sub: "Revisar motivos" },
  ];

  const BARRAS = [
    { label: "Entregado",    valor: entregados,    color: "bg-success" },
    { label: "En ruta",      valor: enRuta,        color: "bg-primary" },
    { label: "Pendiente",    valor: pendientes,    color: "bg-warning" },
    { label: "Reprogramado", valor: reprogramados, color: "bg-destructive" },
  ];

  const proximas = pedidos.filter((p) => p.estado === "pendiente" || p.estado === "en_ruta").slice(0, 5);
  const max = Math.max(...BARRAS.map((b) => b.valor), 1);

  // ── Acciones prioritarias — todo calculado desde el store ─────────────────
  const activos = pedidos.filter((p) => p.estado !== "entregado");
  const sinAsignarActivos = activos.filter((p) => columns.sin_asignar.includes(p.id));

  const sinConfirmarHoy = pedidos.filter(
    (p) =>
      p.fecha === HOY &&
      (p.estado === "pendiente" || p.estado === "en_ruta") &&
      p.confirmacion !== "confirmado",
  );
  const noResponden = sinConfirmarHoy.filter((p) => p.confirmacion === "no_responde");

  const reprogramadosList = pedidos.filter((p) => p.estado === "reprogramado");
  const prioritariosPend = pedidos.filter(
    (p) => p.prioridad === "alta" && (p.estado === "pendiente" || p.estado === "en_ruta"),
  );

  const incidenciasAbiertas = incidencias.filter((i) => i.estado !== "resuelta");
  const incidenciasCriticas = incidenciasAbiertas.filter((i) => i.prioridad === "alta");

  const vehiculosSobrecargados = (["camion_1", "camion_2", "flete_externo"] as const)
    .map((c) => ({ col: c, n: columns[c].length }))
    .filter((v) => v.n > MAX_POR_VEHICULO);

  const creadosEnSesion = new Set(getIdsCreadosEnSesion());
  const nuevosSinAsignar = sinAsignarActivos.filter((p) => creadosEnSesion.has(p.id));

  type Accion = { id: string; icon: typeof Clock; tone: Tono; text: string; cta: string; to: string };
  const acciones: Accion[] = [];

  if (incidenciasAbiertas.length > 0) {
    acciones.push({
      id: "incidencias",
      icon: AlertTriangle,
      tone: incidenciasCriticas.length > 0 ? "destructive" : "warning",
      text:
        `${incidenciasAbiertas.length} incidencia${incidenciasAbiertas.length > 1 ? "s" : ""} abierta${incidenciasAbiertas.length > 1 ? "s" : ""}` +
        (incidenciasCriticas.length > 0 ? ` · ${incidenciasCriticas.length} de prioridad alta` : ""),
      cta: "Resolver incidencia",
      to: "/incidencias",
    });
  }

  if (nuevosSinAsignar.length > 0) {
    acciones.push({
      id: "nuevos",
      icon: Package,
      tone: "primary",
      text: `${nuevosSinAsignar.length} pedido${nuevosSinAsignar.length > 1 ? "s" : ""} creado${nuevosSinAsignar.length > 1 ? "s" : ""} recientemente sin asignación`,
      cta: "Asignar ahora",
      to: "/armado-dia",
    });
  }

  if (sinAsignarActivos.length > 0) {
    acciones.push({
      id: "sin-asignar",
      icon: PackageSearch,
      tone: "destructive",
      text: `${sinAsignarActivos.length} pedido${sinAsignarActivos.length > 1 ? "s" : ""} sin vehículo ni chofer asignado`,
      cta: "Ir al Armado",
      to: "/armado-dia",
    });
  }

  if (sinConfirmarHoy.length > 0) {
    acciones.push({
      id: "sin-confirmar",
      icon: CalendarClock,
      tone: noResponden.length > 0 ? "destructive" : "warning",
      text:
        `${sinConfirmarHoy.length} pedido${sinConfirmarHoy.length > 1 ? "s" : ""} de hoy sin confirmar con el cliente` +
        (noResponden.length > 0 ? ` · ${noResponden.length} no responde${noResponden.length > 1 ? "n" : ""}` : ""),
      cta: "Ir al Armado",
      to: "/armado-dia",
    });
  }

  if (prioritariosPend.length > 0) {
    acciones.push({
      id: "prioritarios",
      icon: Flag,
      tone: "warning",
      text: `${prioritariosPend.length} pedido${prioritariosPend.length > 1 ? "s" : ""} de prioridad alta sin entregar`,
      cta: "Ver pedidos",
      to: "/pedidos",
    });
  }

  if (vehiculosSobrecargados.length > 0) {
    acciones.push({
      id: "sobrecarga",
      icon: Truck,
      tone: "warning",
      text: vehiculosSobrecargados
        .map((v) => `${COLUMN_INFO[v.col].label} con ${v.n} pedidos`)
        .join(" · ") + ` (más de ${MAX_POR_VEHICULO})`,
      cta: "Ir al Armado",
      to: "/armado-dia",
    });
  }

  if (reprogramadosList.length > 0) {
    acciones.push({
      id: "reprogramados",
      icon: RefreshCcw,
      tone: "primary",
      text: `${reprogramadosList.length} pedido${reprogramadosList.length > 1 ? "s" : ""} reprogramado${reprogramadosList.length > 1 ? "s" : ""} · revisar nueva fecha`,
      cta: "Ver pedidos",
      to: "/pedidos",
    });
  }

  acciones.sort((a, b) => SEVERIDAD[a.tone] - SEVERIDAD[b.tone]);

  // ── Feed de actividad reciente (eventos reales del store) ─────────────────
  const actividad = getActividadReciente(6);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resumen operativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lunes 22 de junio de 2026 · Mueblería del Sur — Buenos Aires
          </p>
        </div>
        <Link
          to="/pedidos"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver todos los pedidos <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
                <Icon className={"h-4 w-4 " + s.tone} />
              </div>
              <div className="mt-3 text-3xl font-semibold tracking-tight">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Acciones prioritarias — derivadas del estado real del store */}
      {acciones.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Acciones prioritarias</h2>
              <p className="text-sm text-muted-foreground">Situaciones que requieren tu atención ahora</p>
            </div>
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {acciones.length}
            </span>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {acciones.map((a) => {
              const Icon = a.icon;
              return (
                <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-md " + TONE[a.tone]}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="min-w-0 flex-1 text-sm leading-snug text-foreground">{a.text}</p>
                  <Link
                    to={a.to}
                    className={"inline-flex shrink-0 items-center gap-1 text-xs font-medium hover:underline " + ACCION_BTN[a.tone]}
                  >
                    {a.cta} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Estados de entrega</h2>
              <p className="text-sm text-muted-foreground">Distribución de los {total} pedidos activos</p>
            </div>
            <span className="text-xs text-muted-foreground">Hoy</span>
          </div>

          <div className="mt-6 space-y-4">
            {BARRAS.map((b) => (
              <div key={b.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{b.label}</span>
                  <span className="text-muted-foreground">{b.valor}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className={"h-full rounded-full " + b.color} style={{ width: `${(b.valor / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas operativas — incidencias abiertas reales */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Alertas operativas</h2>
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {incidenciasAbiertas.length}
            </span>
          </div>
          {incidenciasAbiertas.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Sin incidencias abiertas.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {incidenciasAbiertas.slice(0, 4).map((inc) => {
                const Icon = INCIDENCIA_ICON[inc.tipo];
                const tone: Tono =
                  inc.prioridad === "alta" ? "destructive" : inc.prioridad === "media" ? "warning" : "primary";
                return (
                  <li key={inc.id} className="flex gap-3">
                    <span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-md " + TONE[tone]}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-snug text-foreground">{inc.titulo}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {INCIDENCIA_LABEL[inc.tipo]} · {inc.fecha}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-4">
            <Link to="/incidencias" className="text-sm text-primary hover:underline">
              Ver todas las incidencias →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Próximas entregas */}
        <div className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Próximas entregas</h2>
            <Link to="/pedidos" className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <ul className="divide-y divide-border">
            {proximas.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  {p.cliente.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{p.cliente}</p>
                    <span className="text-xs text-muted-foreground">· {p.id}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{p.producto} — {p.direccion}, {p.barrio}</p>
                </div>
                <EstadoBadge estado={p.estado} />
              </li>
            ))}
          </ul>
        </div>

        {/* Actividad reciente — eventos reales del timeline de los pedidos */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Actividad reciente</h2>
          {actividad.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Sin actividad registrada todavía.</p>
          ) : (
            <ol className="mt-4 space-y-4 border-l border-border pl-4">
              {actividad.map((a, i) => (
                <li key={i} className="relative">
                  <span className={"absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-card " + EVENTO_DOT[a.evento.tipo]} />
                  <p className="text-sm">
                    {a.evento.titulo} · <strong>{a.pedidoId}</strong>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.evento.fecha} · {a.evento.hora}
                    {a.evento.autor ? ` · ${a.evento.autor}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
