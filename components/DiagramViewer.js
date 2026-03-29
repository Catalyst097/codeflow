"use client";

import { useEffect, useRef, useState } from "react";

export default function DiagramViewer({ chart, diagramRef }) {
  const ref = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!chart) {
      setIsEmpty(true);
      return;
    }

    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#4f46e5",
            primaryTextColor: "#e2e8f0",
            primaryBorderColor: "#6366f1",
            lineColor: "#6366f1",
            secondaryColor: "#1e1b4b",
            tertiaryColor: "#1a1d2e",
            background: "#0f1117",
            mainBkg: "#1e1b4b",
            nodeBorder: "#4f46e5",
            clusterBkg: "#1a1d2e",
            titleColor: "#e2e8f0",
            edgeLabelBackground: "#1a1d2e",
          },
        });

        const id = "graph_" + Date.now();
        const { svg } = await mermaid.render(id, chart);

        if (ref.current) {
          ref.current.innerHTML = svg;
          setIsEmpty(false);
          setHasError(false);
        }

        if (diagramRef) diagramRef.current = ref.current;
      } catch (err) {
        console.error("Mermaid Error:", err);
        setHasError(true);
        setIsEmpty(false);
        if (ref.current) {
          ref.current.innerHTML = "";
        }
      }
    };

    render();
  }, [chart]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-start">
      {isEmpty && (
        <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
          <div className="text-6xl">📊</div>
          <p className="text-gray-400 text-sm text-center">
            Write code on the left and<br />click Generate Diagram
          </p>
        </div>
      )}

      {hasError && (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-400 text-sm">Could not render diagram</p>
        </div>
      )}

      <div
        ref={ref}
        className="mermaid-container w-full flex justify-center p-4"
      />
    </div>
  );
}