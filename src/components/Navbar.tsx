import React from "react";
import {
  HeartPulse,
  Menu,
  Plus,
  Settings,
  Stethoscope,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { ActiveTab, AppSettings, PersonaType } from "../types";
import { PERSONA_CONFIGS } from "../data/prompts";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  onSelectPersona: (persona: PersonaType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
  settings,
  onSelectPersona,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-teal-100 bg-white/90 px-4 backdrop-blur-md dark:border-teal-900/40 dark:bg-slate-900/90">
      {/* Left side: Healthcare Brand & Sidebar Toggle */}
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
                Darbs Health
              </span>
              <span className="inline-flex items-center rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-400/20 dark:text-teal-300">
                Healthcare AI
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 dark:text-slate-400 sm:block">
              Clean & Empathetic AI Health Companion
            </p>
          </div>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Healthcare Persona Selector */}
        <div className="hidden sm:flex items-center gap-1">
          <select
            id="select-navbar-persona"
            value={settings.persona}
            onChange={(e) => onSelectPersona(e.target.value as PersonaType)}
            className="rounded-lg border border-teal-200 bg-teal-50/50 px-2.5 py-1.5 text-xs font-medium text-teal-800 dark:border-teal-800 dark:bg-slate-800 dark:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="general_health">General Health Guide</option>
            <option value="symptom_guide">Symptom Navigator</option>
            <option value="medical_explainer">Medical Terms Explainer</option>
            <option value="wellness_coach">Wellness & Nutrition Coach</option>
            <option value="mental_health">Mental Well-being Supporter</option>
          </select>
        </div>

        {/* New Chat Session */}
        <button
          id="btn-navbar-new-chat"
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Consultation</span>
        </button>

        {/* Settings Button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="rounded-lg p-2 text-slate-600 hover:bg-teal-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title="Healthcare Settings & Assistant Profile"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

