import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  INCIDENCIAS,
  INCIDENCIA_LABEL,
  type TipoIncidencia,
  type Incidencia,
  type TipoEventoInc,
} from "@/lib/demo-data";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  UserX,
  Clock,
  RefreshCcw,
  Truck,
  Megaphone,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Check,
  AlertTriangle,
  DollarSign,
  Timer,
  CircleDot,
  Circle,
  User,
  Car,
  FileText,
  ArrowRight,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/incidencias")({
  component: IncidenciasPage,
});

// ── Mapeos de tipo ──────────────────────────────────────────────────────────

const TIPO_ICON: Record<TipoIncidencia, typeof Clock> = {
  cliente_ausente: UserX,
  demora:          Clock,
  reprogramacion:  RefreshCcw,
  vehiculo:        Truck,
  chofer:          Megaphone,
};

const TIPO_TONE: Record<TipoIncidencia, string> = {
  cliente_ausente: "bg-destructive/10 text-destructive",
  demora:          "bg-warning/10 text-warning",
  reprogramacion:  "bg-warning/10 text-warning",
  vehiculo:        "bg-destructive/10 text-destructive",
  chofer:          "bg-primary/10 text-primary",
};

// ── Mapeos de evento en historial ───────────────────────────────────────────

const EVENTO_ICON: Record<TipoEventoInc, typeof Circle> = {
  apertura:      AlertTriangle,
  actualizacion: RefreshCw,
  contacto:      Phone,
  resolucion:    CheckCircle2,
  nota:          FileText,
};

const EVENTO_TONE: Record<TipoEventoInc, string> = {
  apertura:      "bg-destructive/10 text-destructive",
  actualizacion: "bg-primary/10 text-primary",
  contacto:      "bg-success/10 text-success",
  resolucion:    "bg-success/15 text-success",
  nota:          "bg-muted text-muted-foreground",
};

// ── Constantes de filtros ───────────────────────────────────────────────────

const FILTROS_ESTADO = [
  { key: "todas",       label: "Todas" },
  { key: "abierta",     label: "Abiertas" },
  { key: "en_revision", label: "En revisión" },
  { key: "resuelta",    label: "Resueltas" },
] as const;

type FiltroEstado = typeof FILTROS_ESTADO[number]["key"];

const RESPONSABLES = ["Juan López", "Marcelo Núñez", "Roberto Giménez"];

// ── Badges ──────────────────────────────────────────────────────────────────

function PrioridadBadge({ p }: { p: "alta" | "media" | "baja" }) {
  const tone =
    p === "alta"  ? "bg-destructive/10 text-destructive" :
    p === "media" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground";
  return (
    <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " + tone}>
      {p === "alta" ? "Alta" : p === "media" ? "Media" : "Baja"}
    </span>
  );
}

function EstadoBadge({ e }: { e: "abierta" | "en_revision" | "resuelta" }) {
  const tone =
    e === "abierta"     ? "bg-destructive/5 text-destructive ring-destructive/20" :
    e === "en_revision" ? "bg-warning/5 text-warning ring-warning/25" :
                          "bg-success/5 text-success ring-success/20";
  const label = e === "abierta" ? "Abierta" : e === "en_revision" ? "En revisión" : "Resuelta";
  return (
    <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset " + tone}>
      {label}
    </span>
  );
}

// ── Timeline de estado (Abierta → En revisión → Resuelta) ──────────────────

const ESTADO_STEPS = [
  { key: "abierta",     label: "Abierta" },
  { key: "en_revision", label: "En revisión" },
  { key: "resuelta",    label: "Resuelta" },
] as const;

function EstadoTimeline({ estado }: { estado: "abierta" | "en_revision" | "resuelta" }) {
  const current = ESTADO_STEPS.findIndex((s) => s.key === estado);
  return (
    <div className="flex items-start">
      {ESTADO_STEPS.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={step.key} className="flex items-start">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                  (done   ? "bg-success text-success-foreground" :
                   active ? "bg-primary text-primary-foreground ring-4 ring-primary/15" :
                            "border-2 border-border text-muted-foreground")
                }
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={
                  "text-[11px] whitespace-nowrap " +
                  (active ? "font-semibold text-foreground" : "text-muted-foreground")
                }
              >
                {step.label}
              </span>
            </div>
            {i < ESTADO_STEPS.length - 1 && (
              <div
                className={"mt-3.5 h-px w-14 mx-1.5 " + (i < current ? "bg-success" : "bg-border")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────

function IncidenciasPage() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>(INCIDENCIAS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filtros
  const [filtroEstado,       setFiltroEstado]       = useState<FiltroEstado>("todas");
  const [filtroPrioridad,    setFiltroPrioridad]    = useState("todas");
  const [filtroTipo,         setFiltroTipo]         = useState("todas");
  const [filtroResponsable,  setFiltroResponsable]  = useState("todos");

  const selected = useMemo(
    () => incidencias.find((i) => i.id === selectedId) ?? null,
    [incidencias, selectedId],
  );

  const items = useMemo(
    () =>
      incidencias.filter((i) => {
        if (filtroEstado !== "todas" && i.estado !== filtroEstado) return false;
        if (filtroPrioridad !== "todas" && i.prioridad !== filtroPrioridad) return false;
        if (filtroTipo !== "todas" && i.tipo !== filtroTipo) return false;
        if (filtroResponsable !== "todos" && i.responsable !== filtroResponsable) return false;
        return true;
      }),
    [incidencias, filtroEstado, filtroPrioridad, filtroTipo, filtroResponsable],
  );

  // KPIs
  const abiertas      = useMemo(() => incidencias.filter((i) => i.estado !== "resuelta").length, [incidencias]);
  const criticas      = useMemo(() => incidencias.filter((i) => i.prioridad === "alta" && i.estado !== "resuelta").length, [incidencias]);
  const impactoTotal  = useMemo(() => incidencias.filter((i) => i.estado !== "resuelta").reduce((s, i) => s + i.costoEstimado, 0), [incidencias]);

  function marcarResuelta(id: string) {
    setIncidencias((prev) =>
      prev.map((i) => (i.id === id ? { ...i, estado: "resuelta" as const } : i)),
    );
    toast.success("Incidencia marcada como resuelta");
  }

  function marcarEnRevision(id: string) {
    setIncidencias((prev) =>
      prev.map((i) => (i.id === id ? { ...i, estado: "en_revision" as const } : i)),
    );
    toast.success("Incidencia en revisión");
  }

  function handleAccionRapida(label: string) {
    toast.info(label);
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incidencias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Centro de gestión operativa · {abiertas} incidencia{abiertas !== 1 ? "s" : ""} activa{abiertas !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          label="Incidencias abiertas"
          value={String(abiertas)}
          icon={CircleDot}
          tone={abiertas > 0 ? "text-destructive" : "text-success"}
          bg={abiertas > 0 ? "bg-destructive/10" : "bg-success/10"}
          sub="activas en este momento"
        />
        <KPICard
          label="Críticas sin resolver"
          value={String(criticas)}
          icon={AlertTriangle}
          tone={criticas > 0 ? "text-destructive" : "text-muted-foreground"}
          bg={criticas > 0 ? "bg-destructive/10" : "bg-muted"}
          sub="prioridad alta · sin cerrar"
        />
        <KPICard
          label="Tiempo prom. resolución"
          value="27 min"
          icon={Timer}
          tone="text-warning"
          bg="bg-warning/10"
          sub="promedio histórico del mes"
        />
        <KPICard
          label="Impacto económico"
          value={`$${impactoTotal.toLocaleString("es-AR")}`}
          icon={DollarSign}
          tone="text-primary"
          bg="bg-primary/10"
          sub="costo estimado — casos abiertos"
        />
      </div>

      {/* Tabla principal */}
      <div className="rounded-lg border border-border bg-card">

        {/* Filtros */}
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
          {/* Tabs de estado */}
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-1">
            {FILTROS_ESTADO.map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltroEstado(f.key)}
                className={
                  "rounded px-3 py-1 text-xs font-medium transition-colors " +
                  (filtroEstado === f.key
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Dropdowns de filtro */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="h-9 cursor-pointer rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none hover:bg-muted focus:border-primary"
            >
              <option value="todas">Tipo: Todos</option>
              {(Object.keys(INCIDENCIA_LABEL) as TipoIncidencia[]).map((t) => (
                <option key={t} value={t}>{INCIDENCIA_LABEL[t]}</option>
              ))}
            </select>

            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="h-9 cursor-pointer rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none hover:bg-muted focus:border-primary"
            >
              <option value="todas">Prioridad: Todas</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            <select
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
              className="h-9 cursor-pointer rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none hover:bg-muted focus:border-primary"
            >
              <option value="todos">Responsable: Todos</option>
              {RESPONSABLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <span className="text-sm text-muted-foreground sm:ml-auto">
            {items.length} resultado{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Filas */}
        <ul className="divide-y divide-border">
          {items.map((i) => {
            const Icon = TIPO_ICON[i.tipo];
            return (
              <li
                key={i.id}
                onClick={() => setSelectedId(i.id)}
                className={
                  "flex cursor-pointer items-start gap-3 px-4 py-4 sm:gap-4 sm:px-6 transition-colors hover:bg-muted/40 " +
                  (selectedId === i.id ? "bg-muted/50" : "")
                }
              >
                <span
                  className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-md " + TIPO_TONE[i.tipo]}
                >
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
                  <div className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{i.detalle}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{i.fecha}</span>
                    <span>·</span>
                    <span>{INCIDENCIA_LABEL[i.tipo]}</span>
                    {i.responsable && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {i.responsable}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <PrioridadBadge p={i.prioridad} />
                  <EstadoBadge e={i.estado} />
                  <span className="text-xs text-muted-foreground">
                    ${i.costoEstimado.toLocaleString("es-AR")}
                  </span>
                </div>
              </li>
            );
          })}

          {items.length === 0 && (
            <li className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 opacity-30" />
              <p className="text-sm">No hay incidencias que coincidan con los filtros.</p>
            </li>
          )}
        </ul>
      </div>

      {/* Drawer de detalle */}
      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="flex flex-col overflow-hidden p-0 sm:max-w-[600px]">
          <SheetTitle className="sr-only">
            {selected?.titulo ?? "Detalle de incidencia"}
          </SheetTitle>

          {selected && (
            <>
              {/* Cabecera fija */}
              <div className="shrink-0 border-b border-border px-6 pb-4 pt-5 pr-12">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {selected.id}
                  </span>
                  <span className={"rounded-full px-2 py-0.5 text-[11px] font-medium " + TIPO_TONE[selected.tipo]}>
                    {INCIDENCIA_LABEL[selected.tipo]}
                  </span>
                </div>
                <div className="mt-2 text-base font-semibold leading-snug">{selected.titulo}</div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <PrioridadBadge p={selected.prioridad} />
                  <EstadoBadge e={selected.estado} />
                </div>
              </div>

              {/* Cuerpo scrollable */}
              <div className="flex-1 overflow-y-auto">

                {/* Acciones rápidas */}
                <div className="border-b border-border p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        selected.clienteTelefono
                          ? handleAccionRapida(`Llamando a ${selected.cliente} — ${selected.clienteTelefono}`)
                          : toast.error("No hay teléfono registrado para esta incidencia")
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      <Phone className="h-4 w-4 text-success" />
                      Llamar cliente
                    </button>

                    <button
                      onClick={() => {
                        if (!selected.clienteTelefono) {
                          toast.error("No hay teléfono registrado");
                          return;
                        }
                        const num = "549" + selected.clienteTelefono.replace(/\D/g, "");
                        window.open(`https://wa.me/${num}`, "_blank");
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      <MessageCircle className="h-4 w-4 text-primary" />
                      WhatsApp
                    </button>

                    <button
                      onClick={() => handleAccionRapida("Redirigiendo a Armado del Día para reprogramar...")}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted active:scale-[0.98]"
                    >
                      <Calendar className="h-4 w-4 text-warning" />
                      Reprogramar
                    </button>

                    <button
                      onClick={() => marcarResuelta(selected.id)}
                      disabled={selected.estado === "resuelta"}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-success px-3 text-sm font-semibold text-success-foreground transition-colors hover:bg-success/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Marcar resuelta
                    </button>
                  </div>

                  {/* Avanzar estado */}
                  {selected.estado === "abierta" && (
                    <button
                      onClick={() => marcarEnRevision(selected.id)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Pasar a "En revisión"
                    </button>
                  )}
                </div>

                {/* Información del caso */}
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Información del caso
                  </h3>
                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <InfoItem icon={FileText} label="Pedido" value={selected.pedidoId ?? "—"} mono />
                    <InfoItem icon={User}     label="Cliente" value={selected.cliente ?? "—"} />
                    <InfoItem icon={User}     label="Chofer"  value={selected.chofer ?? "—"} />
                    <InfoItem icon={Car}      label="Vehículo" value={selected.vehiculo ?? "—"} />
                    <InfoItem icon={Clock}    label="Fecha"   value={selected.fecha} />
                    <InfoItem icon={User}     label="Responsable" value={selected.responsable} />
                  </dl>
                </div>

                {/* Timeline de estado */}
                <div className="border-b border-border px-6 py-4">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estado del caso
                  </h3>
                  <EstadoTimeline estado={selected.estado} />
                </div>

                {/* Impacto económico */}
                <div className="border-b border-border px-6 py-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Impacto estimado
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <ImpactoCard
                      label="Costo estimado"
                      value={`$${selected.costoEstimado.toLocaleString("es-AR")}`}
                      icon={DollarSign}
                      tone="text-destructive bg-destructive/10"
                    />
                    <ImpactoCard
                      label="Tiempo perdido"
                      value={`${selected.tiempoPerdido} min`}
                      icon={Timer}
                      tone="text-warning bg-warning/10"
                    />
                    <ImpactoCard
                      label="Reprogramación"
                      value={selected.reprogramacionRequerida ? "Requerida" : "No requerida"}
                      icon={selected.reprogramacionRequerida ? RefreshCcw : CheckCircle2}
                      tone={
                        selected.reprogramacionRequerida
                          ? "text-warning bg-warning/10"
                          : "text-success bg-success/10"
                      }
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="border-b border-border px-6 py-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Descripción completa
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">{selected.detalle}</p>
                </div>

                {/* Historial de eventos */}
                <div className="px-6 py-4">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Historial de eventos
                  </h3>
                  <ol className="relative space-y-4 border-l border-border pl-5">
                    {selected.historial.map((ev, idx) => {
                      const EvIcon = EVENTO_ICON[ev.tipo];
                      return (
                        <li key={idx} className="relative">
                          <div
                            className={
                              "absolute -left-[1.625rem] flex h-5 w-5 items-center justify-center rounded-full " +
                              EVENTO_TONE[ev.tipo]
                            }
                          >
                            <EvIcon className="h-2.5 w-2.5" />
                          </div>
                          <div className="text-sm font-medium leading-snug">{ev.texto}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {ev.fecha} · {ev.hora}
                            {ev.autor && <> · <span className="font-medium">{ev.autor}</span></>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function KPICard({
  label, value, icon: Icon, tone, bg, sub,
}: {
  label: string; value: string; icon: typeof Clock;
  tone: string; bg: string; sub: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={"flex h-7 w-7 items-center justify-center rounded-md " + bg}>
          <Icon className={"h-3.5 w-3.5 " + tone} />
        </span>
      </div>
      <div className={"mt-2 text-2xl font-semibold " + tone}>{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function InfoItem({
  icon: Icon, label, value, mono,
}: {
  icon: typeof Clock; label: string; value: string; mono?: boolean;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </dt>
      <dd className={"mt-0.5 " + (mono ? "font-mono text-xs text-primary" : "text-sm font-medium")}>
        {value}
      </dd>
    </div>
  );
}

function ImpactoCard({
  label, value, icon: Icon, tone,
}: {
  label: string; value: string; icon: typeof Clock; tone: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-2 sm:p-3 text-center">
      <div className={"mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full " + tone}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="text-sm font-semibold">{value}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
