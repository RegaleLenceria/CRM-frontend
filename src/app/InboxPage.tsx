import { useState, useRef, useEffect } from "react";
import {
  Search, ChevronDown, Paperclip, Lock, Send,
  Phone, Calendar, User, MoreVertical, CheckCheck,
  UserPlus, Star, Check, X, ShoppingBag, Wifi, WifiOff,
  CheckCircle, RotateCcw, MessageCircle, UserCircle2,
} from "lucide-react";
import { useApp, CHATS, DEVICES, STATUS_CFG } from "./state";
import type { FilterId, ChatStatus, SaleRecord } from "./state";
import { Avatar, StatusChip } from "./shared";

// ── WhatsApp Date Formatter ───────────────────────────────────────────────────

const getDayLabel = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Hoy";
  } else if (d.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  } else {
    return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  }
};

// ── Assign Modal ───────────────────────────────────────────────────────────────

function AssignModal({ chatId, onClose }: { chatId: string | number; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const agents  = state.agents;
  const current = state.assignments[chatId];

  const statusDot = {
    online:  "bg-emerald-400",
    away:    "bg-amber-400",
    offline: "bg-gray-300",
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Asignar conversación</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-3 flex flex-col gap-1">
          {agents.map(agent => {
            const isSelected = current === agent.name;
            const canAssign  = agent.status !== "offline";
            return (
              <button
                key={agent.id}
                onClick={() => {
                  if (!canAssign) return;
                  dispatch({ type: "ASSIGN_AGENT", chatId, agentName: agent.name });
                  onClose();
                }}
                disabled={!canAssign}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                  ${isSelected  ? "bg-primary/10 ring-1 ring-primary/20"
                  : canAssign   ? "hover:bg-muted"
                                : "opacity-40 cursor-not-allowed"}`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar initials={agent.initials} size="sm" />
                  <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-card ${statusDot[agent.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.role} · {agent.chats} chats</p>
                </div>
                {isSelected && <Check size={14} className="text-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t border-border">
          <p className="text-[11px] text-muted-foreground">Las asesoras sin conexión no pueden recibir asignaciones</p>
        </div>
      </div>
    </div>
  );
}

// ── Sale Modal ─────────────────────────────────────────────────────────────────

const SALE_CATEGORIES = [
  "Ropa interior",
  "Fajas",
  "Deportivos",
  "Trajes de baño",
  "Pijamas",
  "Hombre",
  "Accesorios",
];

function SaleModal({ chatId, onClose }: { chatId: string | number; onClose: () => void }) {
  const { dispatch } = useApp();
  const [product, setProduct] = useState("");
  const [notes,   setNotes]   = useState("");
  const [error,   setError]   = useState("");

  const handleSave = () => {
    if (!product) { setError("Selecciona el tipo de producto."); return; }
    const sale: SaleRecord = {
      product,
      notes,
      date: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }),
    };
    dispatch({ type: "RECORD_SALE", chatId, sale });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ShoppingBag size={14} className="text-emerald-600" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Registrar Venta</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-foreground/80 block mb-2">
              Tipo de producto <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SALE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setProduct(cat); setError(""); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border
                    ${product === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted text-muted-foreground border-transparent hover:border-primary/20 hover:text-primary"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-foreground/80 block mb-1.5">Notas adicionales</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Talla, color, detalles del pedido..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm text-muted-foreground bg-muted rounded-xl hover:bg-secondary transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Check size={14} />
              Registrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Device Dropdown ────────────────────────────────────────────────────────────

function DeviceDropdown() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = DEVICES.find(d => d.id === state.activeDevice) ?? DEVICES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${active.online ? "bg-emerald-400" : "bg-gray-300"}`} />
        <span className="font-medium">{active.name}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
          <p className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            Cambiar dispositivo
          </p>
          {DEVICES.map(d => (
            <button
              key={d.id}
              onClick={() => { dispatch({ type: "SET_DEVICE", device: d.id }); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors ${state.activeDevice === d.id ? "bg-primary/5" : ""}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${d.online ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {d.online ? <Wifi size={13} /> : <WifiOff size={13} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-tight">{d.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{d.number}</p>
              </div>
              {state.activeDevice === d.id && <Check size={12} className="text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Chat List Panel ────────────────────────────────────────────────────────────

function ChatListPanel() {
  const { state, dispatch } = useApp();
  const { filter, searchQuery, activeChatId, sales, chatStatuses, contactNames } = state;

  // Effective status: mutable override ?? static default
  const effectiveStatus = (id: string | number): ChatStatus =>
    chatStatuses[id] ?? (CHATS.find(c => c.id === id)?.status ?? "pendiente");

  const filtered = CHATS.filter(c => {
    const status    = effectiveStatus(c.id);
    const byFilter  = filter === "todos" || status === filter;
    const bySearch  =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return byFilter && bySearch;
  });

  return (
    <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-card">
      <div className="px-4 pt-5 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-semibold text-foreground tracking-tight">Mensajes</h1>
          <DeviceDropdown />
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => dispatch({ type: "SET_SEARCH", query: e.target.value })}
            placeholder="Buscar conversación..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-1.5 px-4 py-3 border-b border-border flex-shrink-0">
        {(
          [
            { value: "todos",       label: "Todos"       },
            { value: "pendiente",   label: "Pendientes"  },
            { value: "en_atencion", label: "En Atención" },
            { value: "terminada",   label: "Terminadas"  },
          ] as { value: FilterId; label: string }[]
        ).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => dispatch({ type: "SET_FILTER", filter: value })}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap
              ${filter === value ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-border/50">
        {filtered.map(chat => {
          const isActive = chat.id === activeChatId;
          const hasSale  = !!sales[chat.id];
          const status   = effectiveStatus(chat.id);
          return (
            <button
              key={chat.id}
              onClick={() => dispatch({ type: "SET_CHAT", id: chat.id })}
              className={`w-full px-4 py-3.5 flex gap-3 hover:bg-muted/40 transition-colors text-left
                ${isActive ? "bg-primary/5 border-l-2 border-l-primary pl-[14px]" : ""}
                ${status === "terminada" ? "opacity-60" : ""}`}
            >
              <div className="relative flex-shrink-0 mt-0.5">
                <Avatar initials={chat.initials} />
                {chat.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {chat.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-sm truncate ${chat.unread > 0 ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}>
                      {contactNames[chat.id] ?? chat.name}
                    </span>
                    {hasSale && <span className="flex-shrink-0 text-[10px] bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded-md font-medium">💰</span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">{chat.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mb-2">{chat.lastMessage}</p>
                <StatusChip status={status} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Active Chat Panel ──────────────────────────────────────────────────────────

function ActiveChatPanel() {
  const { state, dispatch } = useApp();
  const { activeChatId, messages, noteMode, inputText, assignments, chatStatuses } = state;
  const chat        = CHATS.find(c => c.id === activeChatId)!;
  const msgs        = messages[activeChatId] ?? [];
  const assignedTo  = assignments[activeChatId];
  const chatStatus  = chatStatuses[activeChatId] ?? chat.status;
  const isTerminada = chatStatus === "terminada";
  const endRef      = useRef<HTMLDivElement>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showSale,   setShowSale]   = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const updateStatus = async (status: ChatStatus) => {
    const token = localStorage.getItem("crm_token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/chats/${activeChatId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        dispatch({ type: "SET_CHAT_STATUS", chatId: activeChatId, status });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const terminarChat = () => updateStatus("terminada");
  const reabrirChat = () => updateStatus("en_atencion");

  const simularRespuesta = () => {
    dispatch({
      type:   "SEND_MSG",
      chatId: activeChatId,
      msg: {
        id:   Date.now().toString(),
        type: "incoming",
        text: "Hola, quería preguntarte algo más 😊",
        time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      },
    });
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const send = async () => {
    const text = inputText.trim();
    if (!text && !selectedImage) return;

    if (noteMode) {
      if (!text) return;
      dispatch({
        type: "SEND_MSG",
        chatId: activeChatId,
        msg: {
          id: `note-${Date.now()}`,
          type: "note",
          text,
          time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
          rawTime: new Date().toISOString()
        },
      });
      dispatch({ type: "SET_INPUT", val: "" });
      return;
    }

    const token = localStorage.getItem("crm_token");
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3000/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: text,
          deviceId: state.activeDevice,
          mediaUrl: selectedImage || undefined
        })
      });
      if (res.ok) {
        const m = await res.json();
        dispatch({
          type: "SEND_MSG",
          chatId: activeChatId,
          msg: {
            id: m.id,
            type: "outgoing",
            text: m.content,
            time: new Date(m.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
            rawTime: m.timestamp,
            read: m.isRead
          }
        });
        dispatch({ type: "SET_INPUT", val: "" });
        setSelectedImage(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex-1 min-w-0 flex flex-col bg-background">
        {/* Header — action buttons only */}
        <div className="px-6 py-3 border-b border-border bg-card flex items-center justify-end flex-shrink-0 gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isTerminada && (
              <button
                onClick={() => setShowSale(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <ShoppingBag size={12} />
                Registrar venta
              </button>
            )}
            {!isTerminada && (
              <button
                onClick={() => setShowAssign(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/25 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors"
              >
                <UserPlus size={12} />
                {assignedTo ? "Reasignar" : "Asignar"}
              </button>
            )}
            {isTerminada ? (
              <button
                onClick={reabrirChat}
                className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/25 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors"
              >
                <RotateCcw size={12} />
                Reabrir
              </button>
            ) : (
              <button
                onClick={terminarChat}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                <CheckCircle size={12} />
                Terminar
              </button>
            )}
            <button className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5 flex flex-col gap-2.5">
          {assignedTo && (
            <div className="flex justify-center">
              <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Chat asignado a {assignedTo}
              </span>
            </div>
          )}
          {isTerminada && (
            <div className="flex justify-center my-2">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-center max-w-xs">
                <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                  <CheckCircle size={12} />
                  Conversación terminada
                </div>
                <p className="text-[11px] text-gray-400 mb-2.5">
                  Si la clienta escribe de nuevo, el chat volverá a <strong>Pendiente</strong> automáticamente.
                </p>
                <button
                  onClick={simularRespuesta}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/8 hover:bg-primary/12 px-3 py-1.5 rounded-lg transition-colors mx-auto border border-primary/15"
                >
                  <MessageCircle size={11} />
                  Simular respuesta de clienta
                </button>
              </div>
            </div>
          )}
          {(() => {
            let lastDateLabel = "";
            return msgs.map(msg => {
              const currentDateLabel = getDayLabel(msg.rawTime);
              const showDateHeader = currentDateLabel && currentDateLabel !== lastDateLabel;
              if (currentDateLabel) {
                lastDateLabel = currentDateLabel;
              }

              const isImage = msg.text.startsWith("[image:");
              let imgUrl = "";
              let caption = msg.text;
              if (isImage) {
                const closeIndex = msg.text.indexOf("]");
                imgUrl = msg.text.slice(7, closeIndex);
                caption = msg.text.slice(closeIndex + 1);
              }

              const isOut = msg.type === "outgoing";

              return (
                <div key={msg.id} className="flex flex-col gap-2 animate-fade-in">
                  {showDateHeader && (
                    <div className="flex justify-center my-3">
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border/50 px-3.5 py-1 rounded-full shadow-sm">
                        {currentDateLabel}
                      </span>
                    </div>
                  )}
                  {msg.type === "note" ? (
                    <div className="flex justify-center my-1">
                      <div className="bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] px-4 py-2 rounded-2xl max-w-md flex items-center gap-2 shadow-sm">
                        <Lock size={10} className="flex-shrink-0 text-amber-500" />
                        <span className="leading-relaxed">{msg.text}</span>
                        <span className="text-amber-400 text-[10px] ml-1 flex-shrink-0">{msg.time}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm flex flex-col gap-1.5
                        ${isOut ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-foreground border border-border rounded-bl-md"}`}>
                        {isImage && (
                          <div className="rounded-xl overflow-hidden max-w-full">
                            <img
                              src={imgUrl}
                              alt="Adjunto"
                              className="max-h-60 object-contain hover:scale-[1.02] transition-transform cursor-pointer"
                              onClick={() => window.open(imgUrl, "_blank")}
                            />
                          </div>
                        )}
                        {(!isImage || caption) && <p className="whitespace-pre-wrap">{caption}</p>}
                        <div className={`flex items-center gap-1 mt-0.5 ${isOut ? "justify-end" : "justify-start"}`}>
                          <span className={`text-[9px] ${isOut ? "text-white/50" : "text-muted-foreground"}`}>{msg.time}</span>
                          {isOut && (
                            <span className="flex items-center">
                              {msg.receipt === 'read' ? (
                                <CheckCheck size={11} className="text-blue-300 ml-0.5" />
                              ) : msg.receipt === 'delivered' ? (
                                <CheckCheck size={11} className="text-white/40 ml-0.5" />
                              ) : (
                                <Check size={11} className="text-white/30 ml-0.5" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
          <div ref={endRef} />
        </div>

        {/* Preview of selected image */}
        {selectedImage && (
          <div className="px-5 pt-3 pb-1 border-t border-border bg-card flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
              <img src={selectedImage} alt="Vista previa" className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Imagen lista para enviar</p>
          </div>
        )}

        {/* Input */}
        <div className={`px-5 py-4 border-t border-border flex-shrink-0 transition-colors duration-200 ${noteMode ? "bg-amber-50/60" : "bg-card"}`}>
          {noteMode && (
            <div className="flex items-center gap-1.5 text-amber-700 text-[11px] font-medium mb-2 ml-1">
              <Lock size={10} />
              Nota interna — no visible para la clienta
            </div>
          )}
          <div className={`flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all
            ${noteMode ? "bg-amber-50 border-amber-200" : "bg-background border-border focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10"}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 pb-0.5 cursor-pointer"
            >
              <Paperclip size={17} />
            </button>
            <textarea
              value={inputText}
              onChange={e => dispatch({ type: "SET_INPUT", val: e.target.value })}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={noteMode ? "Escribe una nota interna..." : "Escribe un mensaje..."}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50 leading-relaxed max-h-28 overflow-y-auto scrollbar-hide"
            />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => dispatch({ type: "SET_NOTE_MODE", val: !noteMode })}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer
                  ${noteMode ? "bg-amber-200 text-amber-700" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <Lock size={14} />
              </button>
              <button
                onClick={send}
                disabled={!inputText.trim() && !selectedImage}
                className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAssign && <AssignModal chatId={activeChatId} onClose={() => setShowAssign(false)} />}
      {showSale   && <SaleModal   chatId={activeChatId} onClose={() => setShowSale(false)}   />}
    </>
  );
}

// ── CRM Context Panel ──────────────────────────────────────────────────────────

function CRMContextPanel() {
  const { state, dispatch } = useApp();
  const { activeChatId, crmData, savedIds, sales, assignments, chatStatuses, contactNames } = state;
  const chat        = CHATS.find(c => c.id === activeChatId)!;
  const crm         = crmData[activeChatId] ?? { phone: "", birthday: "", gender: "", interest: "" };
  const isSaved     = savedIds.has(activeChatId);
  const sale        = sales[activeChatId];
  const assigned    = assignments[activeChatId];
  const chatStatus  = chatStatuses[activeChatId] ?? chat.status;
  const st          = STATUS_CFG[chatStatus];
  const displayName = contactNames[activeChatId] ?? chat.name;
  const isNuevo     = chatStatus === "nuevo";
  const [showSale, setShowSale] = useState(false);

  const update = (data: Partial<typeof crm>) =>
    dispatch({ type: "UPDATE_CRM", chatId: activeChatId, data });

  const handleSave = async () => {
    const token = localStorage.getItem("crm_token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3000/customers/${activeChatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: crm.phone,
          birthday: crm.birthday || null,
          gender: crm.gender || null,
          favoriteProduct: crm.interest || null,
          name: contactNames[activeChatId] ?? chat.name
        })
      });
      if (res.ok) {
        dispatch({ type: "MARK_SAVED", chatId: activeChatId });
        setTimeout(() => dispatch({ type: "CLEAR_SAVED", chatId: activeChatId }), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="w-[340px] flex-shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto scrollbar-hide">
        {/* Client header */}
        <div className="px-6 pt-6 pb-5 text-center border-b border-border flex-shrink-0">
          <div className="flex justify-center mb-3">
            <Avatar initials={chat.initials} size="lg" />
          </div>
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{chat.phone}</p>
          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            {assigned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/8 text-primary">
                → {assigned.split(" ")[0]}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Nuevo contact prompt */}
          {isNuevo && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <UserCircle2 size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Contacto nuevo — registra el nombre para identificarlo en la lista.
              </p>
            </div>
          )}

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Datos del cliente</p>

          {/* Editable name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
              <User size={11} className="text-primary" />Nombre
            </label>
            <input
              value={contactNames[activeChatId] ?? chat.name}
              onChange={e => dispatch({ type: "SET_CONTACT_NAME", chatId: activeChatId, name: e.target.value })}
              placeholder="Escribe el nombre del cliente..."
              className={`w-full px-3 py-2.5 text-sm bg-muted rounded-xl border outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50
                ${isNuevo && !(contactNames[activeChatId] ?? chat.name) ? "border-amber-300 focus:ring-amber-200" : "border-transparent"}`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
              <Phone size={11} className="text-primary" />Teléfono
            </label>
            <input
              value={crm.phone}
              onChange={e => update({ phone: e.target.value })}
              placeholder="+591 7000 0000"
              className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
              <Calendar size={11} className="text-primary" />Cumpleaños
            </label>
            <input
              type="date"
              value={crm.birthday}
              onChange={e => update({ birthday: e.target.value })}
              className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
              <User size={11} className="text-primary" />Sexo
            </label>
            <div className="relative">
              <select
                value={crm.gender}
                onChange={e => update({ gender: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-foreground cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                <option>Femenino</option>
                <option>Masculino</option>
                <option>No especificado</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
              <Star size={11} className="text-primary" />Producto de interés
            </label>
            <div className="relative">
              <select
                value={crm.interest}
                onChange={e => update({ interest: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-muted rounded-xl border border-transparent outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none text-foreground cursor-pointer"
              >
                <option value="">Seleccionar...</option>
                <option>Conjuntos</option>
                <option>Pijamas</option>
                <option>Bralettes</option>
                <option>Bodys</option>
                <option>Lencería fina</option>
                <option>Ropa de dormir</option>
                <option>Corsetería</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]
              ${isSaved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
          >
            <Check size={14} />
            {isSaved ? "¡Datos guardados!" : "Guardar Datos"}
          </button>

          {/* Sale section */}
          <div className="border-t border-border pt-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Venta</p>
            {sale ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
                    <ShoppingBag size={12} />
                    Venta registrada
                  </div>
                  <button
                    onClick={() => dispatch({ type: "CLEAR_SALE", chatId: activeChatId })}
                    className="text-[10px] text-emerald-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
                <p className="text-sm font-semibold text-emerald-800">{sale.product}</p>
                {sale.notes && <p className="text-[11px] text-emerald-600 mt-0.5 italic">{sale.notes}</p>}
                <p className="text-[10px] text-emerald-500 mt-1.5">{sale.date}</p>
              </div>
            ) : (
              <button
                onClick={() => setShowSale(true)}
                className="w-full py-2.5 text-sm font-medium text-emerald-700 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} />
                Registrar Venta
              </button>
            )}
          </div>

        </div>
      </div>

      {showSale && <SaleModal chatId={activeChatId} onClose={() => setShowSale(false)} />}
    </>
  );
}

// ── Inbox Page ─────────────────────────────────────────────────────────────────

export function InboxPage() {
  return (
    <>
      <ChatListPanel />
      <ActiveChatPanel />
      <CRMContextPanel />
    </>
  );
}
