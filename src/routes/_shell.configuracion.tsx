import { createFileRoute } from "@tanstack/react-router";
import { Building2, Bell, CreditCard, Users, Shield, Plug } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shell/configuracion")({
  component: ConfiguracionPage,
});

const SECCIONES = [
  { icon: Building2, title: "Empresa", desc: "Datos fiscales, depósito y zonas de cobertura." },
  { icon: Users, title: "Equipo", desc: "Usuarios, roles y permisos de logística." },
  { icon: Bell, title: "Notificaciones", desc: "Alertas por reprogramaciones, ausencias y demoras." },
  { icon: CreditCard, title: "Facturación", desc: "Plan Pyme · próximo cobro 01/07/2026." },
  { icon: Shield, title: "Seguridad", desc: "Acceso, sesiones activas y verificación en dos pasos." },
  { icon: Plug, title: "Integraciones", desc: "Conectá Tiendanube, MercadoLibre y WhatsApp Business." },
];

function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administrá la cuenta, equipo e integraciones.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SECCIONES.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.title}
              onClick={() => toast.info(s.title, { description: `La configuración de "${s.title}" se habilitará con el backend y la gestión de cuenta conectados.` })}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 text-left hover:border-primary/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold group-hover:text-primary">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
