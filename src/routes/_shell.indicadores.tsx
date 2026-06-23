import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Truck,
  DollarSign,
  ShieldCheck,
  BarChart2,
} from "lucide-react";
import {
  PEDIDOS,
  RESUMEN,
  MOTIVOS_FALLOS,
  ZONAS_ENTREGAS,
  RENDIMIENTO_VEHICULO,
  SEMANA,
} from "@/lib/demo-data";

export const Route = createFileRoute("/_shell/indicadores")({
  component: IndicadoresPage,
});

// ── Colores del tema (hex para Recharts) ──────────────────────────────────
const C = {
  success:     "#16a34a",
  primary:     "#3b82f6",
  warning:     "#f59e0b",
  destructive: "#ef4444",
  muted:       "#94a3b8",
  mutedBg:     "#f1f5f9",
};

// ── Métricas calculadas ───────────────────────────────────────────────────

const totalRealizadas  = 1184;
const totalFallos      = 47;
const totalReprog      = 67;
const totalIntentos    = totalRealizadas + totalFallos;
const tasaExito        = ((totalRealizadas / totalIntentos) * 100).toFixed(1);
const tasaFallo        = ((totalFallos / totalIntentos) * 100).toFixed(1);
const tasaReprog       = ((totalReprog / totalIntentos) * 100).toFixed(1);

// Confirmaciones de hoy (22/06)
const pedidosHoy       = PEDIDOS.filter((p) => p.fecha === "22/06/2026");
const confirmadosHoy   = pedidosHoy.filter((p) => p.confirmacion === "confirmado").length;
const noConf           = pedidosHoy.filter((p) => p.confirmacion !== "confirmado").length;
const pctNoConf        = Math.round((noConf / pedidosHoy.length) * 100);

// Viajes evitados (calculado demo)
// Sin sistema de confirmación, el sector promedia ~14% de clientes ausentes.
// Con Rutia: 28/1231 = 2.3%. Diferencia mensual estimada a escala de esta operación.
const viajesEvitados       = 18;
const costoViajeFallido    = 18_500;  // ARS promedio: combustible + tiempo chofer
const ahorroEstimado       = viajesEvitados * costoViajeFallido; // $333.000

// Tiempo estimado por ruta
const tiempoPromedioParada  = 11;   // min (de REPORTES_KPIS)
const tiempoTrasitoParada   = 14;   // min estimado entre paradas
const paradasPromedioCamion = 4;
const tiempoTotalRuta =
  paradasPromedioCamion * (tiempoPromedioParada + tiempoTrasitoParada); // 100 min

// ── Datos para gráficos ───────────────────────────────────────────────────

const PIE_HOY = [
  { name: "Entregados",    value: RESUMEN.entregados,    color: C.success },
  { name: "En ruta",       value: 12,                    color: C.primary },
  { name: "Pendientes",    value: RESUMEN.pendientes,    color: C.warning },
  { name: "Reprogramados", value: RESUMEN.reprogramados, color: C.destructive },
];

const CONF_HOY = [
  { label: "Confirmados",  value: confirmadosHoy, color: C.success,     pct: Math.round((confirmadosHoy / pedidosHoy.length) * 100) },
  { label: "Pendientes",   value: pedidosHoy.filter((p) => p.confirmacion === "pendiente").length, color: C.warning, pct: 0 },
  { label: "No responden", value: pedidosHoy.filter((p) => p.confirmacion === "no_responde").length, color: C.destructive, pct: 0 },
];
CONF_HOY[1].pct = Math.round((CONF_HOY[1].value / pedidosHoy.length) * 100);
CONF_HOY[2].pct = Math.round((CONF_HOY[2].value / pedidosHoy.length) * 100);

const ZONA_DATA = ZONAS_ENTREGAS.map((z) => ({
  zona:     z.zona,
  entregas: z.entregas,
  fallos:   z.fallos,
  tasa:     +(( z.fallos / z.entregas) * 100).toFixed(1),
}));

const SEMANA_DATA = SEMANA.map((s) => ({
  dia:       s.dia,
  entregas:  s.total,
}));

const maxMotivo = Math.max(...MOTIVOS_FALLOS.map((m) => m.v));
const maxVehiculo = Math.max(...RENDIMIENTO_VEHICULO.map((v) => v.entregas));

// ── Componentes internos ──────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  tone,
  icon: Icon,
  highlight,
  delta,
  deltaUp,
}: {
  label: string;
  value: string;
  sub: string;
  tone: string;
  icon: typeof TrendingUp;
  highlight?: boolean;
  delta?: string;
  deltaUp?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg border border-border bg-card p-5 " +
        (highlight ? "ring-2 ring-success/30" : "")
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className={"h-4 w-4 " + tone} />
      </div>
      <div className={"mt-3 text-3xl font-bold tracking-tight " + tone}>{value}</div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{sub}</span>
        {delta && (
          <span
            className={
              "flex items-center gap-0.5 text-xs font-medium " +
              (deltaUp ? "text-success" : "text-destructive")
            }
          >
            {deltaUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold">{children}</h2>
  );
}

function HBar({
  label,
  value,
  max,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium truncate pr-2">{label}</span>
        <span className="shrink-0 text-muted-foreground">
          {value}{suffix}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// Tooltip personalizado para Recharts
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-md">
      {label && <div className="mb-1 font-semibold text-foreground">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────

function IndicadoresPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Indicadores Operativos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Métricas de los últimos 30 días · Mueblería del Sur — Buenos Aires
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Tasa de éxito"
          value={`${tasaExito}%`}
          sub={`${totalRealizadas.toLocaleString("es-AR")} de ${totalIntentos.toLocaleString("es-AR")} intentos`}
          tone="text-success"
          icon={CheckCircle2}
          highlight
          delta="+2.1 pts vs. mes ant."
          deltaUp
        />
        <KpiCard
          label="Sin confirmar hoy"
          value={`${noConf} de ${pedidosHoy.length}`}
          sub={`${pctNoConf}% de los pedidos del día`}
          tone={noConf > 0 ? "text-warning" : "text-success"}
          icon={noConf > 0 ? AlertTriangle : CheckCircle2}
          delta={noConf > 0 ? "Riesgo de ausente" : "Todo confirmado"}
          deltaUp={noConf === 0}
        />
        <KpiCard
          label="Viajes evitados"
          value={String(viajesEvitados)}
          sub="Esta quincena · por confirmación previa"
          tone="text-primary"
          icon={ShieldCheck}
          delta="+6 vs. quincena ant."
          deltaUp
        />
        <KpiCard
          label="Ahorro estimado"
          value={`$${ahorroEstimado.toLocaleString("es-AR")}`}
          sub={`${viajesEvitados} viajes × $${costoViajeFallido.toLocaleString("es-AR")} c/u`}
          tone="text-success"
          icon={DollarSign}
          highlight
          delta="Esta quincena"
          deltaUp
        />
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "% Fallos",          value: `${tasaFallo}%`,   tone: "text-destructive", delta: "-12% vs. ant." },
          { label: "% Reprogramaciones",value: `${tasaReprog}%`,  tone: "text-warning",     delta: "-9% vs. ant." },
          { label: "Tiempo/ruta prom.", value: `${tiempoTotalRuta} min`, tone: "text-foreground", delta: `${paradasPromedioCamion} paradas` },
          { label: "Tiempo/parada",     value: `${tiempoPromedioParada} min`, tone: "text-foreground", delta: "-2 min vs. ant." },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-4">
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className={"mt-1.5 text-xl font-bold " + k.tone}>{k.value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Fila: Distribución del día + Confirmaciones */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Pie: estado del día */}
        <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
          <SectionTitle>Distribución de entregas — Hoy</SectionTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {RESUMEN.hoy} pedidos activos · Lunes 22 de junio
          </p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
            <div className="w-full sm:w-1/2" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_HOY}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {PIE_HOY.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 sm:w-1/2">
              {PIE_HOY.map((item) => {
                const pct = Math.round((item.value / PIE_HOY.reduce((a, b) => a + b.value, 0)) * 100);
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Confirmaciones del día */}
        <div className="rounded-lg border border-border bg-card p-6">
          <SectionTitle>Confirmaciones del día</SectionTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pedidosHoy.length} pedidos programados para hoy
          </p>
          <div className="mt-6 space-y-4">
            {CONF_HOY.map((c) => {
              const Icon = c.label === "Confirmados" ? CheckCircle2 : c.label === "No responden" ? XCircle : Clock;
              return (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: c.color }} />
                      <span className="font-medium">{c.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold" style={{ color: c.color }}>{c.value}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({c.pct}%)</span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${c.pct}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              );
            })}

            {noConf > 0 && (
              <div className="mt-2 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                <p className="text-xs text-foreground">
                  <span className="font-semibold">{noConf} pedido{noConf > 1 ? "s" : ""}</span> sin confirmar.
                  Contactar antes de despachar para evitar viajes fallidos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila: Motivos de fallo + Tiempo/ruta */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Motivos de no entrega */}
        <div className="rounded-lg border border-border bg-card p-6">
          <SectionTitle>Motivos de no entrega</SectionTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalFallos} entregas fallidas en los últimos 30 días
          </p>
          <div className="mt-6 space-y-4">
            {MOTIVOS_FALLOS.map((m) => (
              <HBar
                key={m.motivo}
                label={m.motivo}
                value={m.v}
                max={maxMotivo}
                color={m.motivo === "Cliente ausente" ? C.destructive : C.warning}
              />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            <span className="font-medium text-destructive">
              {MOTIVOS_FALLOS[0].v} ausentes ({Math.round((MOTIVOS_FALLOS[0].v / totalFallos) * 100)}%)
            </span>
            {" "}— el motivo más frecuente y más evitable con confirmación previa.
          </p>
        </div>

        {/* Rendimiento por vehículo */}
        <div className="rounded-lg border border-border bg-card p-6">
          <SectionTitle>Pedidos por vehículo — Últimos 30 días</SectionTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {RENDIMIENTO_VEHICULO.reduce((a, v) => a + v.entregas, 0)} entregas totales en la flota
          </p>
          <div className="mt-6 space-y-4">
            {RENDIMIENTO_VEHICULO.map((v) => (
              <div key={v.patente}>
                <HBar
                  label={v.patente}
                  value={v.entregas}
                  max={maxVehiculo}
                  color={v.entregas === 0 ? C.muted : C.primary}
                />
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Disponibilidad: {v.disponibilidad}%</span>
                  {v.entregas === 0 && (
                    <span className="text-destructive font-medium">En taller</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Entregas por zona (BarChart Recharts) */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <SectionTitle>Entregas por zona — Últimos 30 días</SectionTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Volumen de entregas y fallos por barrio. Las zonas con mayor tasa de fallo requieren atención.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: C.primary }} />
              Entregas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: C.destructive }} />
              Fallos
            </span>
          </div>
        </div>
        <div className="mt-6" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ZONA_DATA} barCategoryGap="30%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="zona" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="entregas" name="Entregas" fill={C.primary} radius={[3, 3, 0, 0]} />
              <Bar dataKey="fallos"   name="Fallos"   fill={C.destructive} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Tasa de fallo por zona */}
        <div className="mt-4 flex flex-wrap gap-2">
          {ZONA_DATA.sort((a, b) => b.tasa - a.tasa).map((z) => (
            <span
              key={z.zona}
              className={
                "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset " +
                (z.tasa >= 8
                  ? "bg-destructive/10 text-destructive ring-destructive/20"
                  : z.tasa >= 5
                    ? "bg-warning/10 text-warning ring-warning/20"
                    : "bg-success/10 text-success ring-success/20")
              }
            >
              {z.zona}: {z.tasa}% fallos
            </span>
          ))}
        </div>
      </div>

      {/* Tendencia semanal */}
      <div className="rounded-lg border border-border bg-card p-6">
        <SectionTitle>Entregas programadas — Semana actual</SectionTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Volumen diario · La barra de hoy incluye en ruta y pendientes.
        </p>
        <div className="mt-6" style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SEMANA_DATA} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="entregas" name="Pedidos" fill={C.primary} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight de valor: lo que Rutia hace por el negocio */}
      <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-primary">Lo que Rutia ya hizo por tu negocio este mes</h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InsightCard
            icon={ShieldCheck}
            title={`${viajesEvitados} viajes fallidos evitados`}
            desc="Gracias al sistema de confirmación previa, 18 clientes que habitualmente no responden fueron contactados y confirmaron antes del despacho."
            color="text-success"
            bg="bg-success/10"
          />
          <InsightCard
            icon={DollarSign}
            title={`$${ahorroEstimado.toLocaleString("es-AR")} en costos evitados`}
            desc={`Cada viaje fallido cuesta ~$${costoViajeFallido.toLocaleString("es-AR")} entre combustible, tiempo de chofer y re-programación logística.`}
            color="text-primary"
            bg="bg-primary/10"
          />
          <InsightCard
            icon={Truck}
            title="28.4% más de eficiencia"
            desc={`Tu tasa de éxito es del ${tasaExito}%. El promedio del sector sin sistema de gestión es del 85–88%. La diferencia es tiempo y dinero directo.`}
            color="text-warning"
            bg="bg-warning/10"
          />
        </div>

        <div className="mt-5 rounded-lg border border-primary/20 bg-card px-5 py-4">
          <p className="text-sm font-medium text-foreground">
            Proyección mensual:{" "}
            <span className="text-success font-bold">
              ${(ahorroEstimado * 2).toLocaleString("es-AR")} en ahorros
            </span>{" "}
            si se mantiene la tasa de confirmación actual.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Basado en {viajesEvitados} viajes evitados en la última quincena × 2 × ${costoViajeFallido.toLocaleString("es-AR")} promedio por viaje fallido.
            El sistema de Rutia se paga solo en el primer día del mes.
          </p>
        </div>
      </div>

    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  desc,
  color,
  bg,
}: {
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className={"mb-3 flex h-9 w-9 items-center justify-center rounded-lg " + bg}>
        <Icon className={"h-5 w-5 " + color} />
      </div>
      <div className="text-sm font-semibold leading-tight">{title}</div>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
