"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import CodeEditor from "../components/CodeEditor";
import DiagramViewer from "../components/DiagramViewer";
import { generateMermaid } from "../utils/parser";

export default function Home() {
  const [code, setCode] = useState("");
  const [chart, setChart] = useState("");
  const [language, setLanguage] = useState("python");
  const [isGenerating, setIsGenerating] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const diagramRef = useRef(null);
  const debounceRef = useRef(null);

  // Load saved key on mount
  useEffect(() => {
    const key = localStorage.getItem("anthropic_key") || "";
    setSavedKey(key);
  }, []);

  // Live auto-generate
  useEffect(() => {
    if (!code.trim()) { setChart(""); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setIsGenerating(true);
      const mermaidCode = generateMermaid(code, language);
      setChart(mermaidCode);
      setIsGenerating(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [code, language]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem("anthropic_key", apiKey.trim());
    setSavedKey(apiKey.trim());
    setShowModal(false);
    setApiKey("");
  };

  const handleRemoveKey = () => {
    localStorage.removeItem("anthropic_key");
    setSavedKey("");
    setExplanation("");
  };

  const handleExplain = async () => {
    if (!code.trim()) return;
    if (!savedKey) { setShowModal(true); return; }
    setIsExplaining(true);
    setExplanation("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, apiKey: savedKey }),
      });
      const data = await response.json();
      if (data.error === "invalid_key") {
        setExplanation("❌ Invalid API key. Please update it.");
        setSavedKey("");
        localStorage.removeItem("anthropic_key");
      } else {
        setExplanation(data.explanation || "Could not generate explanation.");
      }
    } catch (err) {
      setExplanation("Error generating explanation. Please try again.");
    }
    setIsExplaining(false);
  };

  const handleDownload = () => {
    if (!diagramRef.current) return;
    const svg = diagramRef.current.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0f1117" }}>
      <Navbar language={language} setLanguage={setLanguage} />

      {/* API Key Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fadeIn"
            style={{ background: "#1a1d2e", border: "1px solid #4f46e5" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🤖</div>
              <div>
                <h2 className="text-white font-bold text-lg">Enable AI Explanation</h2>
                <p className="text-xs text-gray-400">Use your own Anthropic API key — free forever</p>
              </div>
            </div>

            <div
              className="mb-4 p-3 rounded-lg text-xs text-gray-300 leading-relaxed"
              style={{ background: "#0f1117" }}
            >
              ✅ Get simple explanations of any code<br />
              ✅ Supports Python, JS, Java, C++<br />
              ✅ Your key is stored only on your device<br />
              🔑 Requires your own Anthropic API key<br />
              ☕ Love the tool? Support us with a donation!
            </div>

            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-indigo-400 hover:text-indigo-300 mb-4 underline"
            >
              → Get your API key at console.anthropic.com
            </a>

            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
              className="w-full px-4 py-3 rounded-lg text-sm text-white mb-4 outline-none"
              style={{ background: "#0f1117", border: "1px solid #374151" }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                style={{ background: "#374151" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
              >
                Save & Activate 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Labels */}
      <div className="flex border-b border-gray-800">
        <div className="w-1/2 px-4 py-2 flex items-center gap-2 border-r border-gray-800">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-glow"></div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
            Code Editor
          </span>
          {isGenerating && (
            <span className="text-xs text-indigo-400 animate-pulse ml-2">● updating...</span>
          )}
        </div>
        <div className="w-1/2 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              Diagram Preview
            </span>
          </div>
          <div className="flex items-center gap-3">
            {savedKey && (
              <button
                onClick={handleRemoveKey}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                🔑 Remove Key
              </button>
            )}
            {chart && (
              <button
                onClick={handleDownload}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                ⬇ Export SVG
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT */}
        <div className="w-1/2 h-full border-r border-gray-800 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} setCode={setCode} language={language} />
          </div>
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleExplain}
              disabled={isExplaining || !code.trim()}
              className="w-full font-bold py-3 px-4 rounded-lg text-white text-sm uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isExplaining
                  ? "#374151"
                  : savedKey
                  ? "linear-gradient(135deg, #059669, #0d9488)"
                  : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                boxShadow: isExplaining
                  ? "none"
                  : savedKey
                  ? "0 0 20px rgba(5,150,105,0.3)"
                  : "0 0 20px rgba(79,70,229,0.3)",
              }}
            >
              {isExplaining
                ? "🤖 Thinking..."
                : savedKey
                ? "🤖 Explain Code with AI"
                : "🔑 Enable AI with your API Key"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-1/2 h-full flex flex-col">
          <div
            className="overflow-auto"
            style={{
              background: "#0f1117",
              flex: explanation ? "0 0 60%" : "1",
              transition: "flex 0.3s ease",
            }}
          >
            <DiagramViewer chart={chart} diagramRef={diagramRef} />
          </div>

          {(explanation || isExplaining) && (
            <div
              className="border-t border-gray-800 p-4 overflow-auto animate-fadeIn"
              style={{ flex: "0 0 40%", background: "#0d1117" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                  🤖 AI Explanation
                </span>
                <button
                  onClick={() => setExplanation("")}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  ✕ Close
                </button>
              </div>
              {isExplaining ? (
                <p className="text-gray-400 text-sm animate-pulse">⏳ Analyzing your code...</p>
              ) : (
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}