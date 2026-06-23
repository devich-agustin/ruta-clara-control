import { useState, useEffect } from "react";
import { getPedidos, subscribe } from "./store";
import type { Pedido } from "./demo-data";

export function usePedidos(): Pedido[] {
  const [pedidos, setPedidos] = useState<Pedido[]>(getPedidos);
  useEffect(() => subscribe(() => setPedidos(getPedidos())), []);
  return pedidos;
}
