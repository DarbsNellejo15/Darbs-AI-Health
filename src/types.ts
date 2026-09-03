export type PersonaType =
  | "hardware_laptop"
  | "windows_bsod"
  | "performance_storage"
  | "network_wifi"
  | "driver_software";

export interface WebSource {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imageUrl?: string;
  sources?: WebSource[];
  isAudioLoading?: boolean;
  audioBase64?: string;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  persona: PersonaType;
}

export interface AppSettings {
  persona: PersonaType;
  temperature: number;
  enableWebSearch: boolean;
  speechEnabled: boolean;
  voiceName: "Kore" | "Puck" | "Fenrir" | "Zephyr" | "Charon";
  speechRate: number;
  theme: "dark" | "light";
}

export type ActiveTab = "chat";

