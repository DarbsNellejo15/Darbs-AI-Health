import React, { useState } from "react";
import {
  HeartPulse,
  Plus,
  MessageSquare,
  Trash2,
  Search,
  X,
  Globe,
  Settings,
  FileJson,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { ActiveTab, AppSettings, ChatSession } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  onExportSessions: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  activeTab,
  setActiveTab,
  settings,
  onOpenSettings,
  onExportSessions,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay background */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-teal-100 bg-slate-50 transition-transform duration-300 dark:border-teal-900/30 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-teal-100 px-4 dark:border-teal-900/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              Darbs Health Center
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Start New Consultation */}
        <div className="p-3">
          <button
            id="btn-sidebar-new-chat"
            onClick={() => {
              onNewChat();
              setActiveTab("chat");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 px-4 font-semibold text-white shadow-md shadow-teal-500/20 hover:bg-teal-700 transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            New Health Consultation
          </button>
        </div>

        {/* Search Session input */}
        <div className="px-3 pt-1 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search health topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-teal-100 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Consultation History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Consultations ({filteredSessions.length})
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
              No consultations found
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 transition-all text-xs cursor-pointer ${
                  session.id === currentSessionId && activeTab === "chat"
                    ? "bg-white text-teal-700 shadow-sm border border-teal-200 dark:border-teal-800 dark:bg-slate-800 dark:text-teal-300 font-semibold"
                    : "text-slate-600 hover:bg-teal-50/60 dark:text-slate-400 dark:hover:bg-slate-800/50"
                }`}
                onClick={() => {
                  onSelectSession(session.id);
                  setActiveTab("chat");
                }}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                  <span className="truncate">{session.title}</span>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    title="Delete Consultation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info & settings */}
        <div className="border-t border-teal-100 p-3 space-y-2 dark:border-teal-900/30">
          <div className="flex items-center justify-between rounded-lg bg-teal-50/70 p-2 text-xs text-teal-800 dark:bg-slate-800/80 dark:text-teal-200">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Medical Search Grounding:</span>
            </div>
            <span
              className={`font-semibold ${
                settings.enableWebSearch ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {settings.enableWebSearch ? "On" : "Off"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportSessions}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FileJson className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              onClick={onOpenSettings}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={onClearAllSessions}
              className="flex w-full items-center justify-center gap-1.5 text-xs text-red-500 hover:text-red-600 py-1"
            >
              <Trash2 className="h-3 w-3" />
              Clear All Consultations
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

