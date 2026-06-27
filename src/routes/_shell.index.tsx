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
} from "lucide-react";
import { EstadoBadge } from "@/components/estado-badge";
import { usePedidos } from "@/lib/use-pedidos";
import { getColumns } from "@/lib/store";

export const Route = createFileRoute("/_shell/")({
  component: Dashboard,
});

// Alertas y actividad reciente: feed de eventos sin fuente en el store todavía.
// Se mantienen como datos demo hasta tener historial de eventos persistido.
const ALERTAS = [
  { icon: CalendarClock, text: "Lucía Fernández reprogramó la entrega de MUE-1046 para mañana 10:00.", tone: "warning" as const, time: "hace 8 min" },
  { icon: PackageSearch, text: "Pedido MUE-1049 sin chofer asignado para mañana.",                      tone: "primary" as const, time: "hace 22 min" },
  { icon: UserX,         text: "Chofer Roberto marcó a Ana Rodríguez como cliente ausente.",            tone: "destructive" as const, time: "hace 41 min" },
  { icon: AlertTriangle, text: "Camión AB 770 HD continúa en taller — 2 entregas reasignadas.",         tone: "warning" as const, time: "hace 1 h" },
];

const TONE: Record<"warning" | "primary" | "destructive", string> = {
  warning: "bg-warning/10 text-warning",
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
};

function Dashboard() {
  // ── KPIs derivados del store (reactivos a pedidos creados y cambios) ──────
  const pedidos = usePedidos();
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

  // Pedidos de hoy sin confirmar (pendiente o no_responde)
  const sinConfirmarHoy = pedidos.filter(
    (p) =>
      p.fecha === "22/06/2026" &&
      (p.estado === "pendiente" || p.estado === "en_ruta") &&
      p.confirmacion !== "confirmado"
  );
  const noResponden = sinConfirmarHoy.filter((p) => p.confirmacion === "no_responde");

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

      {/* Bloque de confirmaciones pendientes */}
      {sinConfirmarHoy.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {sinConfirmarHoy.length} pedido{sinConfirmarHoy.length > 1 ? "s" : ""} programado{sinConfirmarHoy.length > 1 ? "s" : ""} para hoy sin confirmar con el cliente
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {noResponden.length > 0
                  ? `${noResponden.length} no responden. Contactar antes de despachar para evitar viajes fallidos.`
                  : "Contactar antes de despachar para evitar viajes fallidos."}
              </p>
              <ul className="mt-3 space-y-1.5">
                {sinConfirmarHoy.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-medium text-muted-foreground">{p.id}</span>
                    <span className="font-medium text-foreground">{p.cliente}</span>
                    <span className="text-muted-foreground">— {p.producto}</span>
                    <span
                      className={
                        "ml-auto rounded-full px-2 py-0.5 font-medium ring-1 ring-inset " +
                        (p.confirmacion === "no_responde"
                          ? "bg-destructive/10 text-destructive ring-destructive/20"
                          : "bg-warning/10 text-warning ring-warning/20")
                      }
                    >
                      {p.confirmacion === "no_responde" ? "No responde" : "Pendiente"}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Link
                  to="/armado-dia"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Ir al Armado del Día →
                </Link>
              </div>
            </div>
          </div>
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

        {/* Alertas */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Alertas operativas</h2>
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
              {ALERTAS.length}
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {ALERTAS.map((a, i) => {
              const Icon = a.icon;
              return (
                <li key={i} className="flex gap-3">
                  <span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-md " + TONE[a.tone]}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-foreground">{a.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
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

        {/* Actividad */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Actividad reciente</h2>
          <ol className="mt-4 space-y-4 border-l border-border pl-4">
            <li className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
              <p className="text-sm">Roberto Giménez marcó <strong>MUE-1043</strong> como entregado.</p>
              <p className="mt-0.5 text-xs text-muted-foreground">09:42 · Almagro</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" />
              <p className="text-sm">Marcelo Núñez inició la ruta del <strong>Camión 2</strong>.</p>
              <p className="mt-0.5 text-xs text-muted-foreground">08:55 · Depósito Barracas</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-card" />
              <p className="text-sm">Se cargaron 12 pedidos nuevos para mañana.</p>
              <p className="mt-0.5 text-xs text-muted-foreground">08:20 · Juan López</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card" />
              <p className="text-sm">MUE-1046 reprogramado por el cliente.</p>
              <p className="mt-0.5 text-xs text-muted-foreground">08:02 · Boedo</p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
