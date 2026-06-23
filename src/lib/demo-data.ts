// Fake but realistic data for a Buenos Aires furniture store.
export type EstadoPedido = "entregado" | "pendiente" | "en_ruta" | "reprogramado";

export type ConfirmacionCliente = "confirmado" | "pendiente" | "no_responde";
export type PrioridadPedido = "alta" | "media" | "baja";

export interface ConfirmacionDetalle {
  estado: ConfirmacionCliente;
  ultimoIntento?: string;
  canal?: "whatsapp" | "llamada";
  nota?: string;
}

export const CONFIRMACION_LABEL: Record<ConfirmacionCliente, string> = {
  confirmado:   "Confirmado",
  pendiente:    "Pendiente",
  no_responde:  "No responde",
};

export const CONFIRMACION_DOTS: Record<ConfirmacionCliente, string> = {
  confirmado:  "bg-success",
  pendiente:   "bg-warning",
  no_responde: "bg-destructive",
};

export const CONFIRMACION_TONE: Record<ConfirmacionCliente, string> = {
  confirmado:  "bg-success/10 text-success ring-success/20",
  pendiente:   "bg-warning/10 text-warning ring-warning/20",
  no_responde: "bg-destructive/10 text-destructive ring-destructive/20",
};

export const ESTADO_LABEL: Record<EstadoPedido, string> = {
  entregado: "Entregado",
  pendiente: "Pendiente",
  en_ruta: "En ruta",
  reprogramado: "Reprogramado",
};

export interface Pedido {
  id: string;
  cliente: string;
  direccion: string;
  barrio: string;
  telefono: string;
  producto: string;
  fecha: string;
  estado: EstadoPedido;
  confirmacion: ConfirmacionCliente;
  prioridad: PrioridadPedido;
  direccionValidada?: boolean;
}

export const PEDIDOS: Pedido[] = [
  { id: "MUE-1042", cliente: "María González",  direccion: "Av. Rivadavia 4521",      barrio: "Caballito",     telefono: "11 5421-7788", producto: "Sillón 3 cuerpos Tela Lino",  fecha: "22/06/2026", estado: "en_ruta",     confirmacion: "confirmado",  prioridad: "media" },
  { id: "MUE-1043", cliente: "Carlos López",    direccion: "Gascón 1180",             barrio: "Almagro",       telefono: "11 6342-1190", producto: "Mesa ratona roble",           fecha: "22/06/2026", estado: "entregado",   confirmacion: "confirmado",  prioridad: "baja"  },
  { id: "MUE-1044", cliente: "Ana Rodríguez",   direccion: "Av. Cabildo 2890",        barrio: "Belgrano",      telefono: "11 4123-8801", producto: "Placard 4 puertas blanco",    fecha: "22/06/2026", estado: "pendiente",   confirmacion: "no_responde", prioridad: "alta"  },
  { id: "MUE-1045", cliente: "Juan Pérez",      direccion: "Honduras 5421",           barrio: "Palermo",       telefono: "11 5512-7390", producto: "Cama 2 plazas + somier",      fecha: "22/06/2026", estado: "en_ruta",     confirmacion: "confirmado",  prioridad: "media" },
  { id: "MUE-1046", cliente: "Lucía Fernández", direccion: "Av. Boedo 1240",          barrio: "Boedo",         telefono: "11 6678-2210", producto: "Juego de comedor 6 sillas",   fecha: "22/06/2026", estado: "reprogramado", confirmacion: "pendiente",  prioridad: "alta"  },
  { id: "MUE-1047", cliente: "Diego Martínez",  direccion: "Av. Corrientes 3210",     barrio: "Abasto",        telefono: "11 5021-4488", producto: "Biblioteca pino macizo",      fecha: "22/06/2026", estado: "entregado",   confirmacion: "confirmado",  prioridad: "baja"  },
  { id: "MUE-1048", cliente: "Sofía Romero",    direccion: "Bulnes 950",              barrio: "Palermo",       telefono: "11 4499-3321", producto: "Escritorio juvenil",          fecha: "22/06/2026", estado: "pendiente",   confirmacion: "pendiente",   prioridad: "media" },
  { id: "MUE-1049", cliente: "Martín Acosta",   direccion: "Av. La Plata 1620",       barrio: "Caballito",     telefono: "11 5544-8812", producto: "Mesa de luz x2",              fecha: "23/06/2026", estado: "pendiente",   confirmacion: "pendiente",   prioridad: "media" },
  { id: "MUE-1050", cliente: "Valeria Suárez",  direccion: "Olleros 2110",            barrio: "Colegiales",    telefono: "11 6112-9087", producto: "Sofá esquinero",              fecha: "23/06/2026", estado: "pendiente",   confirmacion: "no_responde", prioridad: "alta"  },
  { id: "MUE-1051", cliente: "Pablo Quiroga",   direccion: "Av. San Juan 3300",       barrio: "Boedo",         telefono: "11 5723-4410", producto: "Cómoda 5 cajones",            fecha: "23/06/2026", estado: "pendiente",   confirmacion: "confirmado",  prioridad: "baja"  },
  { id: "MUE-1052", cliente: "Romina Vega",     direccion: "Mendoza 2890",            barrio: "Belgrano",      telefono: "11 4221-7765", producto: "Mesa de comedor extensible",  fecha: "23/06/2026", estado: "en_ruta",     confirmacion: "confirmado",  prioridad: "media" },
  { id: "MUE-1053", cliente: "Federico Salas",  direccion: "Av. Nazca 1750",          barrio: "Floresta",      telefono: "11 5009-3322", producto: "Sillas tapizadas x4",         fecha: "23/06/2026", estado: "entregado",   confirmacion: "confirmado",  prioridad: "baja"  },
  { id: "MUE-1056", cliente: "Inés Bravo",      direccion: "Scalabrini Ortiz 2280",   barrio: "Palermo",       telefono: "11 5334-9821", producto: "Mesa de comedor 1.60 m",      fecha: "23/06/2026", estado: "pendiente",   confirmacion: "no_responde", prioridad: "alta"  },
  { id: "MUE-1057", cliente: "Tomás Iturri",    direccion: "Warnes 1450",             barrio: "Villa del Parque", telefono: "11 4890-2267", producto: "Sillón reclinable",       fecha: "23/06/2026", estado: "pendiente",   confirmacion: "pendiente",   prioridad: "media" },
];

export const RESUMEN = {
  hoy: 42,
  entregados: 28,
  pendientes: 10,
  reprogramados: 4,
};

export const ESTADO_DOTS: Record<EstadoPedido, string> = {
  entregado: "bg-success",
  pendiente: "bg-warning",
  en_ruta: "bg-primary",
  reprogramado: "bg-destructive",
};

export const SEMANA = [
  { dia: "Lun", fecha: "22 Jun", total: 15, entregados: 9, pendientes: 4, reprogramados: 2 },
  { dia: "Mar", fecha: "23 Jun", total: 22, entregados: 0, pendientes: 22, reprogramados: 0 },
  { dia: "Mié", fecha: "24 Jun", total: 18, entregados: 0, pendientes: 18, reprogramados: 0 },
  { dia: "Jue", fecha: "25 Jun", total: 20, entregados: 0, pendientes: 20, reprogramados: 0 },
  { dia: "Vie", fecha: "26 Jun", total: 17, entregados: 0, pendientes: 17, reprogramados: 0 },
  { dia: "Sáb", fecha: "27 Jun", total: 8,  entregados: 0, pendientes: 8,  reprogramados: 0 },
  { dia: "Dom", fecha: "28 Jun", total: 0,  entregados: 0, pendientes: 0,  reprogramados: 0 },
];

export const CAMIONES = [
  {
    id: "Camión 1",
    patente: "AE 432 KP",
    chofer: "Roberto Giménez",
    paradas: [
      { orden: 1, cliente: "Juan Pérez",      direccion: "Honduras 5421, Palermo",       telefono: "11 5512-7390", producto: "Cama 2 plazas + somier",   estado: "entregado" as EstadoPedido },
      { orden: 2, cliente: "María González",  direccion: "Av. Rivadavia 4521, Caballito",telefono: "11 5421-7788", producto: "Sillón 3 cuerpos",        estado: "en_ruta" as EstadoPedido },
      { orden: 3, cliente: "Carlos López",    direccion: "Gascón 1180, Almagro",         telefono: "11 6342-1190", producto: "Mesa ratona roble",       estado: "pendiente" as EstadoPedido },
      { orden: 4, cliente: "Ana Rodríguez",   direccion: "Av. Cabildo 2890, Belgrano",   telefono: "11 4123-8801", producto: "Placard 4 puertas",       estado: "pendiente" as EstadoPedido },
    ],
  },
  {
    id: "Camión 2",
    patente: "AD 118 RT",
    chofer: "Marcelo Núñez",
    paradas: [
      { orden: 1, cliente: "Diego Martínez",  direccion: "Av. Corrientes 3210, Abasto",  telefono: "11 5021-4488", producto: "Biblioteca pino",          estado: "entregado" as EstadoPedido },
      { orden: 2, cliente: "Lucía Fernández", direccion: "Av. Boedo 1240, Boedo",        telefono: "11 6678-2210", producto: "Juego de comedor",         estado: "reprogramado" as EstadoPedido },
      { orden: 3, cliente: "Sofía Romero",    direccion: "Bulnes 950, Palermo",          telefono: "11 4499-3321", producto: "Escritorio juvenil",       estado: "pendiente" as EstadoPedido },
    ],
  },
];

export const VEHICULOS = [
  { patente: "AE 432 KP", modelo: "Iveco Daily 35-150", capacidad: "4.5 m³", chofer: "Roberto Giménez", estado: "En ruta" },
  { patente: "AD 118 RT", modelo: "Mercedes Sprinter 415", capacidad: "5.2 m³", chofer: "Marcelo Núñez", estado: "En ruta" },
  { patente: "AC 902 LM", modelo: "Renault Master", capacidad: "4.8 m³", chofer: "Esteban Ortiz", estado: "Disponible" },
  { patente: "AB 770 HD", modelo: "Fiat Ducato", capacidad: "4.2 m³", chofer: "—", estado: "En taller" },
];

export const CHOFERES = [
  { nombre: "Roberto Giménez", telefono: "11 5478-2210", licencia: "B.2 vto 03/2028", entregasMes: 218, vehiculo: "AE 432 KP", estado: "Activo" },
  { nombre: "Marcelo Núñez",   telefono: "11 6233-9087", licencia: "B.2 vto 11/2027", entregasMes: 196, vehiculo: "AD 118 RT", estado: "Activo" },
  { nombre: "Esteban Ortiz",   telefono: "11 5009-7732", licencia: "B.2 vto 07/2029", entregasMes: 174, vehiculo: "AC 902 LM", estado: "Activo" },
  { nombre: "Hernán Ríos",     telefono: "11 4421-1180", licencia: "B.1 vto 02/2027", entregasMes: 0,   vehiculo: "—",         estado: "Licencia" },
];

// ============== Detalle extendido del pedido ==============

export interface DetallePedido {
  email: string;
  fechaVenta: string;
  fechaDisponible: string;
  fechaProgramada: string;
  franjaHoraria: string;
  cantidad: number;
  chofer: string;
  vehiculo: string;
  observaciones: string;
}

const DEFAULT_DETALLE: DetallePedido = {
  email: "cliente@ejemplo.com",
  fechaVenta: "18/06/2026",
  fechaDisponible: "21/06/2026",
  fechaProgramada: "22/06/2026 — 10:00 a 13:00",
  franjaHoraria: "10:00 a 13:00",
  cantidad: 1,
  chofer: "Sin asignar",
  vehiculo: "Sin asignar",
  observaciones: "—",
};

export const DETALLES: Record<string, Partial<DetallePedido>> = {
  "MUE-1042": { email: "maria.gonzalez@gmail.com", fechaVenta: "17/06/2026", fechaDisponible: "20/06/2026", fechaProgramada: "22/06/2026 — 13:00 a 16:00", franjaHoraria: "13:00 a 16:00", chofer: "Roberto Giménez", vehiculo: "Iveco Daily — AE 432 KP", observaciones: "Tocar timbre 4°B. Hay portero hasta las 17 h." },
  "MUE-1043": { email: "clopez@hotmail.com",      fechaVenta: "15/06/2026", fechaDisponible: "19/06/2026", fechaProgramada: "22/06/2026 — 09:00 a 12:00", franjaHoraria: "09:00 a 12:00", chofer: "Roberto Giménez", vehiculo: "Iveco Daily — AE 432 KP", observaciones: "Subir por escalera, ascensor en obra." },
  "MUE-1044": { email: "ana.rodriguez@yahoo.com", fechaVenta: "16/06/2026", fechaDisponible: "21/06/2026", fechaProgramada: "22/06/2026 — 16:00 a 19:00", franjaHoraria: "16:00 a 19:00", chofer: "Roberto Giménez", vehiculo: "Iveco Daily — AE 432 KP", observaciones: "Confirmar 30 min antes por WhatsApp." },
  "MUE-1045": { email: "jperez.delivery@gmail.com", fechaVenta: "14/06/2026", fechaDisponible: "20/06/2026", fechaProgramada: "22/06/2026 — 10:00 a 13:00", franjaHoraria: "10:00 a 13:00", chofer: "Roberto Giménez", vehiculo: "Iveco Daily — AE 432 KP", observaciones: "Retirar embalaje al finalizar." },
  "MUE-1046": { email: "lucia.f@outlook.com",      fechaVenta: "13/06/2026", fechaDisponible: "19/06/2026", fechaProgramada: "22/06/2026 — 14:00 a 17:00", franjaHoraria: "14:00 a 17:00", chofer: "Marcelo Núñez", vehiculo: "Mercedes Sprinter — AD 118 RT", observaciones: "Cliente ausente en intento anterior." },
};

export function getDetalle(id: string): DetallePedido {
  return { ...DEFAULT_DETALLE, ...(DETALLES[id] ?? {}) };
}

// ============== Línea de tiempo del pedido ==============

export type TipoEvento = "creado" | "preparado" | "programado" | "ruta" | "entregado" | "ausente" | "reprogramado";

export interface EventoPedido {
  tipo: TipoEvento;
  titulo: string;
  detalle?: string;
  fecha: string;
  hora: string;
  autor?: string;
}

export const TIMELINE: Record<string, EventoPedido[]> = {
  "MUE-1042": [
    { tipo: "creado",     titulo: "Pedido creado",        fecha: "17/06/2026", hora: "11:24", autor: "Sofía (Ventas)" },
    { tipo: "preparado",  titulo: "Preparado en depósito",fecha: "20/06/2026", hora: "16:02", autor: "Depósito Barracas" },
    { tipo: "programado", titulo: "Programado para entrega", detalle: "22/06 — 13:00 a 16:00", fecha: "21/06/2026", hora: "09:10", autor: "Juan López" },
    { tipo: "ruta",       titulo: "En ruta",              detalle: "Camión 1 · Roberto Giménez", fecha: "22/06/2026", hora: "08:55" },
  ],
  "MUE-1043": [
    { tipo: "creado",     titulo: "Pedido creado",        fecha: "15/06/2026", hora: "10:11", autor: "Sofía (Ventas)" },
    { tipo: "preparado",  titulo: "Preparado en depósito",fecha: "19/06/2026", hora: "14:30" },
    { tipo: "programado", titulo: "Programado para entrega", detalle: "22/06 — 09:00 a 12:00", fecha: "21/06/2026", hora: "09:00" },
    { tipo: "ruta",       titulo: "En ruta",              fecha: "22/06/2026", hora: "08:55" },
    { tipo: "entregado",  titulo: "Entregado",            detalle: "Firma: C. López", fecha: "22/06/2026", hora: "09:42" },
  ],
  "MUE-1046": [
    { tipo: "creado",     titulo: "Pedido creado",        fecha: "13/06/2026", hora: "16:50", autor: "Andrés (Ventas)" },
    { tipo: "preparado",  titulo: "Preparado en depósito",fecha: "19/06/2026", hora: "11:05" },
    { tipo: "programado", titulo: "Programado para entrega", detalle: "22/06 — 14:00 a 17:00", fecha: "21/06/2026", hora: "10:00" },
    { tipo: "ausente",    titulo: "Cliente ausente",      detalle: "Roberto tocó timbre 3 veces, sin respuesta.", fecha: "22/06/2026", hora: "14:48", autor: "Roberto Giménez" },
    { tipo: "reprogramado", titulo: "Reprogramado",       detalle: "Nueva fecha: 23/06 — 10:00 a 13:00", fecha: "22/06/2026", hora: "15:10", autor: "Juan López" },
  ],
};

export function getTimeline(id: string): EventoPedido[] {
  return (
    TIMELINE[id] ?? [
      { tipo: "creado",     titulo: "Pedido creado",        fecha: "18/06/2026", hora: "10:00", autor: "Sofía (Ventas)" },
      { tipo: "preparado",  titulo: "Preparado en depósito",fecha: "21/06/2026", hora: "12:30" },
      { tipo: "programado", titulo: "Programado para entrega", fecha: "21/06/2026", hora: "16:00", autor: "Juan López" },
    ]
  );
}

// ============== Reprogramaciones ==============

export interface Reprogramacion {
  fecha: string;
  motivo: string;
  nuevaFecha: string;
  autor: string;
}

export const REPROGRAMACIONES: Record<string, Reprogramacion[]> = {
  "MUE-1046": [
    { fecha: "22/06/2026 15:10", motivo: "Cliente ausente", nuevaFecha: "23/06/2026 — 10:00 a 13:00", autor: "Juan López" },
    { fecha: "15/06/2026 11:20", motivo: "Producto faltante (faltaba 1 silla)", nuevaFecha: "22/06/2026 — 14:00 a 17:00", autor: "Depósito Barracas" },
  ],
};

// ============== Historial del cliente ==============

export interface HistorialClienteItem {
  id: string;
  fecha: string;
  producto: string;
  resultado: "entregado" | "fallido" | "reprogramado";
}

export const HISTORIAL_CLIENTE: Record<string, HistorialClienteItem[]> = {
  "MUE-1042": [
    { id: "MUE-0921", fecha: "12/02/2026", producto: "Mesa ratona roble",  resultado: "entregado" },
    { id: "MUE-0744", fecha: "08/11/2025", producto: "Lámpara de pie",     resultado: "entregado" },
  ],
  "MUE-1046": [
    { id: "MUE-0988", fecha: "03/03/2026", producto: "Sillón individual",  resultado: "reprogramado" },
    { id: "MUE-0822", fecha: "14/12/2025", producto: "Mesa de luz",        resultado: "fallido" },
    { id: "MUE-0701", fecha: "20/09/2025", producto: "Cuna funcional",     resultado: "entregado" },
  ],
};

export function getHistorialCliente(id: string) {
  return HISTORIAL_CLIENTE[id] ?? [
    { id: "MUE-0612", fecha: "04/08/2025", producto: "Silla escritorio", resultado: "entregado" as const },
  ];
}

// ============== Preparación (kanban depósito) ==============

export type EstadoPreparacion = "pendiente" | "en_preparacion" | "listo" | "despachado";

export const PREPARACION_LABEL: Record<EstadoPreparacion, string> = {
  pendiente: "Pendiente de preparar",
  en_preparacion: "En preparación",
  listo: "Listo para despacho",
  despachado: "Despachado",
};

export interface PreparacionItem {
  pedido: string;
  cliente: string;
  producto: string;
  fechaProgramada: string;
  estado: EstadoPreparacion;
  responsable?: string;
}

export const PREPARACION: PreparacionItem[] = [
  { pedido: "MUE-1049", cliente: "Martín Acosta",  producto: "Mesa de luz x2",            fechaProgramada: "23/06 — 10:00", estado: "pendiente" },
  { pedido: "MUE-1050", cliente: "Valeria Suárez", producto: "Sofá esquinero",            fechaProgramada: "23/06 — 14:00", estado: "pendiente" },
  { pedido: "MUE-1051", cliente: "Pablo Quiroga",  producto: "Cómoda 5 cajones",          fechaProgramada: "23/06 — 16:00", estado: "pendiente" },
  { pedido: "MUE-1054", cliente: "Inés Bravo",     producto: "Mesa de comedor 1.60 m",    fechaProgramada: "24/06 — 09:00", estado: "pendiente" },

  { pedido: "MUE-1048", cliente: "Sofía Romero",   producto: "Escritorio juvenil",        fechaProgramada: "22/06 — 16:00", estado: "en_preparacion", responsable: "Hugo (Depósito)" },
  { pedido: "MUE-1052", cliente: "Romina Vega",    producto: "Mesa de comedor extensible",fechaProgramada: "23/06 — 11:00", estado: "en_preparacion", responsable: "Hugo (Depósito)" },

  { pedido: "MUE-1044", cliente: "Ana Rodríguez",  producto: "Placard 4 puertas blanco",  fechaProgramada: "22/06 — 16:00", estado: "listo",          responsable: "Carla (Depósito)" },
  { pedido: "MUE-1055", cliente: "Tomás Iturri",   producto: "Sillón reclinable",         fechaProgramada: "24/06 — 11:00", estado: "listo",          responsable: "Carla (Depósito)" },

  { pedido: "MUE-1042", cliente: "María González", producto: "Sillón 3 cuerpos",          fechaProgramada: "22/06 — 13:00", estado: "despachado",     responsable: "Camión 1" },
  { pedido: "MUE-1045", cliente: "Juan Pérez",     producto: "Cama 2 plazas + somier",    fechaProgramada: "22/06 — 10:00", estado: "despachado",     responsable: "Camión 1" },
  { pedido: "MUE-1047", cliente: "Diego Martínez", producto: "Biblioteca pino macizo",    fechaProgramada: "22/06 — 09:00", estado: "despachado",     responsable: "Camión 2" },
];

// ============== Incidencias ==============

export type TipoIncidencia = "cliente_ausente" | "demora" | "reprogramacion" | "vehiculo" | "chofer";

export const INCIDENCIA_LABEL: Record<TipoIncidencia, string> = {
  cliente_ausente: "Cliente ausente",
  demora:          "Pedido demorado",
  reprogramacion:  "Reprogramación",
  vehiculo:        "Vehículo fuera de servicio",
  chofer:          "Reporte de chofer",
};

export type TipoEventoInc = "apertura" | "actualizacion" | "contacto" | "resolucion" | "nota";

export interface IncidenciaEvento {
  tipo: TipoEventoInc;
  texto: string;
  fecha: string;
  hora: string;
  autor?: string;
}

export interface Incidencia {
  id: string;
  tipo: TipoIncidencia;
  titulo: string;
  detalle: string;
  fecha: string;
  prioridad: "alta" | "media" | "baja";
  estado: "abierta" | "en_revision" | "resuelta";
  referencia?: string;
  pedidoId?: string;
  cliente?: string;
  clienteTelefono?: string;
  chofer?: string;
  vehiculo?: string;
  responsable: string;
  costoEstimado: number;
  tiempoPerdido: number;
  reprogramacionRequerida: boolean;
  historial: IncidenciaEvento[];
}

export const INCIDENCIAS: Incidencia[] = [
  {
    id: "INC-218", tipo: "cliente_ausente", titulo: "Ana Rodríguez no estaba en el domicilio",
    detalle: "Roberto tocó timbre 3 veces sin respuesta. El vecino del 4°A confirmó que la señora viajó por el fin de semana. El placard queda en el camión hasta que se coordine nueva fecha.",
    fecha: "Hoy 11:18", prioridad: "alta", estado: "abierta", referencia: "MUE-1044",
    pedidoId: "MUE-1044", cliente: "Ana Rodríguez", clienteTelefono: "11 4123-8801",
    chofer: "Roberto Giménez", vehiculo: "Iveco Daily — AE 432 KP",
    responsable: "Juan López", costoEstimado: 4500, tiempoPerdido: 45, reprogramacionRequerida: true,
    historial: [
      { tipo: "apertura",      texto: "Roberto Giménez reportó cliente ausente en Av. Cabildo 2890", fecha: "22/06/2026", hora: "11:18", autor: "Roberto Giménez" },
      { tipo: "actualizacion", texto: "Juan López tomó la incidencia",                                fecha: "22/06/2026", hora: "11:20", autor: "Juan López" },
      { tipo: "contacto",      texto: "Intento de contacto por WhatsApp — sin respuesta",             fecha: "22/06/2026", hora: "11:22", autor: "Juan López" },
      { tipo: "contacto",      texto: "Llamada al cliente — no atiende",                              fecha: "22/06/2026", hora: "11:35", autor: "Juan López" },
    ],
  },
  {
    id: "INC-217", tipo: "vehiculo", titulo: "Camión AB 770 HD continúa en taller",
    detalle: "Pendiente repuesto de embrague. El taller confirma ETA para el jueves 26/06 por la tarde. Capacidad operativa reducida un 25%. Esteban Ortiz cubre las rutas con el Renault Master.",
    fecha: "Hoy 09:05", prioridad: "alta", estado: "en_revision",
    vehiculo: "Fiat Ducato — AB 770 HD",
    responsable: "Juan López", costoEstimado: 18500, tiempoPerdido: 480, reprogramacionRequerida: false,
    historial: [
      { tipo: "apertura",      texto: "Encargado del taller reportó falla de embrague",                fecha: "20/06/2026", hora: "17:00", autor: "Taller Externo" },
      { tipo: "actualizacion", texto: "Juan López tomó la incidencia y notificó a toda la flota",      fecha: "21/06/2026", hora: "09:10", autor: "Juan López" },
      { tipo: "actualizacion", texto: "Se solicitó repuesto — plazo estimado: 2 días hábiles",         fecha: "21/06/2026", hora: "09:30", autor: "Juan López" },
      { tipo: "actualizacion", texto: "Esteban Ortiz cubrirá las rutas con el Renault Master (AC 902)", fecha: "21/06/2026", hora: "10:00", autor: "Juan López" },
      { tipo: "actualizacion", texto: "Taller confirma ETA: jueves 26/06 por la tarde",                fecha: "22/06/2026", hora: "09:05", autor: "Taller Externo" },
    ],
  },
  {
    id: "INC-216", tipo: "demora", titulo: "Camión 2 con 40 min de demora acumulada",
    detalle: "Tránsito intenso sobre Av. 9 de Julio y Libertador. Tres entregas en riesgo de caer fuera de la franja horaria comprometida con el cliente.",
    fecha: "Hoy 10:42", prioridad: "media", estado: "abierta", referencia: "Camión 2",
    chofer: "Marcelo Núñez", vehiculo: "Mercedes Sprinter — AD 118 RT",
    responsable: "Juan López", costoEstimado: 1800, tiempoPerdido: 40, reprogramacionRequerida: false,
    historial: [
      { tipo: "apertura",      texto: "Marcelo Núñez reportó demora por tráfico en 9 de Julio",        fecha: "22/06/2026", hora: "10:42", autor: "Marcelo Núñez" },
      { tipo: "actualizacion", texto: "Sistema notificó automáticamente a Juan López",                  fecha: "22/06/2026", hora: "10:43", autor: "Sistema" },
      { tipo: "contacto",      texto: "Se notificó a los clientes del Camión 2 sobre posible demora",   fecha: "22/06/2026", hora: "10:50", autor: "Juan López" },
    ],
  },
  {
    id: "INC-215", tipo: "reprogramacion", titulo: "Lucía Fernández solicitó cambio de fecha",
    detalle: "La cliente llamó a primera hora para reprogramar la entrega. Nueva fecha acordada para el 23/06 entre 10:00 y 13:00. Camión 2 reasignado.",
    fecha: "Hoy 08:02", prioridad: "media", estado: "resuelta", referencia: "MUE-1046",
    pedidoId: "MUE-1046", cliente: "Lucía Fernández", clienteTelefono: "11 6678-2210",
    chofer: "Marcelo Núñez", vehiculo: "Mercedes Sprinter — AD 118 RT",
    responsable: "Juan López", costoEstimado: 2800, tiempoPerdido: 30, reprogramacionRequerida: true,
    historial: [
      { tipo: "apertura",      texto: "Cliente llamó para solicitar cambio de fecha de entrega",       fecha: "22/06/2026", hora: "08:02", autor: "Sofía (Ventas)" },
      { tipo: "actualizacion", texto: "Juan López tomó la incidencia",                                  fecha: "22/06/2026", hora: "08:05", autor: "Juan López" },
      { tipo: "contacto",      texto: "Llamada con cliente para confirmar nueva franja horaria",        fecha: "22/06/2026", hora: "08:15", autor: "Juan López" },
      { tipo: "actualizacion", texto: "Pedido reprogramado: 23/06 — 10:00 a 13:00",                    fecha: "22/06/2026", hora: "08:30", autor: "Juan López" },
      { tipo: "resolucion",    texto: "Incidencia resuelta — camión reasignado para mañana",            fecha: "22/06/2026", hora: "08:35", autor: "Juan López" },
    ],
  },
  {
    id: "INC-214", tipo: "chofer", titulo: "Marcelo reportó dirección incorrecta en MUE-1041",
    detalle: "El número de calle indicado en el pedido no coincide. El cliente reportó Av. Corrientes 3210 pero el piso y departamento no figuran en el sistema. Requiere validación.",
    fecha: "Ayer 17:30", prioridad: "baja", estado: "abierta", referencia: "MUE-1041",
    pedidoId: "MUE-1041", cliente: "Rodrigo Salas", clienteTelefono: "11 5009-3322",
    chofer: "Marcelo Núñez", vehiculo: "Mercedes Sprinter — AD 118 RT",
    responsable: "Marcelo Núñez", costoEstimado: 800, tiempoPerdido: 20, reprogramacionRequerida: false,
    historial: [
      { tipo: "apertura",  texto: "Marcelo Núñez reportó que el número de calle no coincide en MUE-1041", fecha: "21/06/2026", hora: "17:30", autor: "Marcelo Núñez" },
      { tipo: "contacto",  texto: "Se intentó contactar al cliente — sin respuesta",                       fecha: "21/06/2026", hora: "17:35", autor: "Marcelo Núñez" },
    ],
  },
  {
    id: "INC-213", tipo: "cliente_ausente", titulo: "Pedido MUE-1038 — cliente ausente",
    detalle: "Roberto Giménez se presentó a las 14:10 en el domicilio. El cliente no atendió tras 3 intentos de timbre. Se reprogramó para el 24/06 entre 10:00 y 13:00.",
    fecha: "Ayer 14:10", prioridad: "baja", estado: "resuelta", referencia: "MUE-1038",
    pedidoId: "MUE-1038", cliente: "Hernán Ríos", clienteTelefono: "11 4421-1180",
    chofer: "Roberto Giménez", vehiculo: "Iveco Daily — AE 432 KP",
    responsable: "Juan López", costoEstimado: 3200, tiempoPerdido: 35, reprogramacionRequerida: true,
    historial: [
      { tipo: "apertura",      texto: "Roberto Giménez reportó cliente ausente en el domicilio",        fecha: "21/06/2026", hora: "14:10", autor: "Roberto Giménez" },
      { tipo: "actualizacion", texto: "Juan López tomó la incidencia",                                  fecha: "21/06/2026", hora: "14:15", autor: "Juan López" },
      { tipo: "contacto",      texto: "WhatsApp al cliente: respondió en 10 minutos",                   fecha: "21/06/2026", hora: "14:20", autor: "Juan López" },
      { tipo: "actualizacion", texto: "Pedido reprogramado: 24/06 — 10:00 a 13:00",                    fecha: "21/06/2026", hora: "14:30", autor: "Juan López" },
      { tipo: "resolucion",    texto: "Incidencia resuelta",                                            fecha: "21/06/2026", hora: "14:32", autor: "Juan López" },
    ],
  },
];

// ============== Reportes operativos ==============

export const REPORTES_KPIS = [
  { label: "Entregas realizadas",       value: "1.184", delta: "+8%",       up: true,  invert: false },
  { label: "Entregas fallidas",         value: "47",    delta: "-12%",      up: false, invert: true },
  { label: "Reprogramaciones",          value: "67",    delta: "-9%",       up: false, invert: true },
  { label: "Tiempo promedio de entrega",value: "11 min",delta: "-2 min",    up: false, invert: true },
];

export const MOTIVOS_FALLOS = [
  { motivo: "Cliente ausente",            v: 28 },
  { motivo: "Cliente pidió cambio",       v: 14 },
  { motivo: "Problema logístico",         v: 11 },
  { motivo: "Producto faltante",          v: 9  },
  { motivo: "Dirección incorrecta",       v: 5  },
];

export const RENDIMIENTO_CHOFER = [
  { nombre: "Roberto Giménez", entregas: 218, exito: 96 },
  { nombre: "Marcelo Núñez",   entregas: 196, exito: 94 },
  { nombre: "Esteban Ortiz",   entregas: 174, exito: 92 },
];

export const RENDIMIENTO_VEHICULO = [
  { patente: "AE 432 KP", entregas: 218, disponibilidad: 98 },
  { patente: "AD 118 RT", entregas: 196, disponibilidad: 95 },
  { patente: "AC 902 LM", entregas: 174, disponibilidad: 90 },
  { patente: "AB 770 HD", entregas: 0,   disponibilidad: 0  },
];

export const ZONAS_ENTREGAS = [
  { zona: "Palermo",    entregas: 184, fallos: 6  },
  { zona: "Caballito",  entregas: 162, fallos: 9  },
  { zona: "Belgrano",   entregas: 141, fallos: 4  },
  { zona: "Almagro",    entregas: 118, fallos: 7  },
  { zona: "Boedo",      entregas:  96, fallos: 11 },
  { zona: "Colegiales", entregas:  74, fallos: 3  },
];

// ============== Ocupación semanal (alta de pedido) ==============

export const OCUPACION_SEMANA = [
  { dia: "Lunes",    fecha: "22/06", entregas: 15, capacidad: 24 },
  { dia: "Martes",   fecha: "23/06", entregas: 22, capacidad: 24 },
  { dia: "Miércoles",fecha: "24/06", entregas: 10, capacidad: 24 },
  { dia: "Jueves",   fecha: "25/06", entregas: 18, capacidad: 24 },
  { dia: "Viernes",  fecha: "26/06", entregas: 17, capacidad: 24 },
  { dia: "Sábado",   fecha: "27/06", entregas:  8, capacidad: 16 },
];

// ============== Confirmaciones de cliente ==============

export const CONFIRMACIONES: Record<string, ConfirmacionDetalle> = {
  "MUE-1042": { estado: "confirmado",  ultimoIntento: "22/06/2026 08:10", canal: "whatsapp", nota: "Confirmó por WhatsApp. Preguntó si llevan herramientas para armar." },
  "MUE-1043": { estado: "confirmado",  ultimoIntento: "22/06/2026 08:05", canal: "llamada",  nota: "Atendió enseguida, confirmó sin problemas." },
  "MUE-1044": { estado: "no_responde", ultimoIntento: "22/06/2026 09:45", canal: "whatsapp", nota: "Enviamos mensaje a las 9:45, sin respuesta. Llamada sin atender." },
  "MUE-1045": { estado: "confirmado",  ultimoIntento: "22/06/2026 08:20", canal: "llamada" },
  "MUE-1046": { estado: "pendiente",   ultimoIntento: "22/06/2026 08:00", canal: "whatsapp", nota: "Mensaje enviado, esperando respuesta." },
  "MUE-1047": { estado: "confirmado",  ultimoIntento: "22/06/2026 07:55", canal: "whatsapp" },
  "MUE-1048": { estado: "pendiente" },
  "MUE-1049": { estado: "pendiente",   ultimoIntento: "22/06/2026 10:30", canal: "whatsapp", nota: "Sin respuesta aún. Reintentar por la tarde." },
  "MUE-1050": { estado: "no_responde", ultimoIntento: "22/06/2026 09:15", canal: "llamada",  nota: "No atiende el teléfono. Intentar WhatsApp." },
  "MUE-1051": { estado: "confirmado",  ultimoIntento: "22/06/2026 10:00", canal: "whatsapp", nota: "Confirmó y pidió que lleguen después de las 11." },
  "MUE-1052": { estado: "confirmado",  ultimoIntento: "22/06/2026 09:30", canal: "whatsapp" },
  "MUE-1053": { estado: "confirmado",  ultimoIntento: "22/06/2026 08:45", canal: "llamada" },
  "MUE-1056": { estado: "no_responde", ultimoIntento: "22/06/2026 11:00", canal: "llamada",  nota: "Tres intentos sin respuesta. Riesgo de ausente." },
  "MUE-1057": { estado: "pendiente",   ultimoIntento: "22/06/2026 10:45", canal: "whatsapp", nota: "Mensaje enviado esta mañana." },
};

export function getConfirmacion(id: string): ConfirmacionDetalle {
  return CONFIRMACIONES[id] ?? { estado: "pendiente" };
}

// ============== Armado del día — estado inicial compartido ==============
// Fuente única de verdad para las asignaciones del día.
// Tanto Armado del Día como Vista Chofer leen desde aquí.

export type ArmadoColumnId = "sin_asignar" | "camion_1" | "camion_2" | "flete_externo";

export const ARMADO_DIA_INICIAL: Record<ArmadoColumnId, string[]> = {
  sin_asignar:   ["MUE-1050", "MUE-1056"],
  camion_1:      ["MUE-1051", "MUE-1057", "MUE-1049"],
  camion_2:      ["MUE-1048"],
  flete_externo: [],
};
