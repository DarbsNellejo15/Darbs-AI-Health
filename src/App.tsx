import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ChatMessageItem } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SettingsModal } from "./components/SettingsModal";
import { AppSettings, ChatMessage, ChatSession } from "./types";
import { HeartPulse } from "lucide-react";

const INITIAL_SETTINGS: AppSettings = {
  persona: "general_health",
  temperature: 0.5,
  enableWebSearch: false,
  voiceName: "Kore",
  autoReadResponses: false,
};

const createNewSession = (title?: string): ChatSession => {
  const id = `session-${Date.now()}`;
  return {
    id,
    title: title || "New Health Chat",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    persona: "general_health",
    messages: [
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Hello! I'm **Darbs AI**, your dedicated Healthcare AI Assistant. 🩺

I can help answer general health questions, clarify medical terms, offer wellness guidance, and help you prepare questions for your doctor.

**How can I assist your health today?**
- 🩺 **Symptom Clarification**: Share how you're feeling for general insights
- 📑 **Medical Test & Term Explanations**: Understand lab results or prescriptions
- 🥗 **Wellness & Nutrition Advice**: Heart-healthy diets, sleep tips, and stress management
- 🧠 **Mental Well-being Support**: Relaxation techniques and mindfulness guidance

> ⚠️ *Medical Disclaimer: Darbs AI is an AI assistant, not a medical doctor. Always consult a licensed healthcare professional for medical diagnosis, treatment, or emergencies.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ],
  };
};

export default function App() {
  // Load initial state from localStorage if available
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("darbs_sessions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved sessions", e);
      }
    }
    return [createNewSession("Welcome to Darbs AI")];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || "session-1";
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("darbs_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    return INITIAL_SETTINGS;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("darbs_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("darbs_settings", JSON.stringify(settings));
  }, [settings]);

  // Current session finder
  const currentSession =
    sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  // Handler: Start New Chat Session
  const handleNewChat = () => {
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // Handler: Select Chat Session
  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false);
  };

  // Handler: Delete Session
  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length <= 1) return;
    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(filtered[0].id);
    }
  };

  // Handler: Clear All Sessions
  const handleClearAllSessions = () => {
    if (window.confirm("Are you sure you want to clear all conversation history?")) {
      const fresh = createNewSession("Fresh Session");
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    }
  };

  // Handler: Export Sessions
  const handleExportSessions = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `darbs_ai_chat_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handler: Send Message to Darbs AI
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp,
    };

    // Update session title if first user message
    let updatedTitle = currentSession.title;
    if (currentSession.messages.length <= 1) {
      updatedTitle = text.length > 30 ? `${text.slice(0, 30)}...` : text;
    }

    const updatedMessages = [...currentSession.messages, userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: updatedTitle,
              messages: updatedMessages,
              updatedAt: timestamp,
            }
          : s
      )
    );

    setIsLoading(true);

    // Standard Chat call to /api/chat
    try {
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          persona: settings.persona,
          temperature: settings.temperature,
          enableWebSearch: settings.enableWebSearch,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from Darbs AI.");
      }

      const assistantMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: data.sources,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        role: "assistant",
        content: `Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, errorMsg] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportSessions={handleExportSessions}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* View switching */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Chat messages viewport */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {currentSession?.messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                settings={settings}
              />
            ))}

            {/* Loading Indicator when Darbs AI is thinking */}
            {isLoading && (
              <div className="flex gap-4 p-4 md:px-6 bg-white dark:bg-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white animate-pulse">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Darbs AI
                  </span>
                  <span>is evaluating health question...</span>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            settings={settings}
            onToggleWebSearch={() =>
              setSettings((prev) => ({
                ...prev,
                enableWebSearch: !prev.enableWebSearch,
              }))
            }
            onSelectPrompt={(p) => handleSendMessage(p)}
            showStarterChips={currentSession?.messages.length <= 1}
          />
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newPartial) =>
          setSettings((prev) => ({ ...prev, ...newPartial }))
        }
      />
    </div>
  );
}

