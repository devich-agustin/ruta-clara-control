import { createFileRoute } from "@tanstack/react-router";
import { Plus, Phone, IdCard } from "lucide-react";
import { CHOFERES } from "@/lib/demo-data";

export const Route = createFileRoute("/_shell/choferes")({
  component: ChoferesPage,
});

function ChoferesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Choferes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{CHOFERES.length} choferes registrados · 3 activos hoy</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nuevo chofer
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Chofer</th>
              <th className="px-6 py-3">Licencia</th>
              <th className="px-6 py-3">Vehículo</th>
              <th className="px-6 py-3">Entregas (mes)</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CHOFERES.map((c) => (
              <tr key={c.nombre} className="hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {c.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{c.nombre}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {c.telefono}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <IdCard className="h-3.5 w-3.5 text-muted-foreground" />
                    {c.licencia}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs">{c.vehiculo}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{c.entregasMes}</div>
                  <div className="text-xs text-muted-foreground">entregas</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset " +
                      (c.estado === "Activo"
                        ? "bg-success/10 text-success ring-success/20"
                        : "bg-muted text-muted-foreground ring-border")
                    }
                  >
                    <span className={"h-1.5 w-1.5 rounded-full " + (c.estado === "Activo" ? "bg-success" : "bg-muted-foreground")} />
                    {c.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
