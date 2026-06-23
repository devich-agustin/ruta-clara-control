import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Save,
  CheckCircle,
  Truck,
  User,
  MapPin,
  Package,
  AlertTriangle,
  GripVertical,
  CheckCircle2,
  Clock,
  XCircle,
  ClipboardCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  CONFIRMACION_TONE,
  CONFIRMACION_LABEL,
  type ArmadoColumnId,
  type Pedido,
  type ConfirmacionCliente,
} from "@/lib/demo-data";
import { getPedidos, getArmadoInicial } from "@/lib/store";

export const Route = createFileRoute("/_shell/armado-dia")({
  component: ArmadoDiaPage,
});

// ── Tipos y configuración ──────────────────────────────────────────────────

type ColumnId = ArmadoColumnId;

interface VehicleConfig {
  label: string;
  patente: string;
  modelo: string;
  chofer: string;
  maxPedidos: number;
  capacidad: string;
  capacidadM3: number;
  isTruck: boolean;
}

const VEHICLE_CONFIGS: Record<Exclude<ColumnId, "sin_asignar">, VehicleConfig> = {
  camion_1: {
    label: "Camión 1",
    patente: "AE 432 KP",
    modelo: "Iveco Daily 35-150",
    chofer: "Roberto Giménez",
    maxPedidos: 6,
    capacidad: "4.5 m³",
    capacidadM3: 4.5,
    isTruck: true,
  },
  camion_2: {
    label: "Camión 2",
    patente: "AD 118 RT",
    modelo: "Mercedes Sprinter 415",
    chofer: "Marcelo Núñez",
    maxPedidos: 7,
    capacidad: "5.2 m³",
    capacidadM3: 5.2,
    isTruck: true,
  },
  flete_externo: {
    label: "Flete Externo",
    patente: "—",
    modelo: "A confirmar",
    chofer: "A designar",
    maxPedidos: 4,
    capacidad: "Variable",
    capacidadM3: 0,
    isTruck: false,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getPedido(id: string): Pedido | undefined {
  return getPedidos().find((p) => p.id === id);
}

function ConfirmBadge({ estado }: { estado: ConfirmacionCliente }) {
  const tone = CONFIRMACION_TONE[estado];
  const label = CONFIRMACION_LABEL[estado];
  const Icon =
    estado === "confirmado"
      ? CheckCircle2
      : estado === "no_responde"
        ? XCircle
        : Clock;
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset " + tone
      }
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

const PRIORIDAD_TONE: Record<string, string> = {
  alta:  "bg-destructive/10 text-destructive",
  media: "bg-warning/10 text-warning",
  baja:  "bg-muted text-muted-foreground",
};

// ── Tarjeta de pedido (presentacional) ───────────────────────────────────

function PedidoCard({
  pedido,
  isDragging = false,
  dragHandle,
}: {
  pedido: Pedido;
  isDragging?: boolean;
  dragHandle?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div
      className={
        "relative rounded-lg border bg-card p-3 shadow-sm select-none " +
        (isDragging
          ? "border-primary shadow-lg opacity-90 rotate-1"
          : pedido.confirmacion === "no_responde"
            ? "border-destructive/30"
            : "border-border hover:border-primary/40 hover:shadow-md") +
        " transition-all"
      }
    >
      {/* Confirmation status dot */}
      <div className="absolute -right-1 -top-1 z-10">
        <div
          className={
            "h-2.5 w-2.5 rounded-full ring-2 ring-card " +
            (pedido.confirmacion === "confirmado"
              ? "bg-success"
              : pedido.confirmacion === "no_responde"
                ? "bg-destructive"
                : "bg-warning")
          }
        />
      </div>
      {/* Fila superior: ID + prioridad */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {dragHandle && (
            <div {...dragHandle} className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground">
              <GripVertical className="h-3.5 w-3.5" />
            </div>
          )}
          <span className="font-mono text-[11px] font-medium text-muted-foreground">{pedido.id}</span>
        </div>
        <span className={"rounded px-1.5 py-0.5 text-[10px] font-semibold " + PRIORIDAD_TONE[pedido.prioridad]}>
          {pedido.prioridad === "alta" ? "Alta" : pedido.prioridad === "media" ? "Media" : "Baja"}
        </span>
      </div>

      {/* Cliente */}
      <div className="mt-1.5 text-sm font-semibold leading-tight text-foreground">{pedido.cliente}</div>

      {/* Barrio + Producto */}
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>{pedido.barrio}</span>
      </div>
      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
        <Package className="h-3 w-3 shrink-0" />
        <span className="truncate">{pedido.producto}</span>
      </div>

      {/* Confirmación */}
      <div className="mt-2.5 flex items-center justify-between">
        <ConfirmBadge estado={pedido.confirmacion} />
        {pedido.confirmacion === "no_responde" && (
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        )}
      </div>
    </div>
  );
}

// ── Item arrastrable ───────────────────────────────────────────────────────

function SortableCard({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const pedido = getPedido(id);
  if (!pedido) return null;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-40" : ""}
    >
      <PedidoCard
        pedido={pedido}
        dragHandle={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// ── Columna sin asignar ─────────────────────────────────────────────────────

function UnassignedColumn({ ids }: { ids: string[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "sin_asignar" });

  return (
    <div className="flex w-[280px] shrink-0 flex-col gap-3">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Sin asignar</span>
          {ids.length > 0 && (
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
              {ids.length}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Pedidos pendientes de asignación
        </p>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={
          "min-h-[120px] flex-1 rounded-lg border-2 border-dashed p-2 transition-colors " +
          (isOver
            ? "border-primary bg-primary/5"
            : "border-border/60 bg-muted/30")
        }
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {ids.map((id) => (
              <SortableCard key={id} id={id} />
            ))}
            {ids.length === 0 && (
              <div className="flex h-20 items-center justify-center text-xs text-muted-foreground">
                Sin pedidos
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// ── Columna de vehículo ───────────────────────────────────────────────────

function TruckColumn({ columnId, ids }: { columnId: Exclude<ColumnId, "sin_asignar">; ids: string[] }) {
  const config = VEHICLE_CONFIGS[columnId];
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  const pct = Math.round((ids.length / config.maxPedidos) * 100);
  const barColor =
    pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success";

  return (
    <div className="flex w-[280px] shrink-0 flex-col gap-3">
      {/* Header */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {config.isTruck ? (
              <Truck className="h-4 w-4 text-primary" />
            ) : (
              <Package className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold">{config.label}</span>
          </div>
          {columnId === "camion_1" && (
            <Link
              to="/chofer"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Smartphone className="h-3 w-3" /> Ver ruta
            </Link>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{config.chofer}</span>
        </div>
        {config.patente !== "—" && (
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{config.patente}</div>
        )}

        {/* Capacidad */}
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Pedidos</span>
            <span className="font-medium">
              {ids.length}
              <span className="text-muted-foreground"> / {config.maxPedidos}</span>
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={"h-full rounded-full transition-all " + barColor}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span
              className={
                "font-semibold " +
                (pct >= 90 ? "text-destructive" : pct >= 70 ? "text-warning" : "text-success")
              }
            >
              {pct}% utilizado
            </span>
            <span className="text-muted-foreground">{config.capacidad}</span>
          </div>
          {config.capacidadM3 > 0 && (
            <div className="mt-2 rounded-md bg-muted/50 px-2.5 py-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">m³ estimados</span>
                <span className="font-medium">{(ids.length * 0.5).toFixed(1)} m³</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between">
                <span className="text-muted-foreground">Disponible</span>
                <span
                  className={
                    "font-medium " +
                    (config.capacidadM3 - ids.length * 0.5 < 1
                      ? "text-destructive"
                      : "text-foreground")
                  }
                >
                  {Math.max(0, config.capacidadM3 - ids.length * 0.5).toFixed(1)} m³
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={
          "min-h-[120px] flex-1 rounded-lg border-2 border-dashed p-2 transition-colors " +
          (isOver
            ? "border-primary bg-primary/5"
            : ids.length >= config.maxPedidos
              ? "border-destructive/40 bg-destructive/5"
              : "border-border/60 bg-muted/30")
        }
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {ids.map((id) => (
              <SortableCard key={id} id={id} />
            ))}
            {ids.length === 0 && (
              <div className="flex h-20 flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
                <Package className="h-4 w-4 opacity-30" />
                <span>Arrastrá pedidos aquí</span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────

function ArmadoDiaPage() {
  const [columns, setColumns] = useState<Record<ColumnId, string[]>>(getArmadoInicial);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // ── Helpers ──────────────────────────────────────────────────────────────

  function findContainer(id: UniqueIdentifier): ColumnId | undefined {
    if (id in columns) return id as ColumnId;
    return (Object.keys(columns) as ColumnId[]).find((key) =>
      columns[key].includes(id as string)
    );
  }

  // ── Drag handlers ─────────────────────────────────────────────────────

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer =
      findContainer(over.id) ??
      (over.id in columns ? (over.id as ColumnId) : undefined);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setColumns((prev) => {
      const activeItems = prev[activeContainer].filter((id) => id !== active.id);
      const overItems = [...prev[overContainer]];
      const overIdx = overItems.indexOf(over.id as string);
      const newIdx = overIdx >= 0 ? overIdx : overItems.length;

      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: [
          ...overItems.slice(0, newIdx),
          active.id as string,
          ...overItems.slice(newIdx),
        ],
      };
    });
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer =
      findContainer(over.id) ??
      (over.id in columns ? (over.id as ColumnId) : undefined);

    if (!activeContainer || !overContainer || activeContainer !== overContainer) return;

    const activeIdx = columns[activeContainer].indexOf(active.id as string);
    const overIdx = columns[overContainer].indexOf(over.id as string);

    if (activeIdx !== overIdx && overIdx >= 0) {
      setColumns((prev) => ({
        ...prev,
        [activeContainer]: arrayMove(prev[activeContainer], activeIdx, overIdx),
      }));
    }
  }

  // ── Métricas ──────────────────────────────────────────────────────────

  const totalPedidos = Object.values(columns).flat().length;
  const sinAsignar   = columns.sin_asignar.length;
  const asignados    = totalPedidos - sinAsignar;
  const sinConfirmar = Object.values(columns)
    .flat()
    .filter((id) => {
      const p = getPedido(id);
      return p && p.confirmacion !== "confirmado";
    }).length;
  const vehiculosActivos = (["camion_1", "camion_2", "flete_externo"] as const).filter(
    (k) => columns[k].length > 0
  ).length;

  const activePedido = activeId ? getPedido(activeId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Armado del Día</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Martes 23 de junio · Asigná pedidos a vehículos y organizá la operación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success("Armado guardado", { description: "Los cambios fueron guardados como borrador." })}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Save className="h-4 w-4" /> Guardar armado
          </button>
          <button
            onClick={() => {
              if (sinAsignar > 0) {
                toast.error("Hay pedidos sin asignar", {
                  description: `${sinAsignar} pedido${sinAsignar > 1 ? "s" : ""} no tienen vehículo asignado.`,
                });
              } else {
                toast.success("Rutas confirmadas", {
                  description: "Los choferes recibirán sus entregas del día.",
                });
              }
            }}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <CheckCircle className="h-4 w-4" /> Confirmar rutas
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total pedidos" value={totalPedidos} tone="text-foreground" />
        <StatCard label="Asignados" value={asignados} tone="text-success" />
        <StatCard
          label="Sin asignar"
          value={sinAsignar}
          tone={sinAsignar > 0 ? "text-warning" : "text-success"}
          highlight={sinAsignar > 0}
        />
        <StatCard
          label="Sin confirmar"
          value={sinConfirmar}
          tone={sinConfirmar > 0 ? "text-destructive" : "text-success"}
          highlight={sinConfirmar > 0}
        />
        <StatCard label="Vehículos activos" value={vehiculosActivos} tone="text-primary" />
      </div>

      {/* Alerta de pedidos sin confirmar */}
      {sinConfirmar > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{sinConfirmar} pedidos sin confirmar.</span>{" "}
            Contactar al cliente antes de incluirlos en una ruta para evitar viajes fallidos.
          </p>
        </div>
      )}

      {/* Board de drag & drop */}
      <p className="text-xs text-muted-foreground lg:hidden">
        Deslizá horizontalmente para ver todos los vehículos
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <UnassignedColumn ids={columns.sin_asignar} />

          {/* Separador visual */}
          <div className="shrink-0 self-stretch border-l border-border" />

          <TruckColumn columnId="camion_1"    ids={columns.camion_1} />
          <TruckColumn columnId="camion_2"    ids={columns.camion_2} />
          <TruckColumn columnId="flete_externo" ids={columns.flete_externo} />
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activePedido ? (
            <PedidoCard pedido={activePedido} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Confirmado
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-warning" /> Pendiente de confirmar
        </span>
        <span className="flex items-center gap-1.5">
          <XCircle className="h-3.5 w-3.5 text-destructive" /> No responde — riesgo de ausente
        </span>
        <span className="ml-auto hidden sm:block">Arrastrá las tarjetas para reasignar pedidos entre vehículos</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  highlight,
}: {
  label: string;
  value: number;
  tone: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "rounded-lg border border-border bg-card p-4 " +
        (highlight ? "ring-1 ring-warning/30" : "")
      }
    >
      <div className="flex items-center gap-2">
        <ClipboardCheck className={"h-4 w-4 " + tone} />
      </div>
      <div className={"mt-2 text-2xl font-semibold tracking-tight " + tone}>{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
