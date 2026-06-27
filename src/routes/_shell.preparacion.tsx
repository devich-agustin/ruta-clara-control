import { createFileRoute } from "@tanstack/react-router";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PREPARACION_LABEL, type EstadoPreparacion } from "@/lib/demo-data";
import { Package, Clock, CheckCircle2, Truck } from "lucide-react";
import {
  getPreparacionColumns,
  getPreparacionItem,
  setPreparacionColumns,
} from "@/lib/store";
import { useDndBoard } from "@/lib/use-board";

export const Route = createFileRoute("/_shell/preparacion")({
  component: PreparacionPage,
});

const COLUMNAS: Array<{ key: EstadoPreparacion; icon: typeof Clock; tone: string; ring: string }> = [
  { key: "pendiente",      icon: Clock,         tone: "text-muted-foreground", ring: "ring-border" },
  { key: "en_preparacion", icon: Package,       tone: "text-info",             ring: "ring-info/30" },
  { key: "listo",          icon: CheckCircle2,  tone: "text-success",          ring: "ring-success/30" },
  { key: "despachado",     icon: Truck,         tone: "text-primary",          ring: "ring-primary/30" },
];

// Tarjeta de preparación (presentacional). Reutilizada por la card arrastrable
// y por el overlay de arrastre.
function PrepCard({ id, ring, dragging = false }: { id: string; ring: string; dragging?: boolean }) {
  const item = getPreparacionItem(id);
  if (!item) return null;
  return (
    <div
      className={
        "rounded-md border bg-card p-3 shadow-sm ring-1 select-none " +
        (dragging ? "border-primary shadow-lg ring-primary/40" : "border-border " + ring)
      }
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-medium text-muted-foreground">{item.pedido}</span>
        <span className="text-[11px] text-muted-foreground">{item.fechaProgramada}</span>
      </div>
      <div className="mt-1.5 text-sm font-medium text-foreground">{item.cliente}</div>
      <div className="text-xs text-muted-foreground">{item.producto}</div>
      {item.responsable && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
          {item.responsable}
        </div>
      )}
    </div>
  );
}

function PrepSortableCard({ id, ring }: { id: string; ring: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={"cursor-grab active:cursor-grabbing " + (isDragging ? "opacity-40" : "")}
      {...attributes}
      {...listeners}
    >
      <PrepCard id={id} ring={ring} />
    </div>
  );
}

function PrepColumn({
  col,
  ids,
}: {
  col: (typeof COLUMNAS)[number];
  ids: string[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  const Icon = col.icon;
  return (
    <div className="flex min-h-[400px] flex-col rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className={"h-4 w-4 " + col.tone} />
          <span className="text-sm font-semibold">{PREPARACION_LABEL[col.key]}</span>
        </div>
        <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border">
          {ids.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={"flex-1 space-y-2.5 p-3 transition-colors " + (isOver ? "bg-primary/5" : "")}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {ids.map((id) => (
            <PrepSortableCard key={id} id={id} ring={col.ring} />
          ))}
          {ids.length === 0 && (
            <div className="rounded-md border border-dashed border-border bg-card/50 p-4 text-center text-xs text-muted-foreground">
              Sin pedidos
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function PreparacionPage() {
  // Mismo motor de drag & drop que Armado del Día.
  const { columns, activeId, sensors, onDragStart, onDragOver, onDragEnd } =
    useDndBoard<EstadoPreparacion>({ read: getPreparacionColumns, persist: setPreparacionColumns });

  const total = Object.values(columns).flat().length;
  const activeRing =
    activeId
      ? COLUMNAS.find((c) => columns[c.key].includes(activeId))?.ring ?? "ring-border"
      : "ring-border";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Preparación</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Depósito Barracas · {total} pedidos en proceso
          </p>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {COLUMNAS.map((col) => (
            <PrepColumn key={col.key} col={col} ids={columns[col.key]} />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
          {activeId ? <PrepCard id={activeId} ring={activeRing} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
