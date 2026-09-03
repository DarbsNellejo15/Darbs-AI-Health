import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { ChatMessageItem } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { DeleteHistoryModal } from "./components/DeleteHistoryModal";
import { ExitModal } from "./components/ExitModal";
import { AppSettings, ChatMessage, ChatSession } from "./types";
import { speechController } from "./utils/speech";
import { Laptop, RotateCcw } from "lucide-react";

const INITIAL_SETTINGS: AppSettings = {
  persona: "hardware_laptop",
  temperature: 0.7,
  enableWebSearch: false,
  speechEnabled: true,
  voiceName: "Kore",
  speechRate: 1.0,
  theme: "dark",
};

const createNewSession = (title?: string): ChatSession => {
  const id = `session-${Date.now()}`;
  return {
    id,
    title: title || "New Diagnostic Chat",
    createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    persona: "hardware_laptop",
    messages: [
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Hello! I'm **DARBS** (*Diagnostic Assistant for Repair, Bugs & Support*), your reliable AI Laptop Troubleshooting and Repair Assistant. 💻

I can help diagnose, troubleshoot, maintain, and repair problems with your PC or laptop — including slowness, crashes, Windows errors, Wi-Fi issues, driver problems, and hardware diagnostics.

**How can I assist your PC today?**
- ⚡ **Performance & Storage**: Fix slow laptop, 100% CPU/RAM/Disk, and free up drive space
- 🚨 **BSOD & Windows Errors**: Decode error codes, fix crashes, run safe SFC/DISM repairs
- 🌐 **Network & Connectivity**: Solve Wi-Fi dropping, DNS issues, and adapter failures
- 🛠️ **Hardware & Thermal Diagnostics**: Address overheating, battery health, fan noise, and peripherals`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ],
  };
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("darbs_diagnostic_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse saved sessions", e);
      }
    }
    return [createNewSession("Welcome to DARBS")];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || "session-1";
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("darbs_app_settings");
    if (saved) {
      try {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return INITIAL_SETTINGS;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isExitedView, setIsExitedView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    localStorage.setItem("darbs_diagnostic_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem("darbs_app_settings", JSON.stringify(settings));
  }, [settings]);

  // Subscribe to speech controller state
  useEffect(() => {
    const unsubscribe = speechController.subscribe((speaking, id) => {
      setSpeakingMessageId(speaking ? id : null);
    });
    return () => {
      unsubscribe();
      speechController.stop();
    };
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  // Handler: Start New Diagnostic Chat Session
  const handleNewChat = () => {
    speechController.stop();
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsExitedView(false);
  };

  // Handler: Select Session
  const handleSelectSession = (sessionId: string) => {
    speechController.stop();
    setCurrentSessionId(sessionId);
    setIsExitedView(false);
  };

  // Handler: Delete single session
  const handleDeleteSession = (sessionId: string) => {
    speechController.stop();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = createNewSession();
        setCurrentSessionId(fresh.id);
        return [fresh];
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Handler: Clear all sessions / Delete history
  const handleClearAllSessions = () => {
    speechController.stop();
    const freshSession = createNewSession("New Diagnostic Session");
    setSessions([freshSession]);
    setCurrentSessionId(freshSession.id);
    localStorage.removeItem("darbs_diagnostic_sessions");
    setIsDeleteModalOpen(false);
  };

  // Handler: Toggle Global Speech Setting
  const handleToggleGlobalSpeech = () => {
    if (settings.speechEnabled) {
      speechController.stop();
      setSettings((prev) => ({ ...prev, speechEnabled: false }));
    } else {
      setSettings((prev) => ({ ...prev, speechEnabled: true }));
    }
  };

  // Handler: Toggle Speech for specific message
  const handleToggleMessageSpeech = (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      speechController.stop();
    } else {
      speechController.speak(
        text,
        messageId,
        settings.speechRate || 1.0,
        settings.voiceName || "Kore"
      );
    }
  };

  // Handler: Send Message to DARBS
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    speechController.stop();

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
    let sessionTitle = currentSession.title;
    if (
      currentSession.messages.length === 1 &&
      (currentSession.title.startsWith("New Diagnostic") ||
        currentSession.title.startsWith("Welcome to DARBS"))
    ) {
      sessionTitle = text.slice(0, 32) + (text.length > 32 ? "..." : "");
    }

    const updatedMessages = [...currentSession.messages, userMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: timestamp,
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsLoading(true);

    // Call /api/chat
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
        throw new Error(data.error || "Failed to get response from DARBS.");
      }

      const assistantMsgId = `msg-assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sources: data.sources || [],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                updatedAt: assistantMsg.timestamp,
                messages: [...s.messages, assistantMsg],
              }
            : s
        )
      );

      // If speech is globally enabled, automatically read the new response
      if (settings.speechEnabled) {
        speechController.speak(
          data.reply,
          assistantMsgId,
          settings.speechRate || 1.0,
          settings.voiceName || "Kore"
        );
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMsg: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        role: "assistant",
        content: `Diagnostic Error: ${error.message || "Failed to communicate with DARBS engine. Please verify your connection."}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
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
    <div className="flex h-screen w-full overflow-hidden bg-[#070e1b] text-slate-100 font-sans">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={() => setIsDeleteModalOpen(true)}
        settings={settings}
        onOpenExitModal={() => setIsExitModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#070e1b]">
        <Navbar
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
          onOpenExitModal={() => setIsExitModalOpen(true)}
          settings={settings}
          onToggleSpeech={handleToggleGlobalSpeech}
        />

        {/* Exited Workspace Screen or Active Chat View */}
        {isExitedView ? (
          <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-4 rounded-3xl border border-slate-800 bg-[#0b1429] p-8 shadow-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                <Laptop className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-white">
                DARBS Session Closed
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Diagnostic Assistant for Repair, Bugs and Support has been safely closed. Your diagnostic history is preserved locally.
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => setIsExitedView(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 px-4 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-md"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Resume Diagnostic Session</span>
                </button>
                <button
                  onClick={handleNewChat}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <span>Start Fresh Diagnostic Chat</span>
                </button>
              </div>
            </div>
          </main>
        ) : (
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Chat messages viewport */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
              {currentSession?.messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  settings={settings}
                  isSpeaking={speakingMessageId === msg.id}
                  onToggleMessageSpeech={handleToggleMessageSpeech}
                />
              ))}

              {/* Loading Indicator when DARBS is analyzing */}
              {isLoading && (
                <div className="flex gap-4 p-4 md:px-6 bg-[#070e1b]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white animate-pulse shadow-md shadow-cyan-500/20">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-white">DARBS</span>
                    <span className="text-cyan-300">is analyzing hardware and diagnostic logs...</span>
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" />
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
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
        )}
      </div>

      {/* Delete History Confirmation Modal */}
      <DeleteHistoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleClearAllSessions}
      />

      {/* Exit Dashboard Modal */}
      <ExitModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirmExit={() => {
          speechController.stop();
          setIsExitModalOpen(false);
          setIsExitedView(true);
        }}
        onResetSession={() => {
          handleClearAllSessions();
          setIsExitModalOpen(false);
          setIsExitedView(false);
        }}
      />
    </div>
  );
}
