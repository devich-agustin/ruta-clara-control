import { useState, useEffect } from "react";
import { getPedidos, getIncidencias, subscribe, hydrate } from "./store";
import type { Pedido, Incidencia } from "./demo-data";

export function usePedidos(): Pedido[] {
  const [pedidos, setPedidos] = useState<Pedido[]>(getPedidos);
  useEffect(() => {
    hydrate();
    return subscribe(() => setPedidos(getPedidos()));
  }, []);
  return pedidos;
}

export function useIncidencias(): Incidencia[] {
  const [incidencias, setIncidencias] = useState<Incidencia[]>(getIncidencias);
  useEffect(() => {
    hydrate();
    return subscribe(() => setIncidencias(getIncidencias()));
  }, []);
  return incidencias;
}
