import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Phone,
  Mail,
  MapPin,
  Package,
  Truck,
  User,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Clock,
  Route as RouteIcon,
  RefreshCcw,
  UserX,
  Printer,
  History,
  AlertCircle,
  MessageCircle,
  PhoneCall,
  XCircle,
} from "lucide-react";
import { EstadoBadge } from "@/components/estado-badge";
import {
  type Pedido,
  type TipoEvento,
  type EventoPedido,
  type ConfirmacionCliente,
  getDetalle,
  getTimeline,
  getHistorialCliente,
  getConfirmacion,
  REPROGRAMACIONES,
  CONFIRMACION_TONE,
  CONFIRMACION_LABEL,
} from "@/lib/demo-data";

const EVENTO_ICON: Record<TipoEvento, { icon: typeof Clock; tone: string }> = {
  creado:       { icon: ClipboardList, tone: "bg-muted text-muted-foreground" },
  preparado:    { icon: Package,       tone: "bg-info/10 text-info" },
  programado:   { icon: CalendarDays,  tone: "bg-primary/10 text-primary" },
  ruta:         { icon: RouteIcon,     tone: "bg-primary/10 text-primary" },
  entregado:    { icon: CheckCircle2,  tone: "bg-success/10 text-success" },
  ausente:      { icon: UserX,         tone: "bg-destructive/10 text-destructive" },
  reprogramado: { icon: RefreshCcw,    tone: "bg-warning/10 text-warning" },
};

const MOTIVOS = [
  "Cliente ausente",
  "Cliente pidió cambio",
  "Problema logístico",
  "Producto faltante",
  "Otro",
];

export function PedidoDetalle({
  pedido,
  open,
  onOpenChange,
}: {
  pedido: Pedido | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [reprogOpen, setReprogOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [confirmacion, setConfirmacion] = useState<ConfirmacionCliente>(
    () => getConfirmacion(pedido?.id ?? "").estado
  );

  if (!pedido) return null;
  const d = getDetalle(pedido.id);
  const timeline = getTimeline(pedido.id);
  const historial = getHistorialCliente(pedido.id);
  const reprog = REPROGRAMACIONES[pedido.id] ?? [];
  const confirmDetalle = getConfirmacion(pedido.id);

  const entregadas = historial.filter((h) => h.resultado === "entregado").length;
  const fallidas = historial.filter((h) => h.resultado === "fallido").length;
  const reprogramadas = historial.filter((h) => h.resultado === "reprogramado").length;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto p-0 sm:max-w-2xl"
        >
          <SheetHeader className="border-b border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-mono text-muted-foreground">{pedido.id}</div>
                <SheetTitle className="mt-1 text-xl font-semibold">{pedido.cliente}</SheetTitle>
                <div className="mt-1 text-sm text-muted-foreground">{pedido.producto}</div>
              </div>
              <EstadoBadge estado={pedido.estado} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setReprogOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-muted"
              >
                <RefreshCcw className="h-3.5 w-3.5" /> Reprogramar entrega
              </button>
              <button
                onClick={() => setLabelOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-muted"
              >
                <Printer className="h-3.5 w-3.5" /> Imprimir etiqueta
              </button>
            </div>
          </SheetHeader>

          <div className="space-y-6 p-6">
            {/* Datos generales */}
            <Section title="Datos del pedido">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field icon={User} label="Cliente" value={pedido.cliente} />
                <Field icon={Phone} label="Teléfono" value={pedido.telefono} />
                <Field icon={Mail} label="Email" value={d.email} />
                <Field icon={MapPin} label="Dirección" value={`${pedido.direccion}, ${pedido.barrio}`} />
                <Field icon={Package} label="Producto" value={pedido.producto} />
                <Field icon={CalendarDays} label="Fecha de venta" value={d.fechaVenta} />
                <Field icon={CalendarDays} label="Disponible para entrega" value={d.fechaDisponible} />
                <Field icon={CalendarDays} label="Fecha programada" value={d.fechaProgramada} />
                <Field icon={User} label="Chofer asignado" value={d.chofer} />
                <Field icon={Truck} label="Vehículo asignado" value={d.vehiculo} />
              </div>
              <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
                <div className="text-xs font-medium text-muted-foreground">Observaciones internas</div>
                <div className="mt-1 text-sm text-foreground">{d.observaciones}</div>
              </div>
            </Section>

            {/* Confirmación del cliente */}
            <Section title="Confirmación del cliente">
              {/* Estado actual + acciones */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  {confirmacion === "confirmado" ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : confirmacion === "no_responde" ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning" />
                  )}
                  <span
                    className={
                      "text-sm font-semibold " +
                      (confirmacion === "confirmado"
                        ? "text-success"
                        : confirmacion === "no_responde"
                          ? "text-destructive"
                          : "text-warning")
                    }
                  >
                    {CONFIRMACION_LABEL[confirmacion]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1">Marcar como:</span>
                  {(["confirmado", "pendiente", "no_responde"] as ConfirmacionCliente[]).map((e) => (
                    <button
                      key={e}
                      onClick={() => setConfirmacion(e)}
                      className={
                        "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset transition-colors " +
                        (confirmacion === e
                          ? CONFIRMACION_TONE[e]
                          : "bg-muted text-muted-foreground ring-border hover:bg-card")
                      }
                    >
                      {CONFIRMACION_LABEL[e]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detalles del último intento */}
              {(confirmDetalle.ultimoIntento || confirmDetalle.canal || confirmDetalle.nota) && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {confirmDetalle.ultimoIntento && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Último contacto</div>
                        <div className="text-sm font-medium">{confirmDetalle.ultimoIntento}</div>
                      </div>
                    </div>
                  )}
                  {confirmDetalle.canal && (
                    <div className="flex items-start gap-2.5">
                      {confirmDetalle.canal === "whatsapp" ? (
                        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <div>
                        <div className="text-xs text-muted-foreground">Canal</div>
                        <div className="text-sm font-medium capitalize">{confirmDetalle.canal === "whatsapp" ? "WhatsApp" : "Llamada"}</div>
                      </div>
                    </div>
                  )}
                  {confirmDetalle.nota && (
                    <div className="sm:col-span-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                      <div className="text-xs text-muted-foreground">Nota interna</div>
                      <div className="mt-0.5 text-sm">{confirmDetalle.nota}</div>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* Timeline */}
            <Section title="Línea de tiempo">
              <ol className="space-y-4">
                {timeline.map((e, i) => (
                  <TimelineItem key={i} evento={e} last={i === timeline.length - 1} />
                ))}
              </ol>
            </Section>

            {/* Reprogramaciones */}
            {reprog.length > 0 && (
              <Section title="Historial de reprogramaciones">
                <ul className="divide-y divide-border rounded-md border border-border">
                  {reprog.map((r, i) => (
                    <li key={i} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <div className="text-sm font-medium">{r.motivo}</div>
                        <div className="text-xs text-muted-foreground">{r.fecha} · {r.autor}</div>
                      </div>
                      <div className="text-xs text-foreground">→ {r.nuevaFecha}</div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Historial del cliente */}
            <Section
              title="Historial del cliente"
              right={
                <span className="text-xs text-muted-foreground">{historial.length} pedidos previos</span>
              }
            >
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Stat label="Entregadas" value={entregadas} tone="text-success" />
                <Stat label="Fallidas" value={fallidas} tone="text-destructive" />
                <Stat label="Reprogramadas" value={reprogramadas} tone="text-warning" />
              </div>
              <ul className="divide-y divide-border rounded-md border border-border">
                {historial.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{h.producto}</div>
                      <div className="text-xs text-muted-foreground">{h.id} · {h.fecha}</div>
                    </div>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-medium " +
                        (h.resultado === "entregado"
                          ? "bg-success/10 text-success"
                          : h.resultado === "fallido"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning")
                      }
                    >
                      {h.resultado === "entregado" ? "Entregada" : h.resultado === "fallido" ? "Fallida" : "Reprogramada"}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </SheetContent>
      </Sheet>

      <ReprogramarModal open={reprogOpen} onOpenChange={setReprogOpen} pedido={pedido} />
      <EtiquetaModal open={labelOpen} onOpenChange={setLabelOpen} pedido={pedido} />
    </>
  );
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3 text-center">
      <div className={"text-xl font-semibold " + tone}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function TimelineItem({ evento, last }: { evento: EventoPedido; last: boolean }) {
  const { icon: Icon, tone } = EVENTO_ICON[evento.tipo];
  return (
    <li className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <span className={"flex h-8 w-8 items-center justify-center rounded-full " + tone}>
          <Icon className="h-4 w-4" />
        </span>
        {!last && <span className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className="min-w-0 flex-1 pb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-medium">{evento.titulo}</span>
          <span className="text-xs text-muted-foreground">{evento.fecha} · {evento.hora}</span>
        </div>
        {evento.detalle && <div className="text-sm text-muted-foreground">{evento.detalle}</div>}
        {evento.autor && <div className="text-xs text-muted-foreground">{evento.autor}</div>}
      </div>
    </li>
  );
}

function ReprogramarModal({
  pedido,
  open,
  onOpenChange,
}: {
  pedido: Pedido;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [fecha, setFecha] = useState("2026-06-24");
  const [franja, setFranja] = useState("10:00 a 13:00");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-warning" /> Reprogramar entrega
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
            <div className="font-medium">{pedido.cliente}</div>
            <div className="text-xs text-muted-foreground">{pedido.id} · {pedido.producto}</div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Motivo</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium">Nueva fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium">Franja</label>
              <select
                value={franja}
                onChange={(e) => setFranja(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                <option>09:00 a 12:00</option>
                <option>10:00 a 13:00</option>
                <option>13:00 a 16:00</option>
                <option>16:00 a 19:00</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Notas (opcional)</label>
            <textarea
              rows={3}
              placeholder="Ej: confirmar por WhatsApp antes de salir."
              className="w-full rounded-md border border-border bg-background p-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Guardar reprogramación
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EtiquetaModal({
  pedido,
  open,
  onOpenChange,
}: {
  pedido: Pedido;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Etiqueta de despacho
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-md border-2 border-dashed border-border bg-white p-5 text-foreground">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mueblería del Sur</div>
              <div className="text-base font-semibold">Etiqueta de despacho</div>
            </div>
            <div className="font-mono text-xs">{pedido.id}</div>
          </div>
          <div className="space-y-3 pt-3">
            <Row label="Cliente" value={pedido.cliente} />
            <Row label="Dirección" value={`${pedido.direccion}, ${pedido.barrio} — CABA`} />
            <Row label="Teléfono" value={pedido.telefono} />
            <Row label="Producto" value={pedido.producto} />
            <Row label="Programado" value={pedido.fecha} />
          </div>
          <div className="mt-4 grid grid-cols-5 gap-0.5">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="h-8" style={{ background: i % 3 === 0 ? "#0f172a" : i % 2 === 0 ? "#0f172a" : "transparent" }} />
            ))}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            Cerrar
          </button>
          <button
            onClick={() => window.print()}
            className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Imprimir
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

// Re-export for navbar icon parity
export { History, AlertCircle };
