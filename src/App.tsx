import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ChatMessageItem } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { SettingsModal } from "./components/SettingsModal";
import { ActiveTab, AppSettings, ChatMessage, ChatSession, PersonaType } from "./types";
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
    title: title || "New Health Consultation",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    persona: "general_health",
    messages: [
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Hello! I'm **Darbs Health**, your dedicated Healthcare AI Assistant. 🩺

I can help answer general health questions, clarify medical terms, offer wellness guidance, and help you prepare questions for your doctor.

**How can I assist your health today?**
- 🩺 **Symptom Clarification**: Share how you're feeling for general insights
- 📑 **Medical Test & Term Explanations**: Understand lab results or prescriptions
- 🥗 **Wellness & Nutrition Advice**: Heart-healthy diets, sleep tips, and stress management
- 🧠 **Mental Well-being Support**: Relaxation techniques and mindfulness guidance

> ⚠️ *Medical Disclaimer: Darbs Health is an AI assistant, not a medical doctor. Always consult a licensed healthcare professional for medical diagnosis, treatment, or emergencies.*`,
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
    return [createNewSession("Welcome to Darbs")];
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

  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    if (activeTab === "chat") {
      scrollToBottom();
    }
  }, [currentSession?.messages, activeTab, isLoading]);

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
    downloadAnchor.setAttribute("download", `darbs_chat_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handler: Send Message to Darbs
  const handleSendMessage = async (
    text: string,
    options?: { isImageGen?: boolean; imageUrl?: string }
  ) => {
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
      imageUrl: options?.imageUrl,
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

    // If options specify direct image generation mode
    if (options?.isImageGen) {
      try {
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, aspectRatio: "1:1" }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate image.");
        }

        const assistantMsg: ChatMessage = {
          id: `msg-assistant-${Date.now()}`,
          role: "assistant",
          content: data.caption || `Here is the image created by Darbs for: "${text}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          imageUrl: data.imageUrl,
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
          content: `Failed to generate image: ${err.message}`,
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
      return;
    }

    // Standard Chat call to /api/chat
    try {
      // Prepare history payloads
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
        throw new Error(data.error || "Failed to get response from Darbs.");
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

  // Handler: Enhance prompt via backend API
  const handleEnhancePrompt = async (text: string): Promise<string> => {
    const res = await fetch("/api/smart-tool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolType: "enhance_prompt", input: text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to enhance prompt");
    return data.result;
  };

  // Text to Speech playback handler
  const handlePlaySpeech = async (text: string, messageId: string) => {
    if (playingMessageId === messageId && audioRef.current) {
      audioRef.current.pause();
      setPlayingMessageId(null);
      return;
    }

    // Mark message audio loading
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === messageId ? { ...m, isAudioLoading: true } : m
              ),
            }
          : s
      )
    );

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName: settings.voiceName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "TTS failed.");
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingMessageId(null);
      };

      await audio.play();
      setPlayingMessageId(messageId);
    } catch (err: any) {
      console.error("Audio playback error:", err);
      alert(`Speech playback failed: ${err.message}`);
    } finally {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === messageId ? { ...m, isAudioLoading: false } : m
                ),
              }
            : s
        )
      );
    }
  };

  const handleStopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingMessageId(null);
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onExportSessions={handleExportSessions}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settings={settings}
          onSelectPersona={(persona: PersonaType) =>
            setSettings((prev) => ({ ...prev, persona }))
          }
        />

        {/* View switching */}
        {activeTab === "chat" && (
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Chat messages viewport */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {currentSession?.messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  settings={settings}
                  onPlaySpeech={handlePlaySpeech}
                  isAudioPlaying={playingMessageId === msg.id}
                  onStopSpeech={handleStopSpeech}
                />
              ))}

              {/* Loading Indicator when Darbs is thinking */}
              {isLoading && (
                <div className="flex gap-4 p-4 md:px-6 bg-white dark:bg-slate-900">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white animate-pulse">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Darbs Health AI
                    </span>
                    <span>is analyzing health request...</span>
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
              onEnhancePrompt={handleEnhancePrompt}
            />
          </main>
        )}
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
