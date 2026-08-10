import React from "react";
import { HeartPulse, Menu, Plus, Settings } from "lucide-react";

interface NavbarProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-teal-100 bg-white/90 px-4 backdrop-blur-md dark:border-teal-900/40 dark:bg-slate-900/90">
      {/* Left side: Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-teal-50 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          title="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/20">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-lg">
                Darbs AI
              </span>
              <span className="inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-400/20 dark:text-teal-300">
                Healthcare Assistant
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">
              Clean, Empathetic & Intelligent Health Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* New Chat Session */}
        <button
          id="btn-navbar-new-chat"
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Settings Button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="rounded-lg p-2 text-slate-600 hover:bg-teal-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title="Darbs AI Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};


