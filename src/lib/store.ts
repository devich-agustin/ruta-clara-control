import { PEDIDOS, ARMADO_DIA_INICIAL, type Pedido } from "./demo-data";

// ── Estado mutable de sesión ────────────────────────────────────────────────
// Los datos viven mientras la pestaña está abierta. Al recargar, se reinician.

let _pedidos: Pedido[] = [...PEDIDOS];
let _sinAsignarExtra: string[] = []; // IDs de pedidos creados en esta sesión

type Listener = () => void;
const _listeners = new Set<Listener>();

function notify() {
  _listeners.forEach((fn) => fn());
}

// ── Lecturas ────────────────────────────────────────────────────────────────

export function getPedidos(): Pedido[] {
  return _pedidos;
}

export function getSinAsignarExtra(): string[] {
  return _sinAsignarExtra;
}

export function getArmadoInicial() {
  return {
    ...ARMADO_DIA_INICIAL,
    sin_asignar: [...ARMADO_DIA_INICIAL.sin_asignar, ..._sinAsignarExtra],
  };
}

// ── Mutaciones ──────────────────────────────────────────────────────────────

export function addPedido(p: Pedido): void {
  _pedidos = [p, ..._pedidos];
  _sinAsignarExtra = [p.id, ..._sinAsignarExtra];
  notify();
}

// ── Suscripción ─────────────────────────────────────────────────────────────

export function subscribe(fn: Listener): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
