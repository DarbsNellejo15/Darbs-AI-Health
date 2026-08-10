import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Globe,
  Wand2,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { AppSettings, PersonaType } from "../types";
import { STARTER_PROMPTS } from "../data/prompts";

interface ChatInputProps {
  onSendMessage: (text: string, options?: { isImageGen?: boolean }) => void;
  isLoading: boolean;
  settings: AppSettings;
  onToggleWebSearch: () => void;
  onSelectPrompt: (promptText: string) => void;
  showStarterChips: boolean;
  onEnhancePrompt: (text: string) => Promise<string>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  settings,
  onToggleWebSearch,
  onSelectPrompt,
  showStarterChips,
  onEnhancePrompt,
}) => {
  const [input, setInput] = useState("");
  const [isImageMode, setIsImageMode] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech Recognition setup
  const [recognition, setRecognition] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = "en-US";

        reco.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setInput(transcript);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        setRecognition(reco);
      }
    }
  }, []);

  const toggleMic = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim(), { isImageGen: isImageMode });
    setInput("");
    setIsImageMode(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleEnhance = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const polished = await onEnhancePrompt(input.trim());
      setInput(polished);
    } catch (err) {
      console.error("Failed to enhance prompt:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-slate-200 bg-white/90 p-3 md:p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto max-w-4xl space-y-3">
        {/* Starter Prompt Chips */}
        {showStarterChips && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Healthcare Prompt Starters:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((starter) => (
                <button
                  key={starter.id}
                  onClick={() => onSelectPrompt(starter.prompt)}
                  className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/60 px-3 py-1.5 text-xs font-medium text-teal-800 hover:border-teal-400 hover:bg-teal-100/70 dark:border-teal-900/60 dark:bg-slate-800 dark:text-teal-200 dark:hover:border-teal-700 transition-all text-left"
                >
                  <span>{starter.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar Card */}
        <div className="relative rounded-2xl border border-teal-200 bg-white shadow-lg focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950">
          {/* Image Mode Banner */}
          {isImageMode && (
            <div className="flex items-center justify-between rounded-t-2xl bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Medical Illustration & Diagram Visualizer Mode</span>
              </div>
              <button
                onClick={() => setIsImageMode(false)}
                className="text-xs hover:underline text-amber-600"
              >
                Switch to Text
              </button>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="chat-textarea-input"
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isImageMode
                ? "Describe the medical diagram or healthcare illustration you'd like to create..."
                : "Ask Darbs Health about symptoms, medical terminology, general wellness, or diet..."
            }
            className="w-full resize-none border-0 bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500 max-h-48"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 dark:border-slate-800/80">
            <div className="flex items-center gap-1">
              {/* Web Search Toggle */}
              <button
                id="btn-toggle-web-search"
                onClick={onToggleWebSearch}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  settings.enableWebSearch
                    ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
                title="Toggle Google Search Grounding for live medical research data"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {settings.enableWebSearch ? "Search On" : "Search Off"}
                </span>
              </button>

              {/* Image Mode Toggle */}
              <button
                id="btn-toggle-image-mode"
                onClick={() => setIsImageMode(!isImageMode)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isImageMode
                    ? "bg-amber-500/10 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 font-semibold"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
                title="Toggle Medical Diagram Mode"
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Diagrams</span>
              </button>

              {/* Polish / Enhance Prompt */}
              <button
                onClick={handleEnhance}
                disabled={!input.trim() || isEnhancing}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 disabled:opacity-40 dark:text-purple-400 dark:hover:bg-purple-950/30 transition-colors"
                title="Refine question for clearer health answers"
              >
                {isEnhancing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Refine</span>
              </button>

              {/* Voice Dictation Mic */}
              <button
                onClick={toggleMic}
                className={`rounded-lg p-1.5 transition-colors ${
                  isListening
                    ? "bg-red-500/10 text-red-600 animate-pulse"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
                title={isListening ? "Stop Listening" : "Dictate symptom or question"}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Send Button */}
            <button
              id="btn-send-message"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-teal-500/20 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Ask Health AI</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
          Darbs Health is an AI assistant, not a doctor. Consult a medical professional for advice or emergencies.
        </p>
      </div>
    </div>
  );
};
