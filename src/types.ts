export type PersonaType =
  | "general_health"
  | "symptom_guide"
  | "medical_explainer"
  | "wellness_coach"
  | "mental_health";

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
  voiceName: "Kore" | "Puck" | "Fenrir" | "Zephyr" | "Charon";
  autoReadResponses: boolean;
}

export type ActiveTab = "chat";
