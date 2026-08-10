import React, { useState, useRef } from "react";
import { Send, Globe, Sparkles, RefreshCw } from "lucide-react";
import { AppSettings } from "../types";
import { STARTER_PROMPTS } from "../data/prompts";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  settings: AppSettings;
  onToggleWebSearch: () => void;
  onSelectPrompt: (promptText: string) => void;
  showStarterChips: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  settings,
  onToggleWebSearch,
  onSelectPrompt,
  showStarterChips,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-teal-100 bg-white/95 p-3 md:p-4 backdrop-blur-md dark:border-teal-900/30 dark:bg-slate-900/95">
      <div className="mx-auto max-w-4xl space-y-3">
        {/* Starter Prompt Chips */}
        {showStarterChips && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Healthcare Questions to Ask Darbs AI:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((starter) => (
                <button
                  key={starter.id}
                  onClick={() => onSelectPrompt(starter.prompt)}
                  className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-medium text-teal-900 hover:border-teal-400 hover:bg-teal-100 dark:border-teal-900/60 dark:bg-slate-800 dark:text-teal-200 dark:hover:border-teal-700 transition-all text-left"
                >
                  <span>{starter.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar Card */}
        <div className="relative rounded-2xl border border-teal-200 bg-white shadow-lg focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-950">
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
            placeholder="Ask Darbs AI about symptoms, medical terms, general wellness, or health topics..."
            className="w-full resize-none border-0 bg-transparent px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500 max-h-48"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between border-t border-teal-100 px-3 py-2 dark:border-slate-800/80">
            <div className="flex items-center gap-1">
              {/* Web Search Grounding Toggle */}
              <button
                id="btn-toggle-web-search"
                onClick={onToggleWebSearch}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  settings.enableWebSearch
                    ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold"
                    : "text-slate-500 hover:bg-teal-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
                title="Toggle Live Web Search Grounding for healthcare research"
              >
                <Globe className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline">
                  {settings.enableWebSearch ? "Live Search On" : "Live Search Off"}
                </span>
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
              <span>Ask Darbs AI</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400">
          Darbs AI provides healthcare information only. Not a licensed medical doctor. Consult a doctor for medical advice.
        </p>
      </div>
    </div>
  );
};
