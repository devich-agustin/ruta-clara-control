import { createFileRoute, Link } from "@tanstack/react-router";
import { OCUPACION_SEMANA } from "@/lib/demo-data";
import { ArrowLeft, Save } from "lucide-react";

export const Route = createFileRoute("/_shell/nuevo-pedido")({
  component: NuevoPedidoPage,
});

function NuevoPedidoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link to="/pedidos" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a pedidos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Nuevo pedido</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cargá un pedido para asignarlo al circuito de entregas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Formulario */}
        <form className="space-y-6 lg:col-span-2">
          <Card title="Cliente">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Cliente" placeholder="Nombre y apellido" />
              <Field label="Teléfono" placeholder="11 5555-5555" />
              <Field label="Email" placeholder="cliente@email.com" type="email" />
              <Field label="Dirección" placeholder="Av. Corrientes 1234, CABA" />
            </div>
          </Card>

          <Card title="Producto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field label="Producto" placeholder="Ej: Sillón 3 cuerpos tela lino" />
              </div>
              <Field label="Cantidad" defaultValue="1" type="number" />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium">Observaciones</label>
              <textarea
                rows={3}
                placeholder="Indicaciones especiales para el chofer (piso, ascensor, horario, etc.)"
                className="w-full rounded-md border border-border bg-background p-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </Card>

          <Card title="Programación">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">Fecha disponible</label>
                <input
                  type="date"
                  defaultValue="2026-06-24"
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Franja horaria</label>
                <select className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                  <option>09:00 a 12:00</option>
                  <option>10:00 a 13:00</option>
                  <option>13:00 a 16:00</option>
                  <option>16:00 a 19:00</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-2">
            <Link
              to="/pedidos"
              className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium leading-9 hover:bg-muted"
            >
              Cancelar
            </Link>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Save className="h-4 w-4" /> Guardar pedido
            </button>
          </div>
        </form>

        {/* Panel lateral */}
        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold">Resumen logístico</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Entregas ya programadas por día. Sirve de referencia para elegir fecha.
            </p>

            <ul className="mt-5 space-y-3">
              {OCUPACION_SEMANA.map((d) => {
                const pct = Math.round((d.entregas / d.capacidad) * 100);
                const tone =
                  pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success";
                return (
                  <li key={d.dia}>
                    <div className="mb-1 flex items-baseline justify-between text-sm">
                      <div>
                        <span className="font-medium">{d.dia}</span>{" "}
                        <span className="text-xs text-muted-foreground">{d.fecha}</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{d.entregas}</span>{" "}
                        <span className="text-muted-foreground">/ {d.capacidad}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className={"h-full rounded-full " + tone} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> &lt; 70%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> 70–90%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> &gt; 90%</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  defaultValue,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}
