import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone,
  MapPin,
  Check,
  X,
  ChevronLeft,
  Package,
  Navigation,
  MessageCircle,
  PhoneCall,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import {
  PEDIDOS,
  ARMADO_DIA_INICIAL,
  getDetalle,
  getConfirmacion,
  CONFIRMACION_LABEL,
  type ConfirmacionCliente,
} from "@/lib/demo-data";

export const Route = createFileRoute("/chofer")({
  component: ChoferMobile,
});

// ── Tipos ──────────────────────────────────────────────────────────────────

interface Entrega {
  id: string;
  cliente: string;
  direccion: string;
  barrio: string;
  producto: string;
  telefono: string;
  observaciones: string;
  confirmacion: ConfirmacionCliente;
  mapUrl: string;
  estado: "pendiente" | "entregado" | "no_entregado";
  motivo?: string;
}

// ── Datos del Camión 1 desde el estado compartido ─────────────────────────

function buildEntregas(): Entrega[] {
  return ARMADO_DIA_INICIAL.camion_1
    .map((id) => {
      const pedido = PEDIDOS.find((p) => p.id === id);
      if (!pedido) return null;
      const detalle = getDetalle(id);
      const conf = getConfirmacion(id);
      return {
        id,
        cliente: pedido.cliente,
        direccion: pedido.direccion,
        barrio: pedido.barrio,
        producto: pedido.producto,
        telefono: pedido.telefono,
        observaciones: detalle.observaciones !== "—" ? detalle.observaciones : "",
        confirmacion: conf.estado,
        mapUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          `${pedido.direccion}, ${pedido.barrio}, Buenos Aires, Argentina`
        )}`,
        estado: "pendiente" as const,
      };
    })
    .filter((e): e is Entrega => e !== null);
}

const MOTIVOS = [
  "Cliente ausente",
  "Dirección incorrecta",
  "Reprogramó",
  "Otro",
];

// ── Badge de confirmación ─────────────────────────────────────────────────

function ConfirmBadge({ estado }: { estado: ConfirmacionCliente }) {
  const Icon =
    estado === "confirmado" ? CheckCircle2 : estado === "no_responde" ? XCircle : Clock;
  const tone =
    estado === "confirmado"
      ? "bg-success/15 text-success"
      : estado === "no_responde"
        ? "bg-destructive/15 text-destructive"
        : "bg-warning/15 text-warning";
  return (
    <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium " + tone}>
      <Icon className="h-3 w-3" />
      {CONFIRMACION_LABEL[estado]}
    </span>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

function ChoferMobile() {
  const [entregas, setEntregas] = useState<Entrega[]>(buildEntregas);
  const [motivoFor, setMotivoFor] = useState<string | null>(null);

  function marcar(id: string, estado: "entregado" | "no_entregado", motivo?: string) {
    setEntregas((prev) => prev.map((e) => (e.id === id ? { ...e, estado, motivo } : e)));
    setMotivoFor(null);
  }

  const completadas = entregas.filter((e) => e.estado !== "pendiente").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">

        {/* Header sticky */}
        <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="-ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </a>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              RG
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">Roberto Giménez</div>
              <div className="text-xs text-muted-foreground">Camión 1 · AE 432 KP · Iveco Daily</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Entregas del día</span>
              <span className="text-muted-foreground">{completadas} de {entregas.length}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: entregas.length > 0 ? `${(completadas / entregas.length) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </header>

        {/* Lista de entregas */}
        <main className="space-y-3 p-4 pb-24">
          {entregas.map((e, i) => (
            <article
              key={e.id}
              className={
                "rounded-xl border bg-card transition " +
                (e.estado === "entregado"
                  ? "border-success/30 bg-success/5"
                  : e.estado === "no_entregado"
                    ? "border-destructive/30 bg-destructive/5"
                    : e.confirmacion === "no_responde"
                      ? "border-warning/40"
                      : "border-border")
              }
            >
              <div className="p-4">
                {/* Número + cliente + estado */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-base font-semibold leading-tight">{e.cliente}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{e.id}</div>
                    </div>
                  </div>
                  {e.estado === "entregado" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                      <Check className="h-3 w-3" /> Entregado
                    </span>
                  )}
                  {e.estado === "no_entregado" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive">
                      <X className="h-3 w-3" /> No entregado
                    </span>
                  )}
                </div>

                {/* Detalle */}
                <div className="mt-4 space-y-2 text-sm">
                  {/* Dirección + Navegar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{e.direccion}, {e.barrio}</span>
                    </div>
                    <a
                      href={e.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 active:scale-95 transition-transform"
                    >
                      <Navigation className="h-3.5 w-3.5" /> Navegar
                    </a>
                  </div>

                  {/* Producto */}
                  <div className="flex items-start gap-2">
                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{e.producto}</span>
                  </div>

                  {/* Teléfono */}
                  <a href={`tel:${e.telefono}`} className="flex items-center gap-2 text-primary">
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">{e.telefono}</span>
                  </a>
                </div>

                {/* Observaciones */}
                {e.observaciones && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-foreground">{e.observaciones}</p>
                  </div>
                )}

                {/* Confirmación del cliente */}
                <div className="mt-3 flex items-center justify-between">
                  <ConfirmBadge estado={e.confirmacion} />
                  {e.confirmacion === "no_responde" && (
                    <span className="text-[11px] text-destructive font-medium">
                      ⚠ Riesgo de ausente
                    </span>
                  )}
                </div>

                {/* Motivo de no entrega */}
                {e.estado === "no_entregado" && e.motivo && (
                  <div className="mt-3 rounded-md bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    Motivo: <strong>{e.motivo}</strong>
                  </div>
                )}
              </div>

              {/* Botones acción */}
              {e.estado === "pendiente" && motivoFor !== e.id && (
                <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
                  <button
                    onClick={() => marcar(e.id, "entregado")}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-success text-base font-semibold text-success-foreground active:scale-[0.98] transition-transform"
                  >
                    <Check className="h-5 w-5" /> Entregado
                  </button>
                  <button
                    onClick={() => setMotivoFor(e.id)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-destructive text-base font-semibold text-destructive-foreground active:scale-[0.98] transition-transform"
                  >
                    <X className="h-5 w-5" /> No entregado
                  </button>
                </div>
              )}

              {/* Selector de motivo */}
              {motivoFor === e.id && (
                <div className="border-t border-border p-3">
                  <div className="text-sm font-medium">Indicá el motivo</div>
                  <div className="mt-2 space-y-1.5">
                    {MOTIVOS.map((m) => (
                      <button
                        key={m}
                        onClick={() => marcar(e.id, "no_entregado", m)}
                        className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-left text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                      >
                        {m}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setMotivoFor(null)}
                    className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </article>
          ))}

          {entregas.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <Package className="h-8 w-8 opacity-30" />
              <p className="text-sm">No hay entregas asignadas para hoy.</p>
            </div>
          )}
        </main>

        {/* Footer con resumen */}
        {completadas === entregas.length && entregas.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-border bg-card p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-sm font-semibold">Ruta completada</div>
                <div className="text-xs text-muted-foreground">
                  {entregas.filter((e) => e.estado === "entregado").length} entregados ·{" "}
                  {entregas.filter((e) => e.estado === "no_entregado").length} no entregados
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
