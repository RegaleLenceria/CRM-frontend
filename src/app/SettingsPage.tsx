import { useState } from "react";
import { Check, Smartphone, Bell, Users, User, Wifi, WifiOff, Plus, X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { DEVICES, useApp, getInitials } from "./state";
import type { Agent } from "./state";
import { Avatar, Toggle } from "./shared";

type Tab = "perfil" | "dispositivos" | "equipo" | "notificaciones";

// ── Perfil ─────────────────────────────────────────────────────────────────────

function PerfilTab() {
  const [form,  setForm]  = useState({ name: "María Rodríguez", email: "maria@laboutique.mx", role: "Gerente de Ventas" });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-lg flex flex-col gap-5">
      <div className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/40 flex items-center justify-center text-primary text-lg font-semibold">
          MR
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">María Rodríguez</p>
          <p className="text-xs text-muted-foreground">Gerente de Ventas · Online</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground/80">Nombre completo</label>
        <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground/80">Correo electrónico</label>
        <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          className="px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-foreground/80">Rol</label>
        <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
          className="px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>

      <button
        onClick={save}
        className={`self-start flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all active:scale-[0.98]
          ${saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
      >
        <Check size={14} />
        {saved ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </div>
  );
}

// ── Dispositivos ───────────────────────────────────────────────────────────────

function DispositivosTab() {
  const { state, dispatch } = useApp();
  const [localDevices, setLocalDevices] = useState([...DEVICES]);

  const toggle = (id: string) => {
    setLocalDevices(prev => prev.map(d => d.id === id ? { ...d, online: !d.online } : d));
    if (state.activeDevice === id) {
      // switch to first online device or keep the same
    }
  };

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <p className="text-xs text-muted-foreground -mt-1">Gestiona tus números de WhatsApp conectados</p>
      {localDevices.map(d => (
        <div key={d.id} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center
              ${d.online ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
              <Smartphone size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-medium flex items-center gap-1 ${d.online ? "text-emerald-600" : "text-muted-foreground"}`}>
              {d.online ? <Wifi size={11} /> : <WifiOff size={11} />}
              {d.online ? "Conectado" : "Desconectado"}
            </span>
            <button
              onClick={() => toggle(d.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                ${d.online ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-primary/10 text-primary hover:bg-primary/15"}`}
            >
              {d.online ? "Desconectar" : "Conectar"}
            </button>
          </div>
        </div>
      ))}
      <button className="text-sm text-primary font-medium hover:underline self-start">
        + Agregar dispositivo
      </button>
    </div>
  );
}

// ── Equipo ─────────────────────────────────────────────────────────────────────

function EquipoTab() {
  const { state, dispatch } = useApp();
  const agents = state.agents;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", role: "", email: "", password: "", confirmPassword: "",
    status: "online" as Agent["status"],
  });
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError,   setFormError]   = useState("");
  const [created,     setCreated]     = useState(false);

  const statusCfg = {
    online:  { label: "En línea",     dot: "bg-emerald-400" },
    away:    { label: "Ausente",      dot: "bg-amber-400"   },
    offline: { label: "Desconectado", dot: "bg-gray-300"    },
  };

  const resetForm = () => {
    setForm({ name: "", role: "", email: "", password: "", confirmPassword: "", status: "online" });
    setFormError(""); setShowPw(false); setShowConfirm(false); setCreated(false);
  };

  const handleAdd = () => {
    if (!form.name.trim())            { setFormError("El nombre es obligatorio."); return; }
    if (!form.role.trim())            { setFormError("El rol es obligatorio."); return; }
    if (!form.email.includes("@"))    { setFormError("Ingresa un correo válido."); return; }
    if (form.password.length < 6)     { setFormError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (form.password !== form.confirmPassword) { setFormError("Las contraseñas no coinciden."); return; }
    setFormError("");
    dispatch({
      type:  "ADD_AGENT",
      agent: { id: Date.now(), name: form.name.trim(), initials: getInitials(form.name), role: form.role.trim(), status: form.status, chats: 0 },
    });
    setCreated(true);
    setTimeout(() => { resetForm(); setShowForm(false); }, 1800);
  };

  return (
    <div className="max-w-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Miembros del equipo de ventas</p>
        <button
          onClick={() => { setShowForm(v => !v); resetForm(); }}
          className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 hover:bg-primary/12 px-3 py-1.5 rounded-xl transition-colors border border-primary/15"
        >
          {showForm ? <X size={12} /> : <Plus size={12} />}
          {showForm ? "Cancelar" : "Agregar compañera"}
        </button>
      </div>

      {/* Account creation form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-muted/40">
            <p className="text-sm font-semibold text-foreground">Crear cuenta nueva</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              La compañera recibirá acceso con estas credenciales
            </p>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {created ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check size={20} className="text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-foreground">¡Cuenta creada!</p>
                <p className="text-xs text-muted-foreground">{form.name} ya puede iniciar sesión.</p>
              </div>
            ) : (
              <>
                {/* Name + Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground/80 block mb-1.5">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormError(""); }}
                      placeholder="Laura Jiménez"
                      className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground/80 block mb-1.5">
                      Rol <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.role}
                      onChange={e => { setForm(p => ({ ...p, role: e.target.value })); setFormError(""); }}
                      placeholder="Asesora"
                      className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center gap-1.5">
                    <Mail size={11} className="text-primary" />
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setFormError(""); }}
                    placeholder="laura@laboutique.mx"
                    className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center gap-1.5">
                    <Lock size={11} className="text-primary" />
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setFormError(""); }}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2.5 pr-10 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center gap-1.5">
                    <Lock size={11} className="text-primary" />
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={e => { setForm(p => ({ ...p, confirmPassword: e.target.value })); setFormError(""); }}
                      placeholder="Repite la contraseña"
                      className={`w-full px-3 py-2.5 pr-10 text-sm bg-muted rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50
                        ${form.confirmPassword && form.password !== form.confirmPassword ? "border-red-300" : "border-transparent"}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-[11px] text-red-500 mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-foreground/80 block mb-1.5">Estado inicial</label>
                  <div className="flex gap-2">
                    {(["online", "away", "offline"] as Agent["status"][]).map(s => (
                      <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                          ${form.status === s ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-transparent text-muted-foreground hover:border-primary/20"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg[s].dot}`} />
                        {statusCfg[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {formError && (
                  <p className="text-[11px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
                )}

                <button onClick={handleAdd}
                  className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <Check size={14} />
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Agent list */}
      {agents.map((agent, idx) => {
        const sc = statusCfg[agent.status];
        return (
          <div key={agent.id} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar initials={agent.initials} />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${sc.dot}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{agent.chats}</p>
              <p className="text-[10px] text-muted-foreground">chats activos</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Notificaciones ─────────────────────────────────────────────────────────────

function NotificacionesTab() {
  const items = [
    { id: "new_msg",    label: "Nuevo mensaje entrante",      sub: "Cuando llega un mensaje sin atender"       },
    { id: "assignment", label: "Asignación de chat",          sub: "Cuando un chat te es asignado"             },
    { id: "campaign",   label: "Campaña completada",          sub: "Al finalizar el envío masivo"               },
    { id: "reminder",   label: "Recordatorio de seguimiento", sub: "Chats sin respuesta por más de 2 horas"    },
    { id: "birthday",   label: "Cumpleaños de clienta",       sub: "Notifica el día del cumpleaños registrado" },
  ];
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    new_msg: true, assignment: true, campaign: false, reminder: true, birthday: false,
  });

  return (
    <div className="max-w-lg flex flex-col gap-3">
      {items.map(({ id, label, sub }) => (
        <div key={id} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
          <Toggle on={!!toggles[id]} onToggle={() => setToggles(p => ({ ...p, [id]: !p[id] }))} />
        </div>
      ))}
    </div>
  );
}

// ── Settings Page ──────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: "perfil",         label: "Mi Perfil",       icon: User       },
  { id: "dispositivos",   label: "Dispositivos",    icon: Smartphone },
  { id: "equipo",         label: "Equipo",          icon: Users      },
  { id: "notificaciones", label: "Notificaciones",  icon: Bell       },
];

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("perfil");

  const panel = {
    perfil:         <PerfilTab />,
    dispositivos:   <DispositivosTab />,
    equipo:         <EquipoTab />,
    notificaciones: <NotificacionesTab />,
  }[tab];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto scrollbar-hide bg-background">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Personaliza tu experiencia en el CRM</p>
        </div>
        <div className="flex gap-8">
          <nav className="w-48 flex-shrink-0 flex flex-col gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left
                  ${tab === id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
          <div className="flex-1 min-w-0">{panel}</div>
        </div>
      </div>
    </div>
  );
}
