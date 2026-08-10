import { PersonaType } from "../types";

export interface StarterPrompt {
  id: string;
  title: string;
  category: "Symptoms" | "Medical Terms" | "Wellness" | "Mental Health";
  prompt: string;
  iconName: string;
}

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: "1",
    title: "Explain medical test results",
    category: "Medical Terms",
    prompt: "Can you explain what a Comprehensive Metabolic Panel (CMP) measures in simple, plain terms?",
    iconName: "FileText",
  },
  {
    id: "2",
    title: "Symptom checker guide",
    category: "Symptoms",
    prompt: "I have a mild headache, slight throat tickle, and feeling fatigued. What are potential general causes and what questions should I prepare for my doctor?",
    iconName: "Stethoscope",
  },
  {
    id: "3",
    title: "Heart-healthy nutrition tips",
    category: "Wellness",
    prompt: "Provide a simple, balanced 3-day meal plan tailored for cardiovascular and heart health with low sodium options.",
    iconName: "HeartPulse",
  },
  {
    id: "4",
    title: "Stress reduction & sleep hygiene",
    category: "Mental Health",
    prompt: "What are 4 science-backed techniques for lowering stress and improving deep sleep quality tonight?",
    iconName: "Brain",
  },
  {
    id: "5",
    title: "Questions to ask my doctor",
    category: "Symptoms",
    prompt: "I am having an annual physical examination next week. What key preventive health questions should I ask my doctor?",
    iconName: "HelpCircle",
  },
];

export const PERSONA_CONFIGS: Record<
  PersonaType,
  { name: string; description: string; badge: string; color: string }
> = {
  general_health: {
    name: "General Health Guide",
    description: "Balanced, empathetic, and clear general healthcare information.",
    badge: "General Health",
    color: "bg-teal-500/10 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  },
  symptom_guide: {
    name: "Symptom Navigator",
    description: "Helps structure symptom observations and red-flag warning signs.",
    badge: "Symptom Guide",
    color: "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  medical_explainer: {
    name: "Medical Terms Explainer",
    description: "Simplifies complex medical terminology, lab tests, and prescriptions.",
    badge: "Term Explainer",
    color: "bg-purple-500/10 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  wellness_coach: {
    name: "Wellness & Nutrition Coach",
    description: "Focuses on exercise, nutrition, sleep, and lifestyle prevention.",
    badge: "Wellness",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  mental_health: {
    name: "Mental Well-being Supporter",
    description: "Compassionate guide for stress relief, mindfulness, and coping strategies.",
    badge: "Mental Well-being",
    color: "bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  },
};

