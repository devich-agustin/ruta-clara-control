import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Filter, Download, ChevronDown } from "lucide-react";
import { EstadoBadge } from "@/components/estado-badge";
import { PedidoDetalle } from "@/components/pedido-detalle";
import {
  CONFIRMACION_TONE,
  CONFIRMACION_LABEL,
  type EstadoPedido,
  type Pedido,
} from "@/lib/demo-data";
import { usePedidos } from "@/lib/use-pedidos";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/pedidos")({
  component: PedidosPage,
});

const ESTADOS: Array<{ value: "todos" | EstadoPedido; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendientes" },
  { value: "en_ruta", label: "En ruta" },
  { value: "entregado", label: "Entregados" },
  { value: "reprogramado", label: "Reprogramados" },
];

function PedidosPage() {
  const pedidos = usePedidos();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todos" | EstadoPedido>("todos");
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return pedidos.filter((p) => {
      if (estado !== "todos" && p.estado !== estado) return false;
      if (q && !`${p.id} ${p.cliente} ${p.direccion} ${p.producto}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [q, estado]);

  function openPedido(p: Pedido) {
    setSelected(p);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} pedidos visibles · {pedidos.length} totales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Exportar", { description: "La exportación a Excel estará disponible en la versión con backend." })}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Exportar
          </button>
          <Link
            to="/nuevo-pedido"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Nuevo pedido
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
          {/* Search — full width on mobile */}
          <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por pedido, cliente, dirección…"
              className="h-9 w-full rounded-md border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/15"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5 overflow-x-auto rounded-md border border-border bg-background p-1">
              {ESTADOS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEstado(e.value)}
                  className={
                    "whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium transition-colors " +
                    (estado === e.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {e.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => toast.info("Filtro por fecha", { description: "El filtro por rango de fechas se habilitará con el backend conectado." })}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Filter className="h-4 w-4" /><span className="hidden sm:inline">Fecha:</span> Hoy <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile card list (< sm) */}
        <div className="divide-y divide-border sm:hidden">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => openPedido(p)}
              className="cursor-pointer px-4 py-3.5 transition-colors hover:bg-muted/40 active:bg-muted/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-medium text-muted-foreground">{p.id}</span>
                    <ConfirmacionBadge estado={p.confirmacion} />
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{p.cliente}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{p.direccion} · {p.barrio}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.producto}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <EstadoBadge estado={p.estado} />
                  <span className="text-xs text-muted-foreground">{p.fecha}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-16 text-center text-sm text-muted-foreground">
              No hay pedidos que coincidan con los filtros.
            </div>
          )}
        </div>

        {/* Desktop table (≥ sm) */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Pedido</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Dirección</th>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Confirmación</th>
                <th className="px-6 py-3">Estado</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => openPedido(p)}
                  className="group cursor-pointer hover:bg-muted/50"
                >
                  <td className="px-6 py-3.5 font-mono text-xs font-medium text-foreground">{p.id}</td>
                  <td className="px-6 py-3.5">
                    <div className="font-medium text-foreground">{p.cliente}</div>
                    <div className="text-xs text-muted-foreground">{p.telefono}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="text-foreground">{p.direccion}</div>
                    <div className="text-xs text-muted-foreground">{p.barrio}</div>
                  </td>
                  <td className="px-6 py-3.5 text-foreground">{p.producto}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{p.fecha}</td>
                  <td className="px-6 py-3.5">
                    <ConfirmacionBadge estado={p.confirmacion} />
                  </td>
                  <td className="px-6 py-3.5"><EstadoBadge estado={p.estado} /></td>
                  <td className="py-3.5 pr-5 text-right">
                    <span className="whitespace-nowrap text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Ver detalle →
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-sm text-muted-foreground">
                    No hay pedidos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
          <span>Mostrando 1–{filtered.length} de {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toast.info("Paginación disponible cuando haya más de 50 pedidos.")}
              className="rounded border border-border px-2 py-1 hover:bg-muted"
            >
              Anterior
            </button>
            <button
              onClick={() => toast.info("Paginación disponible cuando haya más de 50 pedidos.")}
              className="rounded border border-border px-2 py-1 hover:bg-muted"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <PedidoDetalle pedido={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function ConfirmacionBadge({ estado }: { estado: import("@/lib/demo-data").ConfirmacionCliente }) {
  const tone = CONFIRMACION_TONE[estado];
  const label = CONFIRMACION_LABEL[estado];
  const Icon = estado === "confirmado" ? CheckCircle2 : estado === "no_responde" ? XCircle : Clock;
  return (
    <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset " + tone}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
