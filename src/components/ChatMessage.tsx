import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Laptop,
  User,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Terminal,
} from "lucide-react";
import { ChatMessage as ChatMessageType, AppSettings } from "../types";
import { PERSONA_CONFIGS } from "../data/prompts";

interface ChatMessageProps {
  message: ChatMessageType;
  settings: AppSettings;
  isSpeaking: boolean;
  onToggleMessageSpeech: (text: string, messageId: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({
  message,
  settings,
  isSpeaking,
  onToggleMessageSpeech,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const isUser = message.role === "user";
  const personaConfig = PERSONA_CONFIGS[settings.persona] || PERSONA_CONFIGS.hardware_laptop;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div
      className={`group flex w-full gap-3 p-4 md:px-6 transition-colors ${
        isUser
          ? "bg-[#0b1329]/70 text-slate-100"
          : "bg-[#070e1b] text-slate-200 border-y border-slate-800/40"
      }`}
    >
      {/* Avatar Icon */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 border border-slate-700 shadow-sm">
            <User className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            <Laptop className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Message Content Body */}
      <div className="flex-1 space-y-2 overflow-hidden">
        {/* Header with name, persona badge, timestamp, speech toggle, copy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs text-white">
              {isUser ? "You" : "DARBS"}
            </span>

            {!isUser && (
              <span className="inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                {personaConfig.badge || "Laptop Troubleshooter"}
              </span>
            )}

            <span className="text-[11px] text-slate-400">
              {message.timestamp}
            </span>
          </div>

          {!isUser && (
            <div className="flex items-center gap-1">
              {/* Speaking Read Button (Turn ON and OFF for this response) */}
              <button
                onClick={() => onToggleMessageSpeech(message.content, message.id)}
                className={`flex items-center gap-1 rounded-md p-1.5 text-xs transition-colors ${
                  isSpeaking
                    ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
                title={isSpeaking ? "Stop Speaking" : "Read Aloud (Text to Speech)"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-cyan-300 hidden sm:inline">
                      Stop
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                      Speak
                    </span>
                  </>
                )}
              </button>

              {/* Copy Message */}
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1 rounded-md p-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Copy Response"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Message Error Warning */}
        {message.isError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-xs text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{message.content}</span>
          </div>
        )}

        {/* Markdown Rendered Content */}
        {!message.isError && (
          <div className="prose prose-invert prose-sm max-w-none text-xs md:text-sm text-slate-200 leading-relaxed space-y-2">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => (
                  <ul className="mb-2 list-disc pl-4 space-y-1 text-slate-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 list-decimal pl-4 space-y-1 text-slate-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-snug">{children}</li>,
                h1: ({ children }) => (
                  <h1 className="text-base font-bold text-white mt-3 mb-1.5 pb-1 border-b border-slate-800">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold text-cyan-300 mt-2.5 mb-1 flex items-center gap-1.5">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-semibold text-slate-200 mt-2 mb-1">
                    {children}
                  </h3>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-cyan-500/60 bg-cyan-950/20 pl-3 py-1.5 rounded-r-lg text-xs italic text-cyan-200 my-2">
                    {children}
                  </blockquote>
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeContent = String(children).replace(/\n$/, "");

                  if (!inline) {
                    const codeIndex = Math.random();
                    return (
                      <div className="relative my-2.5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 font-mono text-xs shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                            <Terminal className="h-3.5 w-3.5" />
                            <span>{match ? match[1] : "Command / Script"}</span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(codeContent, codeIndex as any)}
                            className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                          >
                            {copiedCodeIndex === (codeIndex as any) ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto p-3 text-cyan-300 font-mono">
                          <code>{codeContent}</code>
                        </pre>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300 border border-slate-700"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Web Search Sources list if available */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Technical Documentation & Grounding Sources ({message.sources.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-cyan-300 hover:border-cyan-500 hover:bg-slate-700 transition-colors"
                >
                  <span className="truncate max-w-[200px]">{src.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
