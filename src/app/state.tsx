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

export const DEVICES = new Proxy([] as Device[], {
  get(target, prop, receiver) {
    if (prop === "0" || prop === 0) {
      if (target.length > 0) return target[0];
      return { id: "", name: "Sin Dispositivo", number: "", online: false };
    }
    if (prop === "find") {
      return (callback: (el: Device) => boolean) => {
        const found = target.find(callback);
        if (found !== undefined) return found;
        return { id: "", name: "Sin Dispositivo", number: "", online: false };
      };
    }
    return Reflect.get(target, prop, receiver);
  }
}) as Device[];

export const ALL_TAGS = [
  "Cliente VIP", "Seguimiento", "Pedido activo", "Cotización enviada", "Post-venta",
];

export const CHATS = new Proxy([] as Chat[], {
  get(target, prop, receiver) {
    if (prop === "find") {
      return (callback: (el: Chat) => boolean) => {
        const found = target.find(callback);
        if (found !== undefined) return found;
        return {
          id: 0,
          name: "",
          phone: "",
          lastMessage: "",
          time: "",
          status: "pendiente",
          unread: 0,
          initials: ""
        } as Chat;
      };
    }
    return Reflect.get(target, prop, receiver);
  }
}) as Chat[];

export const CAMPAIGNS: Campaign[] = [];

export const INITIAL_AGENTS: Agent[] = [
  { id: 1, name: "Nicole", initials: "N", role: "Administradora", status: "online", chats: 0 },
  { id: 2, name: "Andrea", initials: "A", role: "Administradora", status: "online", chats: 0 },
  { id: 3, name: "Carla", initials: "C", role: "Administradora", status: "online", chats: 0 },
];

export const WEEKLY_DATA = [
  { day: "Lun", mensajes: 0, respondidos: 0, conversiones: 0 },
  { day: "Mar", mensajes: 0, respondidos: 0, conversiones: 0 },
  { day: "Mié", mensajes: 0, respondidos: 0, conversiones: 0 },
  { day: "Jue", mensajes: 0, respondidos: 0, conversiones: 0 },
  { day: "Vie", mensajes: 0, respondidos: 0, conversiones: 0 },
  { day: "Sáb", mensajes: 0, respondidos: 0, conversiones: 0 },
  { day: "Dom", mensajes: 0, respondidos: 0, conversiones: 0 },
];

export const INTEREST_DATA = [
  { name: "Conjuntos", value: 0, color: "#8C5E8A" },
  { name: "Pijamas",   value: 0, color: "#C4A0BF" },
  { name: "Bralettes", value: 0, color: "#D4B8D0" },
  { name: "Bodys",     value: 0, color: "#E8D5E5" },
  { name: "Otros",     value: 0, color: "#6D6880" },
];

const INIT_MESSAGES: Record<number, Msg[]> = {};

const INIT_CRM: Record<number, CRMEntry> = {};

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
