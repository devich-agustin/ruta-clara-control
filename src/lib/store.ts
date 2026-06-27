import {
  PEDIDOS,
  ARMADO_DIA_INICIAL,
  INCIDENCIAS,
  TIMELINE,
  REPROGRAMACIONES,
  getTimeline,
  type Pedido,
  type ArmadoColumnId,
  type Incidencia,
  type EventoPedido,
  type Reprogramacion,
  type ConfirmacionCliente,
  type TipoIncidencia,
} from "./demo-data";

// ── Estado compartido de la sesión ──────────────────────────────────────────
// Fuente única de verdad para pedidos, asignaciones, eventos e incidencias.
// Se persiste en localStorage para sobrevivir recargas.
// (En SSR no hay window/localStorage, por eso todo está protegido con guardas.)

export type Columns = Record<ArmadoColumnId, string[]>;

const STORAGE_KEY = "rutia.state.v2";

export const USUARIO_ACTUAL = "Juan López";

// Info de vehículo/chofer derivada de la columna del board de Armado del Día.
export const COLUMN_INFO: Record<ArmadoColumnId, { label: string; vehiculo: string; chofer: string }> = {
  sin_asignar:   { label: "Sin asignar",   vehiculo: "Sin asignar",                   chofer: "Sin asignar" },
  camion_1:      { label: "Camión 1",      vehiculo: "Iveco Daily — AE 432 KP",       chofer: "Roberto Giménez" },
  camion_2:      { label: "Camión 2",      vehiculo: "Mercedes Sprinter — AD 118 RT", chofer: "Marcelo Núñez" },
  flete_externo: { label: "Flete Externo", vehiculo: "Flete externo",                 chofer: "A designar" },
};

// Opciones para los selectores de "Cambiar vehículo / chofer".
export const COLUMNAS_ASIGNABLES: ArmadoColumnId[] = ["camion_1", "camion_2", "flete_externo", "sin_asignar"];

// ── Helpers de columnas ─────────────────────────────────────────────────────

function cloneColumns(c: Columns): Columns {
  return {
    sin_asignar: [...c.sin_asignar],
    camion_1: [...c.camion_1],
    camion_2: [...c.camion_2],
    flete_externo: [...c.flete_externo],
  };
}

function normalizeColumns(raw: unknown): Columns {
  const base = cloneColumns(ARMADO_DIA_INICIAL);
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<Record<ArmadoColumnId, unknown>>;
  (Object.keys(base) as ArmadoColumnId[]).forEach((key) => {
    if (Array.isArray(r[key])) {
      base[key] = (r[key] as unknown[]).filter((v): v is string => typeof v === "string");
    }
  });
  return base;
}

function removeEverywhere(cols: Columns, id: string): Columns {
  return {
    sin_asignar:   cols.sin_asignar.filter((x) => x !== id),
    camion_1:      cols.camion_1.filter((x) => x !== id),
    camion_2:      cols.camion_2.filter((x) => x !== id),
    flete_externo: cols.flete_externo.filter((x) => x !== id),
  };
}

// ── Estado ──────────────────────────────────────────────────────────────────

let _pedidos: Pedido[] = [...PEDIDOS];
let _columns: Columns = cloneColumns(ARMADO_DIA_INICIAL);
let _eventos: Record<string, EventoPedido[]> = {};        // eventos añadidos en la sesión
let _incidencias: Incidencia[] = [...INCIDENCIAS];
let _reprogs: Record<string, Reprogramacion[]> = {};      // reprogramaciones añadidas en la sesión
let _hydrated = false;

type Listener = () => void;
const _listeners = new Set<Listener>();

function notify() {
  _listeners.forEach((fn) => fn());
}

// ── Utilidades de tiempo (solo se invocan en el cliente, ante acciones) ──────

function stamp(): { fecha: string; hora: string } {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return { fecha: `${dd}/${mm}/${d.getFullYear()}`, hora: `${hh}:${min}` };
}

function isoToDmy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function pushEvento(id: string, ev: EventoPedido) {
  _eventos = { ..._eventos, [id]: [...(_eventos[id] ?? []), ev] };
}

// ── Persistencia ────────────────────────────────────────────────────────────

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        pedidos: _pedidos,
        columns: _columns,
        eventos: _eventos,
        incidencias: _incidencias,
        reprogs: _reprogs,
      }),
    );
  } catch {
    // Cuota llena / modo privado: la demo sigue funcionando en memoria.
  }
}

export function hydrate(): void {
  if (_hydrated || typeof window === "undefined") return;
  _hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.pedidos)) {
      _pedidos = data.pedidos as Pedido[];
      _columns = normalizeColumns(data.columns);
      if (data.eventos && typeof data.eventos === "object") _eventos = data.eventos;
      if (Array.isArray(data.incidencias)) _incidencias = data.incidencias;
      if (data.reprogs && typeof data.reprogs === "object") _reprogs = data.reprogs;
      notify();
    }
  } catch {
    // JSON inválido: ignorar y seguir con los datos demo.
  }
}

// ── Lecturas ────────────────────────────────────────────────────────────────

export function getPedidos(): Pedido[] {
  return _pedidos;
}

export function getPedidoById(id: string): Pedido | undefined {
  return _pedidos.find((p) => p.id === id);
}

export function getColumns(): Columns {
  return _columns;
}

export function getCamion1Ids(): string[] {
  return _columns.camion_1;
}

export function getColumnaDe(id: string): ArmadoColumnId {
  return (Object.keys(_columns) as ArmadoColumnId[]).find((k) => _columns[k].includes(id)) ?? "sin_asignar";
}

export function getAsignacion(id: string) {
  const columna = getColumnaDe(id);
  return { columna, ...COLUMN_INFO[columna] };
}

// Eventos: timeline demo (si existe) + eventos de la sesión.
export function getEventos(id: string): EventoPedido[] {
  const extra = _eventos[id] ?? [];
  if (TIMELINE[id]) return [...TIMELINE[id], ...extra];
  if (extra.length) return extra;        // pedido creado en sesión
  return getTimeline(id);                // fallback demo para sembrados sin timeline
}

// Convierte fecha "dd/mm/yyyy" + hora "hh:mm" en un entero ordenable.
function sortKey(fecha: string, hora: string): number {
  const [d, m, y] = fecha.split("/").map((n) => Number(n) || 0);
  const [hh, min] = hora.split(":").map((n) => Number(n) || 0);
  return y * 1e8 + m * 1e6 + d * 1e4 + hh * 100 + min;
}

export interface ActividadItem {
  pedidoId: string;
  cliente: string;
  evento: EventoPedido;
}

// Feed de actividad reciente: aplana los eventos de todos los pedidos y los
// ordena del más reciente al más antiguo. Alimenta el Dashboard.
export function getActividadReciente(limit = 6): ActividadItem[] {
  const items: ActividadItem[] = [];
  _pedidos.forEach((p) => {
    getEventos(p.id).forEach((evento) => items.push({ pedidoId: p.id, cliente: p.cliente, evento }));
  });
  items.sort((a, b) => sortKey(b.evento.fecha, b.evento.hora) - sortKey(a.evento.fecha, a.evento.hora));
  return items.slice(0, limit);
}

// Ids de pedidos creados durante esta sesión (tienen un evento "creado" propio).
export function getIdsCreadosEnSesion(): string[] {
  return Object.keys(_eventos).filter((id) => (_eventos[id] ?? []).some((e) => e.tipo === "creado"));
}

export function getReprogramaciones(id: string): Reprogramacion[] {
  return [...(_reprogs[id] ?? []), ...(REPROGRAMACIONES[id] ?? [])];
}

export function getIncidencias(): Incidencia[] {
  return _incidencias;
}

export function getIncidenciasByPedido(id: string): Incidencia[] {
  return _incidencias.filter((i) => i.pedidoId === id);
}

// ── Mutaciones de pedidos ─────────────────────────────────────────────────────

export function addPedido(p: Pedido): void {
  _pedidos = [p, ..._pedidos];
  _columns = { ..._columns, sin_asignar: [p.id, ..._columns.sin_asignar] };
  const s = stamp();
  pushEvento(p.id, { tipo: "creado", titulo: "Pedido creado", fecha: s.fecha, hora: s.hora, autor: USUARIO_ACTUAL });
  persist();
  notify();
}

export function updatePedido(id: string, patch: Partial<Pedido>): void {
  _pedidos = _pedidos.map((p) => (p.id === id ? { ...p, ...patch } : p));
  persist();
  notify();
}

// Reasigna el board completo (drag & drop del Armado del Día) y registra en el
// timeline cada pedido que cambió de columna, comparando contra el estado previo.
export function setColumns(next: Columns): void {
  const prev = _columns;
  const colDe = (cols: Columns, id: string): ArmadoColumnId =>
    (Object.keys(cols) as ArmadoColumnId[]).find((k) => cols[k].includes(id)) ?? "sin_asignar";

  const ids = new Set<string>([...Object.values(prev).flat(), ...Object.values(next).flat()]);
  const s = stamp();
  ids.forEach((id) => {
    const antes = colDe(prev, id);
    const ahora = colDe(next, id);
    if (antes === ahora) return;
    const info = COLUMN_INFO[ahora];
    if (ahora === "sin_asignar") {
      pushEvento(id, { tipo: "asignado", titulo: "Movido a Sin asignar", fecha: s.fecha, hora: s.hora, autor: USUARIO_ACTUAL });
    } else {
      pushEvento(id, {
        tipo: "asignado",
        titulo: `Asignado a ${info.label}`,
        detalle: `${info.vehiculo} · ${info.chofer}`,
        fecha: s.fecha,
        hora: s.hora,
        autor: USUARIO_ACTUAL,
      });
    }
  });

  _columns = next;
  persist();
  notify();
}

export function setConfirmacion(id: string, estado: ConfirmacionCliente): void {
  _pedidos = _pedidos.map((p) => (p.id === id ? { ...p, confirmacion: estado } : p));
  const s = stamp();
  const titulo =
    estado === "confirmado" ? "Cliente confirmó la entrega" : estado === "no_responde" ? "Cliente no responde" : "Confirmación pendiente";
  pushEvento(id, { tipo: "confirmacion", titulo, fecha: s.fecha, hora: s.hora, autor: USUARIO_ACTUAL });
  persist();
  notify();
}

export function marcarEntregado(id: string, autor: string = USUARIO_ACTUAL): void {
  _pedidos = _pedidos.map((p) => (p.id === id ? { ...p, estado: "entregado" } : p));
  const s = stamp();
  pushEvento(id, { tipo: "entregado", titulo: "Entregado", fecha: s.fecha, hora: s.hora, autor });
  persist();
  notify();
}

export function registrarEntregaFallida(id: string, motivo: string, autor: string = USUARIO_ACTUAL): void {
  const s = stamp();
  pushEvento(id, { tipo: "fallido", titulo: "Entrega fallida", detalle: motivo, fecha: s.fecha, hora: s.hora, autor });
  persist();
  notify();
}

export function reprogramar(
  id: string,
  opts: { fecha: string; franja: string; motivo: string; nota?: string },
): void {
  const fechaDmy = isoToDmy(opts.fecha);
  const nuevaFecha = `${fechaDmy} — ${opts.franja}`;
  _pedidos = _pedidos.map((p) => (p.id === id ? { ...p, fecha: fechaDmy, estado: "reprogramado" } : p));
  const s = stamp();
  _reprogs = {
    ..._reprogs,
    [id]: [
      { fecha: `${s.fecha} ${s.hora}`, motivo: opts.motivo, nuevaFecha, autor: USUARIO_ACTUAL },
      ...(_reprogs[id] ?? []),
    ],
  };
  pushEvento(id, {
    tipo: "reprogramado",
    titulo: "Reprogramado",
    detalle: `${opts.motivo} → ${nuevaFecha}${opts.nota ? ` · ${opts.nota}` : ""}`,
    fecha: s.fecha,
    hora: s.hora,
    autor: USUARIO_ACTUAL,
  });
  persist();
  notify();
}

export function cambiarVehiculo(id: string, col: ArmadoColumnId): void {
  const cleaned = removeEverywhere(_columns, id);
  cleaned[col] = [...cleaned[col], id];
  _columns = cleaned;
  const info = COLUMN_INFO[col];
  const s = stamp();
  pushEvento(id, { tipo: "ruta", titulo: "Vehículo reasignado", detalle: `${info.label} · ${info.vehiculo}`, fecha: s.fecha, hora: s.hora, autor: USUARIO_ACTUAL });
  persist();
  notify();
}

export function cambiarChofer(id: string, col: ArmadoColumnId): void {
  const cleaned = removeEverywhere(_columns, id);
  cleaned[col] = [...cleaned[col], id];
  _columns = cleaned;
  const info = COLUMN_INFO[col];
  const s = stamp();
  pushEvento(id, { tipo: "ruta", titulo: "Chofer reasignado", detalle: `${info.chofer} (${info.label})`, fecha: s.fecha, hora: s.hora, autor: USUARIO_ACTUAL });
  persist();
  notify();
}

// ── Mutaciones de incidencias ─────────────────────────────────────────────────

export function crearIncidencia(input: {
  tipo: TipoIncidencia;
  titulo: string;
  detalle: string;
  prioridad: "alta" | "media" | "baja";
  pedidoId?: string;
  cliente?: string;
  clienteTelefono?: string;
  chofer?: string;
  vehiculo?: string;
}): Incidencia {
  const s = stamp();
  const nextNum = Math.max(0, ..._incidencias.map((i) => Number(i.id.replace("INC-", "")) || 0)) + 1;
  const inc: Incidencia = {
    id: `INC-${nextNum}`,
    tipo: input.tipo,
    titulo: input.titulo,
    detalle: input.detalle,
    fecha: `Hoy ${s.hora}`,
    prioridad: input.prioridad,
    estado: "abierta",
    referencia: input.pedidoId,
    pedidoId: input.pedidoId,
    cliente: input.cliente,
    clienteTelefono: input.clienteTelefono,
    chofer: input.chofer,
    vehiculo: input.vehiculo,
    responsable: USUARIO_ACTUAL,
    costoEstimado: 0,
    tiempoPerdido: 0,
    reprogramacionRequerida: input.tipo === "cliente_ausente" || input.tipo === "reprogramacion",
    historial: [{ tipo: "apertura", texto: input.detalle, fecha: s.fecha, hora: s.hora, autor: USUARIO_ACTUAL }],
  };
  _incidencias = [inc, ..._incidencias];
  if (input.pedidoId) {
    pushEvento(input.pedidoId, { tipo: "ausente", titulo: `Incidencia abierta · ${inc.id}`, detalle: input.titulo, fecha: s.fecha, hora: s.hora, autor: USUARIO_ACTUAL });
  }
  persist();
  notify();
  return inc;
}

export function updateIncidencia(id: string, patch: Partial<Incidencia>): void {
  const anterior = _incidencias.find((i) => i.id === id);
  _incidencias = _incidencias.map((i) => (i.id === id ? { ...i, ...patch } : i));

  // Si cambia el estado de la incidencia y está asociada a un pedido, lo dejamos
  // reflejado en el timeline de ese pedido.
  if (anterior?.pedidoId && patch.estado && patch.estado !== anterior.estado) {
    const s = stamp();
    if (patch.estado === "resuelta") {
      pushEvento(anterior.pedidoId, {
        tipo: "incidencia_resuelta",
        titulo: `Incidencia resuelta · ${anterior.id}`,
        detalle: anterior.titulo,
        fecha: s.fecha,
        hora: s.hora,
        autor: USUARIO_ACTUAL,
      });
    } else if (patch.estado === "en_revision") {
      pushEvento(anterior.pedidoId, {
        tipo: "ausente",
        titulo: `Incidencia en revisión · ${anterior.id}`,
        detalle: anterior.titulo,
        fecha: s.fecha,
        hora: s.hora,
        autor: USUARIO_ACTUAL,
      });
    }
  }

  persist();
  notify();
}

// ── Suscripción ─────────────────────────────────────────────────────────────

export function subscribe(fn: Listener): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
