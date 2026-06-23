import type { EstadoPedido } from "@/lib/demo-data";
import { ESTADO_LABEL } from "@/lib/demo-data";

const STYLES: Record<EstadoPedido, string> = {
  entregado:    "bg-success/10 text-success ring-success/20",
  pendiente:    "bg-warning/10 text-warning ring-warning/25",
  en_ruta:      "bg-primary/10 text-primary ring-primary/20",
  reprogramado: "bg-destructive/10 text-destructive ring-destructive/20",
};

const DOTS: Record<EstadoPedido, string> = {
  entregado: "bg-success",
  pendiente: "bg-warning",
  en_ruta: "bg-primary",
  reprogramado: "bg-destructive",
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset " +
        STYLES[estado]
      }
    >
      <span className={"h-1.5 w-1.5 rounded-full " + DOTS[estado]} />
      {ESTADO_LABEL[estado]}
    </span>
  );
}
