import { createContext, useContext, useReducer } from "react";
import type { ReactNode, Dispatch } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

export type NavId          = "inbox" | "campaigns" | "reports" | "settings";
export type FilterId       = "todos" | "pendiente" | "en_atencion" | "terminada";
export type ChatStatus     = "pendiente" | "en_atencion" | "nuevo" | "terminada";
export type MsgType        = "incoming" | "outgoing" | "note";
export type CampaignStatus = "enviada" | "programada" | "borrador" | "activa";

export interface Msg {
  id: number; type: MsgType; text: string; time: string; read?: boolean;
}
export interface Chat {
  id: number; name: string; phone: string; lastMessage: string;
  time: string; status: ChatStatus; unread: number; initials: string;
}
export interface CRMEntry {
  phone: string; birthday: string; gender: string; interest: string;
}
export interface SaleRecord {
  product: string;
  notes:   string;
  date:    string;
}
export interface Campaign {
  id: number; name: string; audience: number; status: CampaignStatus;
  sent: number; openRate: number; date: string;
}
export interface Agent {
  id: number; name: string; initials: string; role: string;
  status: "online" | "offline" | "away"; chats: number;
}
export interface Device {
  id: string; name: string; number: string; online: boolean;
}

export interface AppState {
  activeNav:    NavId;
  activeChatId: number;
  activeDevice: string;
  filter:       FilterId;
  searchQuery:  string;
  messages:     Record<number, Msg[]>;
  crmData:      Record<number, CRMEntry>;
  savedIds:     Set<number>;
  noteMode:     boolean;
  inputText:    string;
  chatStatuses:  Record<number, ChatStatus>;
  contactNames:  Record<number, string>;
  contactTags:   Record<number, string[]>;
  sales:        Record<number, SaleRecord | null>;
  assignments:  Record<number, string>;
  agents:       Agent[];
}

export type AppAction =
  | { type: "SET_NAV";      nav:    NavId             }
  | { type: "SET_CHAT";     id:     number            }
  | { type: "SET_DEVICE";   device: string            }
  | { type: "SET_FILTER";   filter: FilterId          }
  | { type: "SET_SEARCH";   query:  string            }
  | { type: "SEND_MSG";     chatId: number; msg: Msg  }
  | { type: "UPDATE_CRM";   chatId: number; data: Partial<CRMEntry> }
  | { type: "MARK_SAVED";   chatId: number            }
  | { type: "CLEAR_SAVED";  chatId: number            }
  | { type: "SET_NOTE_MODE"; val:   boolean           }
  | { type: "SET_INPUT";    val:    string            }
  | { type: "TOGGLE_TAG";   chatId: number; tag: string }
  | { type: "RECORD_SALE";  chatId: number; sale: SaleRecord }
  | { type: "CLEAR_SALE";   chatId: number            }
  | { type: "ASSIGN_AGENT"; chatId: number; agentName: string }
  | { type: "ADD_AGENT";        agent:   Agent      }
  | { type: "SET_CHAT_STATUS";  chatId: number; status: ChatStatus }
  | { type: "SET_CONTACT_NAME"; chatId: number; name: string };

// ── Static Data ────────────────────────────────────────────────────────────────

export const BOB_RATE = 6.96; // 1 USD = 6.96 BOB

export const DEVICES: Device[] = [
  { id: "v1", name: "Ventas 1", number: "+52 55 1000 0001", online: true  },
  { id: "v2", name: "Ventas 2", number: "+52 55 1000 0002", online: true  },
  { id: "sp", name: "Soporte",  number: "+52 55 1000 0003", online: false },
];

export const ALL_TAGS = [
  "Cliente VIP", "Seguimiento", "Pedido activo", "Cotización enviada", "Post-venta",
];

export const CHATS: Chat[] = [
  { id: 1, name: "Valeria Torres",        phone: "+52 55 1234 5678", lastMessage: "Quiero ver si tienen algo en color vino 🖤",      time: "10:32", status: "en_atencion", unread: 0, initials: "VT" },
  { id: 2, name: "Sofía Mendoza",         phone: "+52 55 9876 5432", lastMessage: "¿Tienen tallas grandes disponibles?",             time: "09:45", status: "pendiente",   unread: 3, initials: "SM" },
  { id: 3, name: "Camila Ruiz",           phone: "+52 55 5555 1234", lastMessage: "Perfecto, realizo el pago ahora mismo 💳",        time: "09:12", status: "en_atencion", unread: 0, initials: "CR" },
  { id: 4, name: "Andrea López",          phone: "+52 55 3333 9876", lastMessage: "¿Cuánto tarda el envío a Monterrey?",             time: "Ayer",  status: "pendiente",   unread: 1, initials: "AL" },
  { id: 5, name: "María Fernanda García", phone: "+52 55 7777 4321", lastMessage: "Muchas gracias, quedo al pendiente 💕",           time: "Ayer",  status: "en_atencion", unread: 0, initials: "MG" },
  { id: 6, name: "Luisa Herrera",         phone: "+52 55 2222 6789", lastMessage: "¿Hacen envíos a Guadalajara?",                   time: "Lun",   status: "nuevo",       unread: 1, initials: "LH" },
];

export const CAMPAIGNS: Campaign[] = [
  { id: 1, name: "Reactivación Clientas Inactivas",    audience: 245, status: "enviada",    sent: 241, openRate: 72, date: "15 Jun 2025" },
  { id: 2, name: "Nuevas Llegadas — Colección Verano", audience: 318, status: "activa",     sent: 318, openRate: 68, date: "20 Jun 2025" },
  { id: 3, name: "Seguimiento Post-Compra Junio",      audience: 89,  status: "enviada",    sent: 87,  openRate: 81, date: "22 Jun 2025" },
  { id: 4, name: "Campaña San Valentín 2026",          audience: 500, status: "programada", sent: 0,   openRate: 0,  date: "12 Feb 2026" },
  { id: 5, name: "Catálogo Otoño-Invierno",            audience: 0,   status: "borrador",   sent: 0,   openRate: 0,  date: "—"           },
];

export const INITIAL_AGENTS: Agent[] = [
  { id: 1, name: "María Rodríguez", initials: "MR", role: "Gerente de Ventas", status: "online",  chats: 12 },
  { id: 2, name: "Fernanda Castro", initials: "FC", role: "Asesora Senior",    status: "online",  chats: 8  },
  { id: 3, name: "Alejandra Vega",  initials: "AV", role: "Asesora",          status: "away",    chats: 5  },
  { id: 4, name: "Daniela Moreno",  initials: "DM", role: "Asesora",          status: "offline", chats: 0  },
];

export const WEEKLY_DATA = [
  { day: "Lun", mensajes: 34, respondidos: 28, conversiones: 6  },
  { day: "Mar", mensajes: 41, respondidos: 35, conversiones: 9  },
  { day: "Mié", mensajes: 38, respondidos: 30, conversiones: 7  },
  { day: "Jue", mensajes: 52, respondidos: 44, conversiones: 12 },
  { day: "Vie", mensajes: 63, respondidos: 55, conversiones: 18 },
  { day: "Sáb", mensajes: 71, respondidos: 61, conversiones: 21 },
  { day: "Dom", mensajes: 29, respondidos: 22, conversiones: 5  },
];

export const INTEREST_DATA = [
  { name: "Conjuntos", value: 32, color: "#8C5E8A" },
  { name: "Pijamas",   value: 24, color: "#C4A0BF" },
  { name: "Bralettes", value: 18, color: "#D4B8D0" },
  { name: "Bodys",     value: 14, color: "#E8D5E5" },
  { name: "Otros",     value: 12, color: "#6D6880" },
];

const INIT_MESSAGES: Record<number, Msg[]> = {
  1: [
    { id: 1, type: "incoming", text: "Hola! Buen día 😊", time: "10:14" },
    { id: 2, type: "incoming", text: "Vi el conjunto de encaje en Instagram y me encantó ✨", time: "10:15" },
    { id: 3, type: "outgoing", text: "¡Hola Valeria! Con gusto te ayudo. ¿Tienes en mente alguna talla específica?", time: "10:18", read: true },
    { id: 4, type: "incoming", text: "Soy talla M, a veces L en la parte de abajo", time: "10:20" },
    { id: 5, type: "note",     text: "Cliente recurrente — compró pijama de satén en feb. Talla M/L.", time: "10:22" },
    { id: 6, type: "outgoing", text: "Perfecto! El conjunto está disponible. Precio $850 MXN con envío gratis. ¿Te mando más fotos?", time: "10:28", read: true },
    { id: 7, type: "incoming", text: "Sí por favor! También quiero ver si tienen algo en color vino 🖤", time: "10:32" },
  ],
  2: [
    { id: 1, type: "incoming", text: "Buenos días! 👋", time: "09:40" },
    { id: 2, type: "incoming", text: "Busco pijama de seda en talla XL o XXL", time: "09:42" },
    { id: 3, type: "incoming", text: "¿Tienen tallas grandes disponibles?", time: "09:45" },
  ],
  3: [
    { id: 1, type: "incoming", text: "Hola! Quiero el bralette de encaje floral del catálogo", time: "08:55" },
    { id: 2, type: "outgoing", text: "¡Hola Camila! Disponible en blanco, negro y nude. ¿Cuál prefieres?", time: "09:00", read: true },
    { id: 3, type: "incoming", text: "El negro, talla S por favor", time: "09:05" },
    { id: 4, type: "outgoing", text: "Bralette negro talla S: $420 MXN con envío incluido. Te comparto el link de pago 🔗", time: "09:08", read: true },
    { id: 5, type: "incoming", text: "Perfecto, realizo el pago ahora mismo 💳", time: "09:12" },
  ],
  4: [
    { id: 1, type: "incoming", text: "Hola buenas tardes", time: "Ayer" },
    { id: 2, type: "incoming", text: "¿Cuánto tarda el envío a Monterrey?", time: "Ayer" },
  ],
  5: [
    { id: 1, type: "incoming", text: "Hola! Me encantó su catálogo 😍", time: "Ayer" },
    { id: 2, type: "outgoing", text: "¡Gracias María! Esta semana tenemos nuevos diseños.", time: "Ayer", read: true },
    { id: 3, type: "incoming", text: "Muchas gracias, quedo al pendiente 💕", time: "Ayer" },
  ],
  6: [
    { id: 1, type: "incoming", text: "¿Hacen envíos a Guadalajara?", time: "Lun" },
  ],
};

const INIT_CRM: Record<number, CRMEntry> = {
  1: { phone: "+52 55 1234 5678", birthday: "1992-03-15", gender: "Femenino", interest: "Conjuntos" },
  2: { phone: "+52 55 9876 5432", birthday: "1988-07-22", gender: "Femenino", interest: "Pijamas"   },
  3: { phone: "+52 55 5555 1234", birthday: "1995-11-08", gender: "Femenino", interest: "Bralettes" },
  4: { phone: "+52 55 3333 9876", birthday: "",           gender: "",          interest: "Bodys"     },
  5: { phone: "+52 55 7777 4321", birthday: "1990-05-30", gender: "Femenino", interest: "Conjuntos" },
  6: { phone: "+52 55 2222 6789", birthday: "",           gender: "",          interest: ""          },
};

// ── Reducer ────────────────────────────────────────────────────────────────────

const INIT_STATE: AppState = {
  activeNav:    "inbox",
  activeChatId: 1,
  activeDevice: "v1",
  filter:       "todos",
  searchQuery:  "",
  messages:     INIT_MESSAGES,
  crmData:      INIT_CRM,
  savedIds:     new Set<number>(),
  noteMode:     false,
  inputText:    "",
  chatStatuses:  {},
  contactNames:  {},
  contactTags:   { 1: ["Cliente VIP"], 3: ["Pedido activo"], 5: ["Seguimiento"] },
  sales:        {},
  assignments:  {},
  agents:       INITIAL_AGENTS,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_NAV":
      return { ...state, activeNav: action.nav };
    case "SET_CHAT":
      return { ...state, activeChatId: action.id, noteMode: false, inputText: "" };
    case "SET_DEVICE":
      return { ...state, activeDevice: action.device };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    case "SET_SEARCH":
      return { ...state, searchQuery: action.query };
    case "SET_NOTE_MODE":
      return { ...state, noteMode: action.val };
    case "SET_INPUT":
      return { ...state, inputText: action.val };
    case "SEND_MSG": {
      const currentStatus =
        state.chatStatuses[action.chatId] ??
        (CHATS.find(c => c.id === action.chatId)?.status ?? "pendiente");
      const reopen = action.msg.type === "incoming" && currentStatus === "terminada";
      return {
        ...state,
        inputText: "",
        messages: {
          ...state.messages,
          [action.chatId]: [...(state.messages[action.chatId] ?? []), action.msg],
        },
        chatStatuses: reopen
          ? { ...state.chatStatuses, [action.chatId]: "pendiente" }
          : state.chatStatuses,
      };
    }
    case "UPDATE_CRM":
      return {
        ...state,
        crmData: {
          ...state.crmData,
          [action.chatId]: { ...state.crmData[action.chatId], ...action.data },
        },
      };
    case "MARK_SAVED": {
      const s = new Set(state.savedIds); s.add(action.chatId);
      return { ...state, savedIds: s };
    }
    case "CLEAR_SAVED": {
      const s = new Set(state.savedIds); s.delete(action.chatId);
      return { ...state, savedIds: s };
    }
    case "TOGGLE_TAG": {
      const cur = state.contactTags[action.chatId] ?? [];
      const has = cur.includes(action.tag);
      return {
        ...state,
        contactTags: {
          ...state.contactTags,
          [action.chatId]: has ? cur.filter(t => t !== action.tag) : [...cur, action.tag],
        },
      };
    }
    case "RECORD_SALE":
      return { ...state, sales: { ...state.sales, [action.chatId]: action.sale } };
    case "CLEAR_SALE":
      return { ...state, sales: { ...state.sales, [action.chatId]: null } };
    case "ASSIGN_AGENT":
      return { ...state, assignments: { ...state.assignments, [action.chatId]: action.agentName } };
    case "ADD_AGENT":
      return { ...state, agents: [...state.agents, action.agent] };
    case "SET_CHAT_STATUS":
      return { ...state, chatStatuses: { ...state.chatStatuses, [action.chatId]: action.status } };
    case "SET_CONTACT_NAME":
      return { ...state, contactNames: { ...state.contactNames, [action.chatId]: action.name } };
    default:
      return state;
  }
}

// ── Context & Provider ─────────────────────────────────────────────────────────

interface CtxShape { state: AppState; dispatch: Dispatch<AppAction>; }

export const AppCtx = createContext<CtxShape>({ state: INIT_STATE, dispatch: () => {} });
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);
  return <AppCtx.Provider value={{ state, dispatch }}>{children}</AppCtx.Provider>;
}

// ── Shared Config Maps ─────────────────────────────────────────────────────────

export const STATUS_CFG = {
  pendiente:   { label: "Pendiente",   bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"   },
  en_atencion: { label: "En Atención", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  nuevo:       { label: "Nuevo",       bg: "bg-purple-50",  text: "text-purple-700",  dot: "bg-purple-400"  },
  terminada:   { label: "Terminada",   bg: "bg-gray-100",   text: "text-gray-500",    dot: "bg-gray-400"    },
} as const;

export const AVATAR_COLORS: Record<string, string> = {
  VT: "from-violet-200 to-pink-200 text-violet-700",
  SM: "from-rose-100  to-pink-200 text-rose-700",
  CR: "from-fuchsia-100 to-purple-200 text-fuchsia-700",
  AL: "from-amber-100 to-orange-200 text-amber-700",
  MG: "from-pink-100  to-rose-200 text-rose-700",
  LH: "from-purple-100 to-violet-200 text-purple-700",
  FC: "from-teal-100  to-cyan-200 text-teal-700",
  AV: "from-sky-100   to-blue-200 text-sky-700",
  DM: "from-gray-100  to-gray-200 text-gray-600",
};

// Generates initials from a full name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(w => w.length > 0)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
}
