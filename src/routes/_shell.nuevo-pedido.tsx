import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Save,
  Info,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { type Pedido } from "@/lib/demo-data";
import { addPedido } from "@/lib/store";

export const Route = createFileRoute("/_shell/nuevo-pedido")({
  component: NuevoPedidoPage,
});

// ── ID generator ────────────────────────────────────────────────────────────

let _nextId = 1058;
function genId(): string {
  return `MUE-${_nextId++}`;
}

// ── Dirección — autocompletado demo ────────────────────────────────────────
// Para integrar Google Places API, reemplazar fetchAddressSuggestions()
// con una llamada a:
//   GET https://maps.googleapis.com/maps/api/place/autocomplete/json
//     ?input=<query>&components=country:ar&key=<VITE_GOOGLE_PLACES_KEY>
// y mapear predictions[] al tipo AddressSuggestion.

interface AddressSuggestion {
  display: string;
  direccion: string;
  barrio: string;
  ciudad: string;
}

const DEMO_ADDRESSES: AddressSuggestion[] = [
  { display: "Av. Rivadavia 4521, Caballito, CABA",       direccion: "Av. Rivadavia 4521",      barrio: "Caballito",       ciudad: "CABA" },
  { display: "Gascón 1180, Almagro, CABA",                direccion: "Gascón 1180",             barrio: "Almagro",         ciudad: "CABA" },
  { display: "Av. Cabildo 2890, Belgrano, CABA",          direccion: "Av. Cabildo 2890",        barrio: "Belgrano",        ciudad: "CABA" },
  { display: "Honduras 5421, Palermo, CABA",              direccion: "Honduras 5421",           barrio: "Palermo",         ciudad: "CABA" },
  { display: "Av. Boedo 1240, Boedo, CABA",               direccion: "Av. Boedo 1240",          barrio: "Boedo",           ciudad: "CABA" },
  { display: "Av. Corrientes 3210, Abasto, CABA",         direccion: "Av. Corrientes 3210",     barrio: "Abasto",          ciudad: "CABA" },
  { display: "Bulnes 950, Palermo, CABA",                 direccion: "Bulnes 950",              barrio: "Palermo",         ciudad: "CABA" },
  { display: "Av. La Plata 1620, Caballito, CABA",        direccion: "Av. La Plata 1620",       barrio: "Caballito",       ciudad: "CABA" },
  { display: "Olleros 2110, Colegiales, CABA",            direccion: "Olleros 2110",            barrio: "Colegiales",      ciudad: "CABA" },
  { display: "Scalabrini Ortiz 2280, Palermo, CABA",      direccion: "Scalabrini Ortiz 2280",   barrio: "Palermo",         ciudad: "CABA" },
  { display: "Warnes 1450, Villa del Parque, CABA",       direccion: "Warnes 1450",             barrio: "Villa del Parque",ciudad: "CABA" },
  { display: "Mendoza 2890, Belgrano, CABA",              direccion: "Mendoza 2890",            barrio: "Belgrano",        ciudad: "CABA" },
  { display: "Av. San Juan 3300, Boedo, CABA",            direccion: "Av. San Juan 3300",       barrio: "Boedo",           ciudad: "CABA" },
  { display: "Fugl 863, Tandil, Buenos Aires",            direccion: "Fugl 863",                barrio: "Tandil",          ciudad: "Buenos Aires" },
  { display: "Av. España 742, Tandil, Buenos Aires",      direccion: "Av. España 742",          barrio: "Tandil",          ciudad: "Buenos Aires" },
  { display: "Rodríguez 890, Tandil, Buenos Aires",       direccion: "Rodríguez 890",           barrio: "Tandil",          ciudad: "Buenos Aires" },
  { display: "Av. Del Valle 1200, Mar del Plata",         direccion: "Av. Del Valle 1200",      barrio: "Mar del Plata",   ciudad: "Buenos Aires" },
  { display: "San Martín 450, Rosario, Santa Fe",         direccion: "San Martín 450",          barrio: "Rosario",         ciudad: "Santa Fe" },
];

// Reemplazar con Google Places API en producción
function fetchAddressSuggestions(query: string): AddressSuggestion[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  return DEMO_ADDRESSES.filter(
    (a) =>
      a.display.toLowerCase().includes(q) ||
      a.direccion.toLowerCase().includes(q) ||
      a.barrio.toLowerCase().includes(q),
  ).slice(0, 6);
}

// ── Resumen logístico — datos por semana ────────────────────────────────────

const BASE_MONDAY = new Date(2026, 5, 22); // lunes 22/06/2026

const WEEK_LABELS = ["Semana actual", "Próxima semana", "En 2 semanas", "En 3 semanas"];
const DAY_NAMES   = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const CAPACIDAD_BY_DAY = [24, 24, 24, 24, 24, 16]; // sábado = 16

// Entregas demo por semana y día [weekOffset][dayIndex 0=Lun…5=Sáb]
const OCCUPANCY: [number, number, number, number, number, number][] = [
  [15, 22, 10, 18, 17,  8],
  [20, 19, 23, 16, 21, 10],
  [18, 14, 22, 20, 15,  6],
  [21, 24, 17, 19, 22,  9],
];

interface DayData {
  dia: string;
  fecha: string;    // "22/06"
  fechaISO: string; // "2026-06-22" — valor de <input type="date">
  entregas: number;
  capacidad: number;
}

function getWeekData(offset: number): DayData[] {
  return DAY_NAMES.map((dia, i) => {
    const d = new Date(BASE_MONDAY);
    d.setDate(d.getDate() + offset * 7 + i);
    const dd   = String(d.getDate()).padStart(2, "0");
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return {
      dia,
      fecha:    `${dd}/${mm}`,
      fechaISO: `${yyyy}-${mm}-${dd}`,
      entregas: OCCUPANCY[offset][i],
      capacidad: CAPACIDAD_BY_DAY[i],
    };
  });
}

function getWeekRange(offset: number): string {
  const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const start = new Date(BASE_MONDAY);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 5);
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()}–${end.getDate()} ${MONTHS[start.getMonth()]}`
    : `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]}`;
}

function getWeekOffsetForDate(isoDate: string): number {
  for (let w = 0; w < 4; w++) {
    if (getWeekData(w).some((d) => d.fechaISO === isoDate)) return w;
  }
  return -1;
}

// ── Tipos ───────────────────────────────────────────────────────────────────

type AddressValidation = "none" | "validated" | "manual";

// ── Página principal ────────────────────────────────────────────────────────

function NuevoPedidoPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cliente:       "",
    telefono:      "",
    email:         "",
    direccion:     "",
    barrio:        "",
    producto:      "",
    cantidad:      "1",
    observaciones: "",
    fecha:         "2026-06-24",
    franja:        "09:00 a 12:00",
  });

  const [addressValidation, setAddressValidation] = useState<AddressValidation>("none");
  const [errors, setErrors]   = useState<Partial<Record<keyof typeof form, string>>>({});
  const [saving,  setSaving]  = useState(false);

  function setField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleAddressSelect(direccion: string, barrio: string) {
    setField("direccion", direccion);
    setField("barrio", barrio);
    setAddressValidation("validated");
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

    const [yyyy, mm, dd] = form.fecha.split("-");
    const fechaFormateada = `${dd}/${mm}/${yyyy}`;

    const nuevoPedido: Pedido = {
      id:                genId(),
      cliente:           form.cliente.trim(),
      telefono:          form.telefono.trim(),
      direccion:         form.direccion.trim(),
      barrio:            form.barrio.trim() || "CABA",
      producto:          form.producto.trim(),
      fecha:             fechaFormateada,
      estado:            "pendiente",
      confirmacion:      "pendiente",
      prioridad:         "media",
      direccionValidada: addressValidation === "validated",
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

      {/* Aviso sesión */}
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Los pedidos creados se mantienen durante la sesión. Al recargar la página se reinician los datos demo.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Formulario ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">

          <Card title="Cliente">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Cliente *"
                placeholder="Nombre y apellido"
                value={form.cliente}
                onChange={(v) => setField("cliente", v)}
                error={errors.cliente}
              />
              <Field
                label="Teléfono *"
                placeholder="11 5555-5555"
                value={form.telefono}
                onChange={(v) => setField("telefono", v)}
                error={errors.telefono}
              />
              <Field
                label="Email"
                placeholder="cliente@email.com"
                type="email"
                value={form.email}
                onChange={(v) => setField("email", v)}
              />
              <Field
                label="Barrio"
                placeholder="Se completa al elegir dirección"
                value={form.barrio}
                onChange={(v) => setField("barrio", v)}
              />
              {/* Dirección — fila completa para que el dropdown no se corte */}
              <div className="sm:col-span-2">
                <AddressField
                  value={form.direccion}
                  validation={addressValidation}
                  onChange={(v) => {
                    setField("direccion", v);
                    // Si edita manualmente, resetear validación
                    if (addressValidation === "validated") setAddressValidation("none");
                  }}
                  onSelect={handleAddressSelect}
                  onValidationChange={setAddressValidation}
                  error={errors.direccion}
                />
              </div>
            </div>
          </Card>

          <Card title="Producto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field
                  label="Producto *"
                  placeholder="Ej: Sillón 3 cuerpos tela lino"
                  value={form.producto}
                  onChange={(v) => setField("producto", v)}
                  error={errors.producto}
                />
              </div>
              <Field
                label="Cantidad"
                type="number"
                value={form.cantidad}
                onChange={(v) => setField("cantidad", v)}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium">Observaciones</label>
              <textarea
                rows={3}
                value={form.observaciones}
                onChange={(e) => setField("observaciones", e.target.value)}
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
                  onChange={(e) => setField("fecha", e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">Franja horaria</label>
                <select
                  value={form.franja}
                  onChange={(e) => setField("franja", e.target.value)}
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

        {/* ── Panel lateral ─────────────────────────────────────────────── */}
        <aside>
          <LogisticsSidebar selectedDate={form.fecha} />
        </aside>
      </div>
    </div>
  );
}

// ── AddressField ────────────────────────────────────────────────────────────

function AddressField({
  value,
  validation,
  onChange,
  onSelect,
  onValidationChange,
  error,
}: {
  value: string;
  validation: AddressValidation;
  onChange: (v: string) => void;
  onSelect: (direccion: string, barrio: string) => void;
  onValidationChange: (v: AddressValidation) => void;
  error?: string;
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleInput(v: string) {
    onChange(v);
    const s = fetchAddressSuggestions(v);
    setSuggestions(s);
    setOpen(s.length > 0);
  }

  function handleSelect(s: AddressSuggestion) {
    onSelect(s.direccion, s.barrio);
    onValidationChange("validated");
    setSuggestions([]);
    setOpen(false);
  }

  function handleBlur() {
    // Delay para permitir que el click en la sugerencia se procese primero
    setTimeout(() => {
      setOpen(false);
      if (value.trim() && validation === "none") {
        onValidationChange("manual");
      }
    }, 200);
  }

  const borderClass =
    error                      ? "border-destructive focus:border-destructive" :
    validation === "validated" ? "border-success focus:border-success"         :
                                 "border-border focus:border-primary";

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-xs font-medium">Dirección *</label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Escribí la dirección para ver sugerencias…"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          className={
            "h-9 w-full rounded-md border bg-background pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-primary/15 " +
            borderClass
          }
        />
        {validation === "validated" && (
          <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />
        )}
        {validation === "manual" && (
          <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warning" />
        )}
      </div>

      {/* Feedback de validación */}
      {validation === "validated" && (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-success">
          <CheckCircle2 className="h-3 w-3" /> Dirección validada
        </p>
      )}
      {validation === "manual" && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-warning">
          <AlertCircle className="h-3 w-3" /> Dirección sin validar — verificar con el cliente antes de despachar
        </p>
      )}
      {error && validation === "none" && (
        <p className="mt-1 text-[11px] text-destructive">{error}</p>
      )}

      {/* Dropdown de sugerencias */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-border bg-card shadow-lg">
          {suggestions.map((s) => (
            <button
              key={s.display}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-medium leading-snug">{s.direccion}</div>
                <div className="text-xs text-muted-foreground">
                  {s.barrio} · {s.ciudad}
                </div>
              </div>
            </button>
          ))}
          <div className="border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
            Sugerencias demo · Se reemplazarán con Google Places API en producción
          </div>
        </div>
      )}
    </div>
  );
}

// ── LogisticsSidebar ────────────────────────────────────────────────────────

function LogisticsSidebar({ selectedDate }: { selectedDate: string }) {
  const [weekOffset, setWeekOffset] = useState(() => {
    const w = getWeekOffsetForDate(selectedDate);
    return w >= 0 ? w : 0;
  });

  // Sincronizar semana visible cuando cambia la fecha del formulario
  useEffect(() => {
    const w = getWeekOffsetForDate(selectedDate);
    if (w >= 0) setWeekOffset(w);
  }, [selectedDate]);

  const weekData  = getWeekData(weekOffset);
  const weekRange = getWeekRange(weekOffset);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Resumen logístico</div>
        <span className="text-xs text-muted-foreground">{weekRange}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Capacidad disponible por día. Elegí una fecha con espacio.
      </p>

      {/* Selector de semana */}
      <div className="mt-4 grid grid-cols-2 gap-1">
        {WEEK_LABELS.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setWeekOffset(i)}
            className={
              "rounded px-2 py-1.5 text-[11px] font-medium transition-colors " +
              (weekOffset === i
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista de días */}
      <ul className="mt-4 space-y-1.5">
        {weekData.map((d) => {
          const pct        = Math.round((d.entregas / d.capacidad) * 100);
          const isSelected = d.fechaISO === selectedDate;
          const barColor   = pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success";

          return (
            <li
              key={d.fecha}
              className={
                "rounded-md px-2 py-2 transition-colors " +
                (isSelected ? "bg-primary/5 ring-2 ring-primary/40" : "hover:bg-muted/30")
              }
            >
              <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 shrink-0 font-medium">{d.dia}</span>
                  <span className="text-xs text-muted-foreground">{d.fecha}</span>
                  {isSelected && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary whitespace-nowrap">
                      fecha elegida
                    </span>
                  )}
                </div>
                <div className="shrink-0 text-xs">
                  <span
                    className={
                      "font-medium " +
                      (pct >= 90 ? "text-destructive" : "text-foreground")
                    }
                  >
                    {d.entregas}
                  </span>
                  <span className="text-muted-foreground"> / {d.capacidad}</span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={"h-full rounded-full transition-all " + barColor}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Leyenda */}
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-success" /> &lt; 70%
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-warning" /> 70–90%
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-destructive" /> Saturado
        </span>
      </div>
    </div>
  );
}

// ── Sub-componentes base ────────────────────────────────────────────────────

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
