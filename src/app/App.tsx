import { useState, useEffect } from "react";
import { MessageSquare, Megaphone, BarChart2, Settings, Sparkles } from "lucide-react";

import { AppProvider, useApp } from "./state";
import type { NavId } from "./state";
import { LoginPage }     from "./LoginPage";
import { InboxPage }     from "./InboxPage";
import { CampaignsPage } from "./CampaignsPage";
import { ReportsPage }   from "./ReportsPage";
import { SettingsPage }  from "./SettingsPage";

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV: { id: NavId; icon: React.FC<{ size?: number }>; label: string }[] = [
  { id: "inbox",     icon: MessageSquare, label: "Mensajes"  },
  { id: "campaigns", icon: Megaphone,     label: "Campañas"  },
  { id: "reports",   icon: BarChart2,     label: "Reportes"  },
  { id: "settings",  icon: Settings,      label: "Ajustes"   },
];

function Sidebar() {
  const { state, dispatch } = useApp();
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    const updateUser = () => {
      const stored = localStorage.getItem("crm_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.name) {
          const parts = u.name.split(" ").filter((w: string) => w.length > 0).slice(0, 2);
          setInitials(parts.map((w: string) => w[0].toUpperCase()).join(""));
          return;
        }
      }
      setInitials("U");
    };

    updateUser();
    window.addEventListener("user_profile_updated", updateUser);
    return () => {
      window.removeEventListener("user_profile_updated", updateUser);
    };
  }, []);

  return (
    <aside
      className="w-20 flex-shrink-0 flex flex-col items-center py-5 gap-1"
      style={{ background: "#1C1826" }}
    >
      {/* Logo mark */}
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-5">
        <Sparkles size={16} className="text-white" />
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-3">
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = state.activeNav === id;
          return (
            <button
              key={id}
              onClick={() => dispatch({ type: "SET_NAV", nav: id })}
              title={label}
              className={`relative w-full h-12 rounded-xl flex items-center justify-center transition-all duration-150
                ${active
                  ? "bg-primary/90 text-white"
                  : "text-white/35 hover:text-white/70 hover:bg-white/10"}`}
            >
              <Icon size={20} />
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/60 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User avatar + online indicator */}
      <div className="relative mt-auto">
        <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1C1826]" />
      </div>
    </aside>
  );
}

// ── Main layout (inside AppProvider) ─────────────────────────────────────────

function MainLayout() {
  const { state } = useApp();

  return (
    <div
      className="h-screen flex overflow-hidden bg-background"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      <Sidebar />
      {state.activeNav === "inbox"     && <InboxPage />}
      {state.activeNav === "campaigns" && <CampaignsPage />}
      {state.activeNav === "reports"   && <ReportsPage />}
      {state.activeNav === "settings"  && <SettingsPage />}
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
