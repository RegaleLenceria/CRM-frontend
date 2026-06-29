import { useState } from "react";
import { Sparkles, Eye, EyeOff, Lock, Mail } from "lucide-react";

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 900);
  };

  return (
    <div
      className="h-screen flex items-center justify-center"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif', background: "#F4F2F7" }}
    >
      <div className="w-full max-w-sm px-6">
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-foreground text-base font-semibold tracking-tight">Regale Lencería CRM</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-1">Bienvenida de nuevo</h2>
            <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center gap-1.5 block">
                <Mail size={11} className="text-primary" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center gap-1.5 block">
                <Lock size={11} className="text-primary" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
