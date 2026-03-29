export default function Navbar({ language, setLanguage }) {
  const languages = [
    { value: "python", label: "🐍 Python" },
    { value: "javascript", label: "⚡ JavaScript" },
    { value: "java", label: "☕ Java" },
    { value: "cpp", label: "⚙️ C++" },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800"
      style={{ background: "linear-gradient(90deg, #0f1117 0%, #1a1d2e 100%)" }}>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
          ⚡
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">CodeFlow</h1>
          <p className="text-xs leading-none mt-1" style={{ color: "#6366f1" }}>
            Code → Diagram Generator
          </p>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">Language:</span>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: language === lang.value
                  ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
                  : "#1a1d2e",
                color: language === lang.value ? "white" : "#9ca3af",
                border: language === lang.value
                  ? "1px solid #6366f1"
                  : "1px solid #374151",
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span className="text-xs text-gray-400">Live Preview</span>
      </div>
    </div>
  );
}