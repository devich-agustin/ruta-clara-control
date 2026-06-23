import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Info } from "lucide-react";
import { toast } from "sonner";
import { OCUPACION_SEMANA, type Pedido } from "@/lib/demo-data";
import { addPedido } from "@/lib/store";

export const Route = createFileRoute("/_shell/nuevo-pedido")({
  component: NuevoPedidoPage,
});

let _nextId = 1058;
function genId(): string {
  return `MUE-${_nextId++}`;
}

function today(): string {
  return "23/06/2026";
}

function NuevoPedidoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente:      "",
    telefono:     "",
    email:        "",
    direccion:    "",
    barrio:       "",
    producto:     "",
    cantidad:     "1",
    observaciones:"",
    fecha:        "2026-06-24",
    franja:       "09:00 a 12:00",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [saving, setSaving] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.cliente.trim())   e.cliente   = "Requerido";
    if (!form.telefono.trim())  e.telefono  = "Requerido";
    if (!form.direccion.trim()) e.direccion = "Requerido";
    if (!form.producto.trim())  e.producto  = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Completá los campos obligatorios");
      return;
    }

    setSaving(true);

    // Formato fecha demo: "24/06/2026"
    const [yyyy, mm, dd] = form.fecha.split("-");
    const fechaFormateada = `${dd}/${mm}/${yyyy}`;

    const nuevoPedido: Pedido = {
      id:           genId(),
      cliente:      form.cliente.trim(),
      telefono:     form.telefono.trim(),
      direccion:    form.direccion.trim(),
      barrio:       form.barrio.trim() || "CABA",
      producto:     form.producto.trim(),
      fecha:        fechaFormateada,
      estado:       "pendiente",
      confirmacion: "pendiente",
      prioridad:    "media",
    };

    addPedido(nuevoPedido);

    setTimeout(() => {
      setSaving(false);
      toast.success(`Pedido ${nuevoPedido.id} creado`, {
        description: `${nuevoPedido.cliente} · ${nuevoPedido.producto}`,
      });
      navigate({ to: "/pedidos" });
    }, 600);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link
            to="/pedidos"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a pedidos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Nuevo pedido</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cargá un pedido para asignarlo al circuito de entregas.
          </p>
        </div>
      </div>

      {/* Aviso demo */}
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Los pedidos creados se mantienen durante la sesión. Al recargar la página se reinician los datos demo.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <Card title="Cliente">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Cliente *"
                placeholder="Nombre y apellido"
                value={form.cliente}
                onChange={(v) => set("cliente", v)}
                error={errors.cliente}
              />
              <Field
                label="Teléfono *"
                placeholder="11 5555-5555"
                value={form.telefono}
                onChange={(v) => set("telefono", v)}
                error={errors.telefono}
              />
              <Field
                label="Email"
                placeholder="cliente@email.com"
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
              />
              <Field
                label="Dirección *"
                placeholder="Av. Corrientes 1234"
                value={form.direccion}
                onChange={(v) => set("direccion", v)}
                error={errors.direccion}
              />
              <Field
                label="Barrio"
                placeholder="Ej: Palermo"
                value={form.barrio}
                onChange={(v) => set("barrio", v)}
              />
            </div>
          </Card>

          <Card title="Producto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field
                  label="Producto *"
                  placeholder="Ej: Sillón 3 cuerpos tela lino"
                  value={form.producto}
                  onChange={(v) => set("producto", v)}
                  error={errors.producto}
                />
              </div>
              <Field
                label="Cantidad"
                type="number"
                value={form.cantidad}
                onChange={(v) => set("cantidad", v)}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium">Observaciones</label>
              <textarea
                rows={3}
                value={form.observaciones}
                onChange={(e) => set("observaciones", e.target.value)}
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
                  value={form.fecha}
                  onChange={(e) => set("fecha", e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Franja horaria</label>
                <select
                  value={form.franja}
                  onChange={(e) => set("franja", e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
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
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Guardando…" : "Guardar pedido"}
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
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/15 " +
          (error
            ? "border-destructive focus:border-destructive"
            : "border-border focus:border-primary")
        }
      />
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
