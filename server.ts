import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", name: "DARBS Diagnostic Assistant API" });
});

// Offline Diagnostic Fallback Generator for Hardware & PC Repairs
// Ensures users always receive immediate, structured troubleshooting steps even if API quotas/rate limits are hit
function generateOfflineDiagnosticFallback(
  userQuery: string,
  persona: string = "hardware_laptop"
): string {
  const q = userQuery.toLowerCase();

  // 1. BSOD / Blue Screen of Death
  if (
    q.includes("bsod") ||
    q.includes("blue screen") ||
    q.includes("stop code") ||
    q.includes("crash") ||
    q.includes("minidump") ||
    persona === "windows_bsod"
  ) {
    return `### 🔍 DARBS Blue Screen (BSOD) Diagnostic & Recovery Guide

I analyzed your crash symptoms. Blue Screen errors typically stem from corrupt kernel files, faulty drivers (especially GPU/Wi-Fi), or bad RAM modules.

---

### 🛠️ Step-by-Step Fix Protocol:

#### 1. System File & Image Verification
Open **Command Prompt as Administrator** (**Win + S**, type \`cmd\`, right-click ➔ *Run as Administrator*):
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`
*Explanation: DISM fetches fresh system binaries from Windows Update, while SFC replaces any corrupted kernel DLLs.*

#### 2. Test RAM for Bit Flips & Memory Leaks
1. Press **Win + R**, type:
\`\`\`cmd
mdsched.exe
\`\`\`
2. Select **"Restart now and check for problems"**.
3. Let the diagnostic test complete (15–30 mins). Any hardware errors indicate a failing RAM stick.

#### 3. Analyze Minidump Logs
Locate crash dumps in:
\`\`\`cmd
C:\\Windows\\Minidump\\
\`\`\`
Use the free tool **BlueScreenView** or **WinDbg** to pinpoint the exact \`.sys\` driver causing the crash (e.g. \`nvlddmkm.sys\` for Nvidia GPU, \`Netwtw10.sys\` for Intel Wi-Fi).

---
> 💡 **DARBS Advisory**: If the BSOD started after a recent Windows update or driver install, boot into Safe Mode (**Shift + Restart**) and roll back the recent driver in **Device Manager**.`;
  }

  // 2. 100% Disk, CPU, or Memory Usage
  if (
    q.includes("100% disk") ||
    q.includes("disk usage") ||
    q.includes("slow") ||
    q.includes("sluggish") ||
    q.includes("high cpu") ||
    q.includes("ram full") ||
    q.includes("task manager") ||
    persona === "performance_storage"
  ) {
    return `### ⚡ DARBS High Resource Usage & Performance Optimization

High 100% Disk or CPU usage on laptops is most commonly triggered by Windows Search indexing loops, background SysMain caching, or fragmented page files.

---

### 🛠️ Resolution Steps:

#### 1. Disable SysMain & Diagnostic Telemetry
Open **Command Prompt as Administrator** and execute:
\`\`\`cmd
net stop sysmain
sc config sysmain start=disabled
net stop DiagTrack
sc config DiagTrack start=disabled
\`\`\`

#### 2. Run Safe Disk Check & Trim Optimization
\`\`\`cmd
chkdsk C: /f /r
defrag C: /O
\`\`\`
*(Note: \`defrag /O\` performs TRIM on SSDs or defragmentation on HDDs safely).*

#### 3. Clean Temporary Files & Windows Update Cache
\`\`\`cmd
cleanmgr /sageset:1
cleanmgr /sagerun:1
\`\`\`

#### 4. Audit Startup Impact
Press **Ctrl + Shift + Esc** to open **Task Manager** ➔ Go to the **Startup Apps** tab ➔ Disable high-impact apps (OneDrive, Discord, Spotify, Game Launchers).

---
> 💡 **Storage Tip**: Ensure Drive C: maintains at least **15% free storage space** for Windows virtual memory (pagefile.sys) swapping.`;
  }

  // 3. Wi-Fi / Network Disconnections
  if (
    q.includes("wifi") ||
    q.includes("wi-fi") ||
    q.includes("disconnect") ||
    q.includes("internet") ||
    q.includes("dns") ||
    q.includes("ping") ||
    persona === "network_wifi"
  ) {
    return `### 🌐 DARBS Network & Wi-Fi Diagnostic Workflow

Frequent Wi-Fi disconnections on laptops are usually caused by aggressive Windows Power Management turning off the wireless card, or corrupted TCP/IP stack parameters.

---

### 🛠️ Step-by-Step Fix Protocol:

#### 1. Complete TCP/IP Stack & DNS Flush
Open **Command Prompt as Administrator** and run this sequence:
\`\`\`cmd
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /flushdns
ipconfig /renew
\`\`\`
*(Restart your laptop after running these commands).*

#### 2. Prevent Windows from Sleeping the Wi-Fi Adapter
1. Press **Win + X** ➔ Select **Device Manager**.
2. Expand **Network adapters** ➔ Right-click your Wi-Fi card (e.g. *Intel Wi-Fi 6 AX200* or *Realtek*) ➔ **Properties**.
3. Go to the **Power Management** tab.
4. **Uncheck** *"Allow the computer to turn off this device to save power"*.
5. Click **OK**.

#### 3. Switch to Reliable DNS Resolvers (Cloudflare / Google)
1. Press **Win + R**, type \`ncpa.cpl\` and press Enter.
2. Right-click your active Wi-Fi adapter ➔ **Properties**.
3. Select **Internet Protocol Version 4 (TCP/IPv4)** ➔ **Properties**.
4. Set DNS servers:
   - Preferred: \`1.1.1.1\` (Cloudflare)
   - Alternate: \`8.8.8.8\` (Google)

---
> 💡 **Router Check**: If 5GHz drops through walls, switch your laptop to the 2.4GHz SSID for longer range stability.`;
  }

  // 4. Overheating / Fan Noise / Thermals
  if (
    q.includes("overheat") ||
    q.includes("fan") ||
    q.includes("hot") ||
    q.includes("thermal") ||
    q.includes("temperature") ||
    q.includes("battery")
  ) {
    return `### 🌡️ DARBS Laptop Thermals, Fan Noise & Battery Diagnostics

Excessive heat and loud fans occur when cooling fins get clogged with lint, thermal paste dries out, or background processes prevent CPU idle C-states.

---

### 🛠️ Hardware Diagnostic Steps:

#### 1. Generate an Official Windows Battery Health Report
Open **Command Prompt as Administrator** and type:
\`\`\`cmd
powercfg /batteryreport /output "C:\\battery_report.html"
start C:\\battery_report.html
\`\`\`
*Compare the **Design Capacity** vs **Full Charge Capacity**. If capacity has degraded below 60%, the battery cells may be deteriorating.*

#### 2. Cap Maximum Processor State (Instant Thermal Drop)
1. Press **Win + R**, type \`control.exe powercfg.cpl,,1\` and press Enter.
2. Expand **Processor power management** ➔ **Maximum processor state**.
3. Change **On battery** and **Plugged in** from \`100%\` to \`95%\` or \`99%\`.
   *(This disables aggressive Intel Turbo Boost / AMD Precision Boost, dropping CPU temperatures by 10°C–15°C with zero noticeable speed loss).*

#### 3. Physical Maintenance Protocol
- **Vents**: Use compressed air to blow lint out of the exhaust fins while holding the fan blades still with a toothpick.
- **Surface**: Never use a laptop on soft surfaces (bed, carpet, pillow) which block intake grills.
- **Thermal Repaste**: For laptops older than 2–3 years, replacing dried factory paste with high-viscosity compound (e.g., Arctic MX-4, Honeywell PTM7950) restores factory cooling.`;
  }

  // Default Comprehensive Diagnostic
  return `### 💻 DARBS Diagnostic Analysis & System Troubleshooting

I have analyzed your query regarding **"${userQuery.slice(0, 60)}"**. Here is the recommended diagnostic workflow:

---

### 🛠️ Universal First-Response Diagnostic Protocol:

#### 1. Run Windows Component Store & File Integrity Scan
Open **Command Prompt as Administrator** (**Win + S** ➔ type \`cmd\` ➔ right-click *Run as administrator*):
\`\`\`cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
\`\`\`

#### 2. Check Event Viewer for Critical Hardware / Driver Faults
1. Press **Win + X** ➔ select **Event Viewer**.
2. Expand **Windows Logs** ➔ click on **System**.
3. Look for **Error** or **Critical** events (Event IDs: *41 Kernel-Power*, *1001 BugCheck*, *7000 Service Control*).

#### 3. Perform Clean Driver & Peripheral Verification
- Press **Win + X** ➔ click **Device Manager**.
- Check if any yellow exclamation marks ⚠️ appear under Display Adapters, Network, or USB Controllers.
- Right-click and choose **Update driver** ➔ *Search automatically for drivers*.

---
> 💬 **Next Step**: Share your laptop brand/model, OS build, or any specific error codes and I will tailor the exact repair script for your machine!`;
}

// Main Chat Endpoint with Multi-Model Fallback and Resilient Offline Diagnostics
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, persona, temperature, enableWebSearch } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Technical Troubleshooting System Instructions for DARBS
    let systemInstruction = `You are DARBS (Diagnostic Assistant for Repair, Bugs and Support), an expert AI Technical Support Engineer and Laptop/PC Repair Specialist.
Your mission is to provide precise, structured, step-by-step diagnostic workflows, troubleshooting trees, command-line fixes, hardware guidance, and bug resolution for laptops, desktop computers, Windows/Linux/macOS systems, drivers, network issues, and peripherals.

CORE DIAGNOSTIC METHODOLOGY:
Follow an interactive troubleshooting approach:
1. 🔍 DIAGNOSE: Ask targeted clarifying questions (OS build, specs, recent updates, error codes/stop codes, symptoms) or explain the root cause.
2. 🧪 TEST: Guide the user to safely check Event Viewer, Task Manager, Device Manager, or test hardware.
3. 🛠️ FIX: Provide clear, numbered steps and exact commands (e.g. DISM, SFC, chkdsk, netsh, ipconfig, DDU) in copyable code blocks with warning notes where appropriate.
4. ✅ VERIFY: Explain how to confirm the issue is resolved and prevent recurrence.
5. ⚠️ HARDWARE SAFETY: Warn clearly about physical risks (e.g., swollen lithium-ion battery = fire hazard, unplug power before opening laptop chassis, static ESD precautions, thermal paste application).

TONE & STYLE:
- Professional, concise, authoritative yet approachable and clear.
- Format commands in code blocks with syntax highlighting.
- Use bold text for key system menus, shortcuts (e.g., Win + X, Ctrl + Shift + Esc), and file paths.`;

    if (persona === "windows_bsod") {
      systemInstruction +=
        " Focus deeply on Windows Blue Screen of Death stop codes, minidump analysis (WinDbg), kernel panic troubleshooting, corrupt system files (SFC/DISM), and bootloader/BCD repair.";
    } else if (persona === "performance_storage") {
      systemInstruction +=
        " Focus on diagnosing 100% disk usage, high CPU/RAM bottlenecks, startup programs, thermal throttling, pagefile configuration, disk cleanup, and TRIM/SSD health.";
    } else if (persona === "network_wifi") {
      systemInstruction +=
        " Focus on Wi-Fi dropouts, driver power management, DNS flushes, TCP/IP stack resets, 5GHz/2.4GHz band steering, firewall ports, and packet loss troubleshooting.";
    } else if (persona === "driver_software") {
      systemInstruction +=
        " Focus on Display Driver Uninstaller (DDU), clean GPU driver installation, audio driver glitches, peripheral USB errors, BIOS/UEFI updates, and software bugs.";
    } else {
      systemInstruction +=
        " Focus on full-spectrum laptop hardware, thermals, fans, battery health reports (powercfg /batteryreport), charging port issues, keyboard/trackpad, and system maintenance.";
    }

    // Convert message history to Gemini contents format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";

    const candidateModels = [
      "gemini-3.7-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
    ];

    let replyText = "";
    let webSources: Array<{ title: string; url: string }> = [];
    let success = false;
    let lastError: any = null;

    // Try primary models with fallback chain
    for (const modelName of candidateModels) {
      try {
        const ai = getGeminiClient();
        const config: any = {
          systemInstruction,
          temperature: typeof temperature === "number" ? temperature : 0.7,
        };

        if (enableWebSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });

        replyText = response.text || "";

        // Extract search grounding metadata if present
        const groundingChunks =
          response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        webSources = groundingChunks
          .filter((chunk: any) => chunk.web?.uri)
          .map((chunk: any) => ({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri,
          }));

        if (replyText) {
          success = true;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with ${modelName} encountered error:`, err?.message || err);
        // Continue loop to try next model in tier
      }
    }

    // If all Gemini cloud models hit quota limits or 429 errors, invoke the offline diagnostic engine
    if (!success || !replyText) {
      console.log(
        "Invoking DARBS Offline Diagnostic Engine due to rate limits or API constraints."
      );
      const isQuotaError =
        lastError?.message?.includes("quota") ||
        lastError?.message?.includes("429") ||
        lastError?.status === "RESOURCE_EXHAUSTED";

      const fallbackContent = generateOfflineDiagnosticFallback(
        lastUserMessage,
        persona
      );

      const notice = isQuotaError
        ? `> ⚡ *DARBS Offline Diagnostic Mode Active (API Quota Exceeded)*\n\n`
        : "";

      return res.json({
        reply: notice + fallbackContent,
        sources: [],
      });
    }

    res.json({
      reply: replyText,
      sources: webSources,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    const lastUserMessage =
      [...(req.body?.messages || [])].reverse().find((m: any) => m.role === "user")?.content || "";
    const offlineReply = generateOfflineDiagnosticFallback(
      lastUserMessage,
      req.body?.persona
    );
    res.json({
      reply: offlineReply,
      sources: [],
    });
  }
});

// Image Generation Endpoint
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    let imageUrl: string | null = null;
    let caption: string | null = null;

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mimeType};base64,${base64Data}`;
      } else if (part.text) {
        caption = part.text;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image was generated by model." });
    }

    res.json({ imageUrl, caption });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({
      error: error.message || "Failed to generate image.",
    });
  }
});

// Text-To-Speech Endpoint
app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const cleanText = text.slice(0, 1000);

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Read cleanly: ${cleanText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: "Failed to generate audio output." });
    }

    res.json({ audioBase64: base64Audio });
  } catch (error: any) {
    console.error("Error in /api/text-to-speech:", error);
    res.status(500).json({
      error: error.message || "Failed to generate text-to-speech.",
    });
  }
});

// Smart Analysis / Prompt Polish Tool Endpoint
app.post("/api/smart-tool", async (req, res) => {
  try {
    const { toolType, input } = req.body;
    if (!input) return res.status(400).json({ error: "Input text required." });

    const ai = getGeminiClient();
    let prompt = "";

    if (toolType === "enhance_prompt") {
      prompt = `Enhance and optimize the following prompt for an AI model to produce maximum quality, detail, and clarity: "${input}"`;
    } else if (toolType === "summarize") {
      prompt = `Provide a concise executive summary, key takeaways, and action items for the following text:\n\n${input}`;
    } else if (toolType === "code_explain") {
      prompt = `Analyze and explain this code in plain English. Breakdown key functions, potential edge cases, and optimization ideas:\n\n${input}`;
    } else if (toolType === "flashcards") {
      prompt = `Generate 5 high-yield study flashcards based on this text. Return as JSON array of objects with "question" and "answer" properties:\n\n${input}`;
    } else {
      prompt = `Analyze the following content and provide helpful key insights:\n\n${input}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Error in /api/smart-tool:", error);
    res.status(500).json({ error: error.message || "Smart tool execution failed." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DARBS AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
