import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Calendar,
  Map,
  Truck,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Smartphone,
  Activity,
  ClipboardList,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";

export const Route = createFileRoute("/_shell")({
  component: ShellLayout,
});

const NAV: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/operaciones", label: "Centro de Operaciones", icon: Activity },
  { to: "/pedidos", label: "Pedidos", icon: Package },
  { to: "/armado-dia", label: "Armado del Día", icon: ClipboardCheck },
  { to: "/preparacion", label: "Preparación", icon: ClipboardList },
  { to: "/calendario", label: "Calendario", icon: Calendar },
  { to: "/rutas", label: "Rutas", icon: Map },
  { to: "/incidencias", label: "Incidencias", icon: AlertTriangle },
  { to: "/vehiculos", label: "Vehículos", icon: Truck },
  { to: "/choferes", label: "Choferes", icon: Users },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/configuracion", label: "Configuración", icon: Settings },
];

function ShellLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            R
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Rutia</div>
            <div className="text-[11px] text-sidebar-muted">Mueblería del Sur</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
            Operación
          </div>
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as "/"}
                    className={
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                      (active
                        ? "bg-sidebar-active text-white font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-active/60")
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
            Herramientas
          </div>
          <ul className="space-y-0.5">
            <li>
              <Link
                to="/chofer"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-active/60"
              >
                <Smartphone className="h-4 w-4 shrink-0" />
                <span>Vista chofer</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-active text-sm font-semibold text-white">
              JL
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white">Juan López</div>
              <div className="truncate text-xs text-sidebar-muted">Encargado de Logística</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar pedidos, clientes, choferes…"
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
            </button>
            <div className="hidden h-9 items-center gap-2 rounded-md border border-border bg-card pl-1 pr-3 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                JL
              </div>
              <span className="text-sm font-medium">Juan López</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
