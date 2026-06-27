import { useState, useEffect, useRef } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { subscribe, hydrate } from "./store";

// Lógica de tablero Kanban con drag & drop, compartida por Armado del Día y
// Preparación. Toda la mutación pasa por una referencia viva (columnsRef) para
// que los handlers nunca lean estado desactualizado por el batching de React.
export function useDndBoard<C extends string>(opts: {
  read: () => Record<C, string[]>;
  persist: (next: Record<C, string[]>) => void;
}) {
  const { read, persist } = opts;

  const [columns, setColumns] = useState<Record<C, string[]>>(read);
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  // Hidratar y sincronizar con el store; nunca pisar el estado en pleno drag.
  useEffect(() => {
    hydrate();
    const unsub = subscribe(() => {
      if (activeIdRef.current === null) {
        const next = read();
        columnsRef.current = next;
        setColumns(next);
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function findContainer(id: UniqueIdentifier, cols: Record<C, string[]>): C | undefined {
    if ((id as string) in cols) return id as C;
    return (Object.keys(cols) as C[]).find((k) => cols[k].includes(id as string));
  }

  function apply(next: Record<C, string[]>) {
    columnsRef.current = next;
    setColumns(next);
  }

  function onDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  // Movimiento entre columnas: se aplica de forma optimista mientras se arrastra.
  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const cols = columnsRef.current;
    const from = findContainer(active.id, cols);
    const to = findContainer(over.id, cols);
    if (!from || !to || from === to) return;

    const fromItems = cols[from].filter((x) => x !== active.id);
    const toItems = [...cols[to]];
    const overIdx = toItems.indexOf(over.id as string);
    const insertAt = overIdx >= 0 ? overIdx : toItems.length;

    apply({
      ...cols,
      [from]: fromItems,
      [to]: [...toItems.slice(0, insertAt), active.id as string, ...toItems.slice(insertAt)],
    });
  }

  // Al soltar: reordenamiento dentro de la columna + persistencia al store.
  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const cols = columnsRef.current;
    let next = cols;

    if (over) {
      const from = findContainer(active.id, cols);
      const to = findContainer(over.id, cols);
      if (from && to && from === to) {
        const a = cols[from].indexOf(active.id as string);
        const b = cols[to].indexOf(over.id as string);
        if (a !== b && b >= 0) {
          next = { ...cols, [from]: arrayMove(cols[from], a, b) };
        }
      }
    }

    apply(next);
    persist(next);
  }

  return { columns, activeId, sensors, onDragStart, onDragOver, onDragEnd };
}
