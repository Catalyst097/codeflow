"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function CodeEditor({ code, setCode }) {
  return (
    <div className="w-full h-full">
      <Editor
        height="100%" // ✅ important
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: "on",
        }}
      />
    </div>
  );
}