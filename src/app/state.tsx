import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import type { ReactNode, Dispatch } from "react";
import { io } from "socket.io-client";

// ── Types ──────────────────────────────────────────────────────────────────────

export type NavId          = "inbox" | "campaigns" | "reports" | "settings";
export type FilterId       = "todos" | "pendiente" | "en_atencion" | "terminada";
export type ChatStatus     = "pendiente" | "en_atencion" | "nuevo" | "terminada";
export type MsgType        = "incoming" | "outgoing" | "note";
export type CampaignStatus = "enviada" | "programada" | "borrador" | "activa";

export interface Msg {
  id: string | number; type: MsgType; text: string; time: string; rawTime?: string; read?: boolean; receipt?: string;
}
export interface Chat {
  id: string | number; name: string; phone: string; lastMessage: string;
  time: string; status: ChatStatus; unread: number; initials: string;
  birthday?: string;
  gender?: string;
  favoriteProduct?: string;
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
  id: string; name: string; number: string; online: boolean; qr?: string;
}

export interface AppState {
  activeNav:    NavId;
  activeChatId: string | number;
  activeDevice: string;
  filter:       FilterId;
  searchQuery:  string;
  messages:     Record<string | number, Msg[]>;
  crmData:      Record<string | number, CRMEntry>;
  savedIds:     Set<string | number>;
  noteMode:     boolean;
  inputText:    string;
  chatStatuses:  Record<string | number, ChatStatus>;
  contactNames:  Record<string | number, string>;
  contactTags:   Record<string | number, string[]>;
  sales:        Record<string | number, SaleRecord | null>;
  assignments:  Record<string | number, string>;
  agents:       Agent[];
  chats:        Chat[];
  devices:      Device[];
  deviceQrs:    Record<string, string>;
}

export type AppAction =
  | { type: "SET_NAV";      nav:    NavId             }
  | { type: "SET_CHAT";     id:     string | number   }
  | { type: "SET_DEVICE";   device: string            }
  | { type: "SET_FILTER";   filter: FilterId          }
  | { type: "SET_SEARCH";   query:  string            }
  | { type: "SEND_MSG";     chatId: string | number; msg: Msg  }
  | { type: "RECEIVE_MSG";  chatId: string | number; msg: Msg  }
  | { type: "SET_MESSAGES"; chatId: string | number; messages: Msg[] }
  | { type: "SET_CHATS";    chats:  Chat[]            }
  | { type: "SET_DEVICES";  devices: Device[]          }
  | { type: "UPDATE_DEVICE_QR"; deviceId: string; qr: string }
  | { type: "UPDATE_CRM";   chatId: string | number; data: Partial<CRMEntry> }
  | { type: "MARK_SAVED";   chatId: string | number   }
  | { type: "CLEAR_SAVED";  chatId: string | number   }
  | { type: "SET_NOTE_MODE"; val:   boolean           }
  | { type: "SET_INPUT";    val:    string            }
  | { type: "TOGGLE_TAG";   chatId: string | number; tag: string }
  | { type: "RECORD_SALE";  chatId: string | number; sale: SaleRecord }
  | { type: "CLEAR_SALE";   chatId: string | number   }
  | { type: "ASSIGN_AGENT"; chatId: string | number; agentName: string }
  | { type: "ADD_AGENT";        agent:   Agent      }
  | { type: "SET_AGENTS";       agents:  Agent[]    }
  | { type: "SET_CHAT_STATUS";  chatId: string | number; status: ChatStatus }
  | { type: "SET_CONTACT_NAME"; chatId: string | number; name: string }
  | { type: "UPDATE_MSG_RECEIPT"; chatId: string | number; messageId: string; receipt: string; isRead: boolean };

// ── Static/Proxied Data ────────────────────────────────────────────────────────

export const BOB_RATE = 6.96; // 1 USD = 6.96 BOB

export const rawDevices: Device[] = [];
export const rawChats: Chat[] = [];

export const DEVICES = new Proxy(rawDevices, {
  get(target, prop, receiver) {
    if (prop === "0") {
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

export const CHATS = new Proxy(rawChats, {
  get(target, prop, receiver) {
    if (prop === "find") {
      return (callback: (el: Chat) => boolean) => {
        const found = target.find(callback);
        if (found !== undefined) return found;
        return {
          id: "",
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

export const ALL_TAGS = [
  "Cliente VIP", "Seguimiento", "Pedido activo", "Cotización enviada", "Post-venta",
];

export const CAMPAIGNS: Campaign[] = [];

export const INITIAL_AGENTS: Agent[] = [];

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

const INIT_MESSAGES: Record<string | number, Msg[]> = {};
const INIT_CRM: Record<string | number, CRMEntry> = {};

// ── Reducer ────────────────────────────────────────────────────────────────────

const INIT_STATE: AppState = {
  activeNav:    "inbox",
  activeChatId: "",
  activeDevice: "",
  filter:       "todos",
  searchQuery:  "",
  messages:     INIT_MESSAGES,
  crmData:      INIT_CRM,
  savedIds:     new Set<string | number>(),
  noteMode:     false,
  inputText:    "",
  chatStatuses:  {},
  contactNames:  {},
  contactTags:   { 1: ["Cliente VIP"], 3: ["Pedido activo"], 5: ["Seguimiento"] },
  sales:        {},
  assignments:  {},
  agents:       INITIAL_AGENTS,
  chats:        [],
  devices:      [],
  deviceQrs:    {},
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
    case "SET_CHATS":
      rawChats.length = 0;
      rawChats.push(...action.chats);
      return { ...state, chats: action.chats };
    case "SET_DEVICES": {
      rawDevices.length = 0;
      rawDevices.push(...action.devices.map(d => ({ ...d, online: d.online })));
      const nextActive = state.activeDevice && action.devices.some(d => d.id === state.activeDevice)
        ? state.activeDevice
        : (action.devices[0]?.id || "");
      return { ...state, devices: action.devices, activeDevice: nextActive };
    }
    case "UPDATE_DEVICE_QR":
      return {
        ...state,
        deviceQrs: {
          ...state.deviceQrs,
          [action.deviceId]: action.qr
        }
      };
    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.chatId]: action.messages,
        },
      };
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
          ? { ...state.chatStatuses, [action.chatId]: "pendiente" as ChatStatus }
          : state.chatStatuses,
      };
    }
    case "RECEIVE_MSG": {
      const currentMsgs = state.messages[action.chatId] ?? [];
      if (currentMsgs.some(m => m.id === action.msg.id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.chatId]: [...currentMsgs, action.msg]
        }
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
    case "SET_AGENTS":
      return { ...state, agents: action.agents };
    case "SET_CHAT_STATUS":
      return { ...state, chatStatuses: { ...state.chatStatuses, [action.chatId]: action.status } };
    case "UPDATE_MSG_RECEIPT": {
      const currentMsgs = state.messages[action.chatId] ?? [];
      const updated = currentMsgs.map(m => {
        if (m.id === action.messageId) {
          return { ...m, receipt: action.receipt, read: action.isRead };
        }
        return m;
      });
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.chatId]: updated
        }
      };
    }
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

  const activeDeviceRef = useRef(state.activeDevice);
  useEffect(() => {
    activeDeviceRef.current = state.activeDevice;
  }, [state.activeDevice]);

  // Sync with API and sockets
  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    if (!token) return;

    // Load initial devices
    fetch("http://localhost:3000/whatsapp/devices", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(devices => {
        if (Array.isArray(devices)) {
          const mappedDevices = devices.map((d: any) => ({
            id: d.id,
            name: d.name,
            number: d.phoneNumber,
            online: d.isOnline
          }));
          dispatch({ type: "SET_DEVICES", devices: mappedDevices });
        }
      })
      .catch(err => console.error("Error fetching devices:", err));

    // Load initial agents (users)
    fetch("http://localhost:3000/auth/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(users => {
        if (Array.isArray(users)) {
          const mappedAgents = users.map((u: any) => ({
            id: u.id,
            name: u.name,
            initials: u.name.split(" ").filter((w: string) => w.length > 0).slice(0, 2).map((w: string) => w[0].toUpperCase()).join(""),
            role: u.role,
            status: u.status,
            chats: 0
          }));
          dispatch({ type: "SET_AGENTS", agents: mappedAgents });
        }
      })
      .catch(err => console.error("Error loading team members:", err));

    const reloadDevices = () => {
      fetch("http://localhost:3000/whatsapp/devices", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("HTTP error " + res.status);
          return res.json();
        })
        .then(devices => {
          if (Array.isArray(devices)) {
            const mappedDevices = devices.map((d: any) => ({
              id: d.id,
              name: d.name,
              number: d.phoneNumber,
              online: d.isOnline
            }));
            dispatch({ type: "SET_DEVICES", devices: mappedDevices });
          }
        })
        .catch(err => console.error("Error fetching devices:", err));
    };

    const reloadChats = () => {
      const url = activeDeviceRef.current
        ? `http://localhost:3000/chats?deviceId=${activeDeviceRef.current}`
        : "http://localhost:3000/chats";

      fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("HTTP error " + res.status);
          return res.json();
        })
        .then(chats => {
          if (Array.isArray(chats)) {
            dispatch({ type: "SET_CHATS", chats });
          }
        })
        .catch(err => console.error("Error fetching chats:", err));
    };

    // Connect socket
    const socket = io("http://localhost:3000", {
      auth: { token }
    });

    socket.on("connect", () => {
      console.log("WebSocket connected to backend successfully");
    });

    socket.on("device_connected", ({ deviceId }) => {
      console.log("Device connected event received for:", deviceId);
      reloadDevices();
      reloadChats();
    });

    socket.on("new_incoming_message", (message) => {
      dispatch({
        type: "RECEIVE_MSG",
        chatId: message.customer.id,
        msg: {
          id: message.id,
          type: "incoming",
          text: message.content,
          time: new Date(message.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
          rawTime: message.timestamp,
          read: message.isRead,
          receipt: message.receipt || 'sent'
        }
      });
      reloadChats();
    });

    socket.on("new_message", (message) => {
      dispatch({
        type: "RECEIVE_MSG",
        chatId: message.customer.id,
        msg: {
          id: message.id,
          type: message.type,
          text: message.content,
          time: new Date(message.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
          rawTime: message.timestamp,
          read: message.isRead,
          receipt: message.receipt || 'sent'
        }
      });
      reloadChats();
    });

    socket.on("message_receipt", ({ chatId, messageId, receipt, isRead }) => {
      dispatch({
        type: "UPDATE_MSG_RECEIPT",
        chatId,
        messageId,
        receipt,
        isRead
      });
    });

    socket.on("qr_update", ({ deviceId, qr }) => {
      dispatch({ type: "UPDATE_DEVICE_QR", deviceId, qr });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch chats when activeDevice changes
  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    if (!token) return;

    const url = state.activeDevice
      ? `http://localhost:3000/chats?deviceId=${state.activeDevice}`
      : "http://localhost:3000/chats";

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(chats => {
        if (Array.isArray(chats)) {
          dispatch({ type: "SET_CHATS", chats });
          if (chats.length > 0) {
            dispatch({ type: "SET_CHAT", id: chats[0].id });
          } else {
            dispatch({ type: "SET_CHAT", id: "" });
          }
        }
      })
      .catch(err => console.error("Error fetching chats for device:", err));
  }, [state.activeDevice]);

  // Fetch messages when activeChatId changes
  useEffect(() => {
    if (!state.activeChatId) return;
    const token = localStorage.getItem("crm_token");
    if (!token) return;

    // Load customer data into CRM details if not already loaded
    const currentChat = state.chats.find(c => c.id === state.activeChatId);
    if (currentChat) {
      dispatch({
        type: "UPDATE_CRM",
        chatId: state.activeChatId,
        data: {
          phone: currentChat.phone,
          birthday: currentChat.birthday ? currentChat.birthday.substring(0, 10) : "",
          gender: currentChat.gender || "",
          interest: currentChat.favoriteProduct || ""
        }
      });
    }

    const url = state.activeDevice
      ? `http://localhost:3000/chats/${state.activeChatId}/messages?deviceId=${state.activeDevice}`
      : `http://localhost:3000/chats/${state.activeChatId}/messages`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(messages => {
        if (Array.isArray(messages)) {
          const formatted = messages.map((m: any) => ({
            id: m.id,
            type: m.type,
            text: m.content,
            time: new Date(m.timestamp).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
            rawTime: m.timestamp,
            read: m.isRead,
            receipt: m.receipt || 'sent'
          }));
          dispatch({ type: "SET_MESSAGES", chatId: state.activeChatId, messages: formatted });
        }
      })
      .catch(err => console.error("Error fetching messages for chat:", err));
  }, [state.activeChatId, state.activeDevice, state.chats]);

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
