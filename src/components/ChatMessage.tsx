import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  HeartPulse,
  User,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { ChatMessage as ChatMessageType, AppSettings } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  settings: AppSettings;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({
  message,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const isUser = message.role === "user";

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex w-full gap-4 p-4 md:px-6 transition-colors ${
        isUser
          ? "bg-slate-50/50 dark:bg-slate-900/30"
          : "bg-white dark:bg-slate-900"
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 shadow-sm">
            <User className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/20">
            <HeartPulse className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Message Content Area */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-900 dark:text-white">
              {isUser ? "You" : "Darbs AI"}
            </span>
            <span className="text-[11px] text-slate-400">
              {message.timestamp}
            </span>
          </div>

          {!isUser && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Copy Message */}
              <button
                onClick={handleCopyMessage}
                className="flex items-center gap-1 rounded-md p-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                title="Copy Response"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Message Error Warning */}
        {message.isError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{message.content}</span>
          </div>
        )}

        {/* Message Text formatted with Markdown */}
        {!message.isError && (
          <div className="markdown-content text-sm leading-relaxed text-slate-800 dark:text-slate-200 space-y-2">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");

                  if (!inline && match) {
                    return (
                      <div className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 text-slate-100 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-400 font-mono">
                          <span>{match[1]}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(codeString);
                              setCopiedCodeIndex(1);
                              setTimeout(() => setCopiedCodeIndex(null), 2000);
                            }}
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            {copiedCodeIndex === 1 ? "Copied!" : "Copy code"}
                          </button>
                        </div>
                        <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed">
                          <code>{children}</code>
                        </pre>
                      </div>
                    );
                  }

                  return (
                    <code
                      className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
                },
                li({ children }) {
                  return <li className="mb-0.5">{children}</li>;
                },
                h1({ children }) {
                  return <h1 className="text-lg font-bold my-3 text-slate-900 dark:text-white">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="text-base font-bold my-2 text-slate-900 dark:text-white">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="text-sm font-semibold my-2 text-slate-900 dark:text-white">{children}</h3>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Web Search Sources list if available */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-teal-800 dark:text-teal-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Medical Sources & Grounding Links ({message.sources.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-xs text-teal-700 hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900 dark:text-teal-300 dark:hover:border-slate-700 transition-colors"
                >
                  <span className="truncate max-w-[180px]">{src.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

