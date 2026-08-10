import React from "react";
import { X, HeartPulse, Globe, Volume2, Check } from "lucide-react";
import { AppSettings, PersonaType } from "../types";
import { PERSONA_CONFIGS } from "../data/prompts";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-teal-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              Darbs Health AI Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Healthcare Persona Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Healthcare Assistant Mode
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(PERSONA_CONFIGS) as PersonaType[]).map((pKey) => {
                const persona = PERSONA_CONFIGS[pKey];
                const isSelected = settings.persona === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => onUpdateSettings({ persona: pKey })}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50/60 dark:bg-teal-950/30 dark:border-teal-500"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {persona.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${persona.color}`}
                        >
                          {persona.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {persona.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Response Precision / Temperature
              </label>
              <span className="text-xs font-mono font-semibold text-teal-600 dark:text-teal-400">
                {settings.temperature.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.temperature}
              onChange={(e) =>
                onUpdateSettings({ temperature: parseFloat(e.target.value) })
              }
              className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg dark:bg-slate-800 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0.1 (Strict & Precise Medical Info)</span>
              <span>1.0 (Conversational Wellness Advice)</span>
            </div>
          </div>

          {/* Voice Speaker Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-teal-600" />
              <span>Voice Narration Tone</span>
            </label>
            <select
              value={settings.voiceName}
              onChange={(e) =>
                onUpdateSettings({
                  voiceName: e.target.value as any,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="Kore">Kore (Clear, Professional Female)</option>
              <option value="Zephyr">Zephyr (Warm, Reassuring Male)</option>
              <option value="Puck">Puck (Friendly, Clear Male)</option>
              <option value="Fenrir">Fenrir (Calm, Authoritative Male)</option>
              <option value="Charon">Charon (Relaxed, Gentle Male)</option>
            </select>
          </div>

          {/* Web Search Grounding Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-500" />
                Live Medical Search Grounding
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Allow Darbs to cross-check latest clinical guidelines and health updates via Google Search.
              </p>
            </div>
            <button
              onClick={() =>
                onUpdateSettings({ enableWebSearch: !settings.enableWebSearch })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.enableWebSearch ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.enableWebSearch ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-teal-100 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-950">
          <button
            onClick={onClose}
            className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-teal-700 transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

