import React, { useState, useRef } from "react";
import { Send, Globe, Sparkles, RefreshCw, Cpu } from "lucide-react";
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
    <div className="sticky bottom-0 z-20 w-full border-t border-slate-800/80 bg-[#070e1b]/95 p-3 md:p-4 backdrop-blur-md text-slate-100">
      <div className="mx-auto max-w-4xl space-y-3">
        {/* Starter Prompt Chips */}
        {showStarterChips && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Common Diagnostic & Repair Questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((starter) => (
                <button
                  key={starter.id}
                  onClick={() => onSelectPrompt(starter.prompt)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#0f1a36]/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-500/60 hover:bg-cyan-950/40 hover:text-cyan-300 transition-all text-left shadow-sm"
                >
                  <span>{starter.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar Card */}
        <div className="relative rounded-2xl border border-slate-700 bg-[#0b1429] shadow-xl focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20">
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
            placeholder="Describe your laptop issue (e.g. 'Laptop lagging with 100% disk usage', 'CRITICAL_PROCESS_DIED BSOD')..."
            className="w-full resize-none border-0 bg-transparent px-4 py-3.5 text-xs md:text-sm text-slate-100 placeholder-slate-400 focus:outline-none max-h-48"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between border-t border-slate-800/80 px-3 py-2">
            <div className="flex items-center gap-1">
              {/* Web Search Grounding Toggle */}
              <button
                id="btn-toggle-web-search"
                onClick={onToggleWebSearch}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  settings.enableWebSearch
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
                title="Toggle Live Web Search Grounding for latest hardware driver & error databases"
              >
                <Globe className="h-4 w-4 text-cyan-400" />
                <span className="hidden sm:inline">
                  {settings.enableWebSearch ? "Search Grounding ON" : "Search Grounding OFF"}
                </span>
              </button>
            </div>

            {/* Diagnose Issue Send Button */}
            <button
              id="btn-send-message"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Diagnose Issue</span>
            </button>
          </div>
        </div>

        {/* Footer Disclaimer / Steps Note */}
        <p className="text-center text-[10px] md:text-[11px] text-slate-400">
          DARBS follows interactive <span className="font-semibold text-slate-300">DIAGNOSE → TEST → FIX → VERIFY → ESCALATE</span> steps. Seek certified repair for swelling batteries or liquid damage.
        </p>
      </div>
    </div>
  );
};
