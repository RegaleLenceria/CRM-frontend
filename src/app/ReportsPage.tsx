import { useState } from "react";
import { TrendingUp, MessageSquare, Clock, ShoppingBag } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { WEEKLY_DATA, INTEREST_DATA } from "./state";

const KPI_CARDS = [
  { label: "Mensajes esta semana", value: "328",  delta: "+12%", icon: MessageSquare, color: "text-primary"      },
  { label: "Tasa de respuesta",    value: "94%",  delta: "+3%",  icon: TrendingUp,    color: "text-emerald-600" },
  { label: "Tiempo prom. respuesta",value: "4.2m",delta: "-18%", icon: Clock,         color: "text-blue-600"    },
  { label: "Ventas cerradas",      value: "78",   delta: "+21%", icon: ShoppingBag,   color: "text-amber-600"   },
] as const;

const TOOLTIP_STYLE = {
  contentStyle: {
    background:   "#fff",
    border:       "1px solid rgba(28,24,38,0.09)",
    borderRadius: "12px",
    fontSize:     "12px",
    boxShadow:    "0 4px 12px rgba(0,0,0,0.08)",
    padding:      "8px 12px",
  },
  labelStyle: { color: "#1C1826", fontWeight: 600, marginBottom: 2 },
  cursor:     { fill: "rgba(140,94,138,0.05)" },
};

const PERIODS = ["7 días", "30 días", "90 días"] as const;

export function ReportsPage() {
  const [period, setPeriod] = useState<typeof PERIODS[number]>("7 días");

  return (
    <div className="flex-1 min-w-0 overflow-y-auto scrollbar-hide bg-background">
      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Reportes de Actividad</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Semana del 23 al 29 de junio, 2025</p>
          </div>
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${period === p
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map(({ label, value, delta, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-2xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center ${color}`}>
                  <Icon size={17} />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {delta}
                </span>
              </div>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-5 gap-5 mb-5">
          {/* Line chart */}
          <div className="col-span-3 bg-card rounded-2xl border border-border p-6">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-foreground">Actividad semanal</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Mensajes recibidos vs. respondidos</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={WEEKLY_DATA} margin={{ top: 4, right: 4, bottom: 4, left: -14 }}>
                <CartesianGrid key="lc-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis key="lc-x" dataKey="day" tick={{ fontSize: 11, fill: "#6D6880" }} axisLine={false} tickLine={false} />
                <YAxis key="lc-y" tick={{ fontSize: 11, fill: "#6D6880" }} axisLine={false} tickLine={false} />
                <Tooltip key="lc-tip" {...TOOLTIP_STYLE} />
                <Line key="lc-mensajes"
                  type="monotone" dataKey="mensajes" stroke="#8C5E8A" strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#8C5E8A", strokeWidth: 0 }} name="Mensajes"
                />
                <Line key="lc-respondidos"
                  type="monotone" dataKey="respondidos" stroke="#C4A0BF" strokeWidth={2}
                  dot={{ r: 3, fill: "#C4A0BF", strokeWidth: 0 }} strokeDasharray="5 3" name="Respondidos"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3">
              {[{ color: "#8C5E8A", label: "Mensajes" }, { color: "#C4A0BF", label: "Respondidos" }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-0.5 rounded-full" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Pie chart */}
          <div className="col-span-2 bg-card rounded-2xl border border-border p-6">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">Interés por producto</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Distribución de consultas</p>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie key="pc-pie"
                  data={INTEREST_DATA} cx="50%" cy="50%"
                  innerRadius={42} outerRadius={65}
                  paddingAngle={3} dataKey="value"
                >
                  {INTEREST_DATA.map((entry) => (
                    <Cell key={`pc-cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="pc-tip"
                  contentStyle={TOOLTIP_STYLE.contentStyle}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-3">
              {INTEREST_DATA.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    {name}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground">Ventas cerradas por día</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Conversaciones que resultaron en venta</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEKLY_DATA} margin={{ top: 4, right: 4, bottom: 4, left: -14 }}>
              <CartesianGrid key="bc-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis key="bc-x" dataKey="day" tick={{ fontSize: 11, fill: "#6D6880" }} axisLine={false} tickLine={false} />
              <YAxis key="bc-y" tick={{ fontSize: 11, fill: "#6D6880" }} axisLine={false} tickLine={false} />
              <Tooltip key="bc-tip" {...TOOLTIP_STYLE} formatter={(v: number) => [v, "Ventas"]} />
              <Bar key="bc-bar" dataKey="conversiones" fill="#8C5E8A" radius={[5, 5, 0, 0]} name="Ventas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
