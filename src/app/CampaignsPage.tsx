import { useState, useRef, useEffect } from "react";
import { Plus, X, Users, Send, TrendingUp, BarChart2, ChevronDown, ImagePlus } from "lucide-react";
import { useApp, CAMPAIGNS } from "./state";
import type { Campaign, CampaignStatus } from "./state";

const STATUS_CFG_CAMPAIGN = {
  enviada:    { label: "Enviada",    bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  activa:     { label: "Activa",     bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-400"    },
  programada: { label: "Programada", bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"   },
  borrador:   { label: "Borrador",   bg: "bg-gray-50",    text: "text-gray-500",    dot: "bg-gray-300"    },
} as const;

const PRODUCTS = ["Conjuntos", "Pijamas", "Bralettes", "Bodys", "Lencería fina", "Corsetería"];

type AudienceMode = "all" | "product" | "gender";

interface CampaignForm {
  name:         string;
  message:      string;
  audienceMode: AudienceMode;
  products:     string[];
  gender:       string;
  imageUrl:     string | null;
  imageName:    string;
}

function OpenRateBar({ rate, status }: { rate: number; status: CampaignStatus }) {
  if (status === "borrador" || status === "programada") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs text-foreground font-medium">{rate}%</span>
    </div>
  );
}



// ── New Campaign Modal ─────────────────────────────────────────────────────────

function NewCampaignModal({
  onClose,
  onCreate,
  customers,
}: {
  onClose: () => void;
  onCreate: (c: Campaign) => void;
  customers: any[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState<CampaignForm>({
    name:         "",
    message:      "",
    audienceMode: "all",
    products:     [],
    gender:       "Femenino",
    imageUrl:     null,
    imageName:    "",
  });
  const [error, setError] = useState("");

  const getProductEstimate = (p: string) => customers.filter(c => c.favoriteProduct === p).length;
  const getGenderEstimate = (g: string) => {
    if (g === "Ambos") return customers.length;
    return customers.filter(c => c.gender === g).length;
  };

  const estimated =
    form.audienceMode === "all"
      ? customers.length
      : form.audienceMode === "gender"
      ? getGenderEstimate(form.gender)
      : form.audienceMode === "product"
      ? customers.filter(c => form.products.includes(c.favoriteProduct)).length
      : 0;

  const toggleProduct = (p: string) =>
    setForm(prev => ({
      ...prev,
      products: prev.products.includes(p)
        ? prev.products.filter(x => x !== p)
        : [...prev.products, p],
    }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setForm(p => ({ ...p, imageUrl: url, imageName: file.name }));
  };

  const handleCreate = () => {
    if (!form.name.trim())    { setError("El nombre es obligatorio."); return; }
    if (!form.message.trim()) { setError("El mensaje no puede estar vacío."); return; }
    if (form.audienceMode === "product" && form.products.length === 0) {
      setError("Selecciona al menos un tipo de prenda."); return;
    }
    setError("");
    onCreate({
      id:       Date.now(),
      name:     form.name.trim(),
      audience: estimated,
      status:   "enviada",
      sent:     0,
      openRate: 0,
      date:     "—",
      text:     form.message.trim(),
      audienceMode: form.audienceMode,
      genderFilter: form.audienceMode === "gender" ? form.gender : undefined,
      productFilter: form.audienceMode === "product" ? form.products[0] : undefined,
      imageFile: imageFile
    } as any);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">Nueva Campaña</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-6 flex flex-col gap-5">

          {/* Campaign name */}
          <div>
            <label className="text-xs font-medium text-foreground/80 block mb-1.5">
              Nombre de la campaña <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setError(""); }}
              placeholder="Ej: Liquidación de temporada"
              className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Audience segmentation */}
          <div>
            <label className="text-xs font-medium text-foreground/80 block mb-2">
              Audiencia objetivo
            </label>
            <div className="flex flex-col gap-2">
              {/* All */}
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="audience"
                  checked={form.audienceMode === "all"}
                  onChange={() => setForm(p => ({ ...p, audienceMode: "all", products: [], gender: "Femenino" }))}
                  className="accent-primary w-3.5 h-3.5 flex-shrink-0"
                />
                <span className="text-sm text-foreground">Todas las clientas</span>
                <span className="ml-auto text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {customers.length.toLocaleString()}
                </span>
              </label>

              {/* By product */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  checked={form.audienceMode === "product"}
                  onChange={() => setForm(p => ({ ...p, audienceMode: "product" }))}
                  className="accent-primary w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <span className="text-sm text-foreground">Por tipo de prenda</span>
                  {form.audienceMode === "product" && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {PRODUCTS.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { toggleProduct(p); setError(""); }}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all
                            ${form.products.includes(p)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-secondary"}`}
                        >
                          {p}
                          {form.products.includes(p) && (
                            <span className="ml-1 text-[10px] opacity-70">
                              ~{getProductEstimate(p).toLocaleString()}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              {/* By gender */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  checked={form.audienceMode === "gender"}
                  onChange={() => setForm(p => ({ ...p, audienceMode: "gender" }))}
                  className="accent-primary w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <span className="text-sm text-foreground">Por sexo</span>
                  {form.audienceMode === "gender" && (
                    <div className="flex gap-3 mt-2">
                      {["Femenino", "Masculino", "Ambos"].map(g => (
                        <label key={g} className="flex items-center gap-1.5 cursor-pointer text-xs text-foreground">
                          <input
                            type="radio"
                            name="gender"
                            checked={form.gender === g}
                            onChange={() => setForm(p => ({ ...p, gender: g }))}
                            className="accent-primary w-3 h-3"
                          />
                          {g}
                          <span className="text-muted-foreground">({getGenderEstimate(g).toLocaleString()})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Reach estimate */}
            {estimated > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-primary font-medium bg-primary/6 px-3 py-2 rounded-xl">
                <Users size={13} />
                Alcance estimado: <span className="font-semibold">{estimated.toLocaleString()} clientas</span>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-medium text-foreground/80 block mb-1.5">
              Mensaje <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={e => { setForm(p => ({ ...p, message: e.target.value })); setError(""); }}
              placeholder="Hola {nombre}, tenemos algo especial para ti... ✨"
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/50"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Usa {"{nombre}"} para personalizar el mensaje automáticamente
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className="text-xs font-medium text-foreground/80 block mb-1.5">
              Imagen adjunta <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
            {form.imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-border group">
                <img
                  src={form.imageUrl}
                  alt="Imagen de campaña"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, imageUrl: null, imageName: "" }))}
                    className="bg-white text-foreground text-xs font-medium px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <X size={12} />
                    Quitar imagen
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5">
                  <p className="text-white text-[11px] truncate">{form.imageName}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-28 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/3 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ImagePlus size={18} />
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                  Haz clic para subir una foto
                </p>
                <p className="text-[10px] text-muted-foreground/60">PNG, JPG, WEBP · Máx. 5 MB</p>
              </button>
            )}
          </div>

          {error && (
            <p className="text-[11px] text-red-500 bg-red-50 px-3 py-2 rounded-lg -mt-1">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm text-muted-foreground bg-muted rounded-xl hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            Guardar Borrador
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Campaigns Page ─────────────────────────────────────────────────────────────

export function CampaignsPage() {
  const { state } = useApp();
  const [showModal,  setShowModal]  = useState(false);
  const [campaigns,  setCampaigns]  = useState<Campaign[]>(CAMPAIGNS);
  const [customers,  setCustomers]  = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    if (!token) return;

    fetch("http://localhost:3000/customers", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCustomers(data))
      .catch(err => console.error("Error fetching customers for campaigns:", err));
  }, []);

  const stats = [
    {
      label: "Total campañas",
      value: String(campaigns.length),
      icon:  BarChart2,
      color: "text-primary",
    },
    {
      label: "Activas / Enviadas",
      value: String(campaigns.filter(c => c.status === "activa" || c.status === "enviada").length),
      icon:  Send,
      color: "text-emerald-600",
    },
    {
      label: "Contactos alcanzados",
      value: campaigns.reduce((s, c) => s + c.sent, 0).toLocaleString(),
      icon:  Users,
      color: "text-blue-600",
    },
    {
      label: "Apertura promedio",
      value: (() => {
        const w = campaigns.filter(c => c.openRate > 0);
        return w.length ? Math.round(w.reduce((s, c) => s + c.openRate, 0) / w.length) + "%" : "—";
      })(),
      icon:  TrendingUp,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto scrollbar-hide bg-background">
      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Campañas Masivas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gestiona tus envíos masivos de WhatsApp</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus size={16} />
            Nueva Campaña
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-2xl p-5 border border-border">
              <div className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3 ${color}`}>
                <Icon size={17} />
              </div>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Campaign table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Todas las campañas</h2>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors">
              Filtrar <ChevronDown size={11} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Nombre", "Estado", "Audiencia", "Enviados", "Tasa apertura", "Fecha"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {campaigns.map(c => {
                  const st = STATUS_CFG_CAMPAIGN[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{c.audience.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{c.sent.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <OpenRateBar rate={c.openRate} status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{c.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <NewCampaignModal
          customers={customers}
          onClose={() => setShowModal(false)}
          onCreate={async (campaignData: any) => {
            const token = localStorage.getItem("crm_token");
            if (!token) return;

            try {
              const formData = new FormData();
              formData.append("text", campaignData.text);
              // Fallback to activeDevice or "1"
              formData.append("deviceIds", JSON.stringify([state.activeDevice || "1"]));
              
              if (campaignData.genderFilter && campaignData.genderFilter !== "Ambos") {
                formData.append("genderFilter", campaignData.genderFilter);
              }
              if (campaignData.productFilter) {
                formData.append("productFilter", campaignData.productFilter);
              }
              if (campaignData.imageFile) {
                formData.append("media", campaignData.imageFile);
              }

              const res = await fetch("http://localhost:3000/campaigns", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`
                },
                body: formData
              });

              if (res.ok) {
                const result = await res.json();
                const newCampaign: Campaign = {
                  id: Date.now(),
                  name: campaignData.name,
                  audience: result.totalCustomers || 0,
                  status: "enviada",
                  sent: result.totalCustomers || 0,
                  openRate: 100,
                  date: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short" })
                };
                setCampaigns(prev => [newCampaign, ...prev]);
                setShowModal(false);
              } else {
                const errorData = await res.json();
                alert("Error al enviar campaña: " + (errorData.message || res.statusText));
              }
            } catch (err) {
              console.error("Error creating campaign:", err);
              alert("Ocurrió un error al enviar la campaña");
            }
          }}
        />
      )}
    </div>
  );
}
