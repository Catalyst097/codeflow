export function generateMermaid(code, language = "python") {
  if (!code || !code.trim()) {
    return `flowchart TD\nA0[Enter some code]`;
  }

  switch (language) {
    case "javascript": return parseJavaScript(code);
    case "java": return parseJava(code);
    case "cpp": return parseCpp(code);
    default: return parsePython(code);
  }
}

// ─── SHARED UTILS ───────────────────────────────────────────
let count = 0;
const nextId = () => `A${count++}`;

const clean = (text) =>
  (text || "")
    .replace(/#.*$/g, "").replace(/\/\/.*$/g, "")
    .replace(/"/g, "'").replace(/:/g, "")
    .replace(/[()[\]{}]/g, "").replace(/,/g, " ")
    .replace(/\s+/g, " ").trim().slice(0, 40) || "Empty";

// ─── PYTHON ─────────────────────────────────────────────────
function parsePython(code) {
  count = 0;
  const lines = code.split("\n");
  let diagram = "flowchart TD\n";
  let prevId = null;
  let stack = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;
    const indent = raw.search(/\S/);

    if (line.startsWith("def ")) {
      const id = nextId();
      diagram += `${id}[Function: ${clean(line)}]\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "function", id, indent });
      prevId = id;
    } else if (line.startsWith("if ")) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "if", id, indent });
      prevId = id;
    } else if (line.startsWith("elif ")) {
      const parentIf = [...stack].reverse().find(s => s.type === "if" && s.indent === indent);
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (parentIf) diagram += `${parentIf.id} -->|No| ${id}\n`;
      stack.push({ type: "if", id, indent });
      prevId = id;
    } else if (line.startsWith("else")) {
      const parentIf = [...stack].reverse().find(s => s.type === "if" && s.indent === indent);
      if (parentIf) {
        stack.push({ type: "else", id: parentIf.id, indent });
        prevId = parentIf.id;
      }
    } else if (line.startsWith("while ")) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "while", id, indent });
      prevId = id;
    } else if (line.startsWith("for ")) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "for", id, indent });
      prevId = id;
    } else if (line.startsWith("return")) {
      const id = nextId();
      const val = clean(line.replace("return", "").trim()) || "value";
      diagram += `${id}[Return: ${val}]\n`;
      const top = [...stack].reverse().find(s => s.indent < indent);
      if (top?.type === "if") diagram += `${top.id} -->|Yes| ${id}\n`;
      else if (top?.type === "else") diagram += `${top.id} -->|No| ${id}\n`;
      else if (prevId) diagram += `${prevId} --> ${id}\n`;
      prevId = id;
    } else {
      const id = nextId();
      diagram += `${id}[${clean(line)}]\n`;
      const top = [...stack].reverse().find(s => s.indent < indent);
      if (top?.type === "if") diagram += `${top.id} -->|Yes| ${id}\n`;
      else if (top?.type === "else") diagram += `${top.id} -->|No| ${id}\n`;
      else if (top?.type === "while" || top?.type === "for") {
        diagram += `${top.id} -->|Yes| ${id}\n`;
        diagram += `${id} --> ${top.id}\n`;
      } else if (prevId) diagram += `${prevId} --> ${id}\n`;
      prevId = id;
    }
  }

  const endId = nextId();
  diagram += `${endId}([End])\n`;
  if (prevId) diagram += `${prevId} --> ${endId}\n`;
  return diagram;
}

// ─── JAVASCRIPT ─────────────────────────────────────────────
function parseJavaScript(code) {
  count = 0;
  const lines = code.split("\n");
  let diagram = "flowchart TD\n";
  let prevId = null;
  let stack = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line || line === "{" || line === "}" || line === "};") continue;
    const indent = raw.search(/\S/);

    if (/^(function\s+\w+|const\s+\w+\s*=\s*(async\s*)?\(|let\s+\w+\s*=\s*function)/.test(line)) {
      const id = nextId();
      diagram += `${id}[Function: ${clean(line)}]\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "function", id, indent });
      prevId = id;
    } else if (/^if\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "if", id, indent });
      prevId = id;
    } else if (/^else\s+if\s*\(/.test(line)) {
      const parentIf = [...stack].reverse().find(s => s.type === "if");
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (parentIf) diagram += `${parentIf.id} -->|No| ${id}\n`;
      stack.push({ type: "if", id, indent });
      prevId = id;
    } else if (/^else/.test(line)) {
      const parentIf = [...stack].reverse().find(s => s.type === "if");
      if (parentIf) {
        stack.push({ type: "else", id: parentIf.id, indent });
        prevId = parentIf.id;
      }
    } else if (/^while\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "while", id, indent });
      prevId = id;
    } else if (/^for\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "for", id, indent });
      prevId = id;
    } else if (/^return/.test(line)) {
      const id = nextId();
      diagram += `${id}[Return: ${clean(line.replace("return", ""))}]\n`;
      const top = [...stack].reverse().find(s => s.indent < indent);
      if (top?.type === "if") diagram += `${top.id} -->|Yes| ${id}\n`;
      else if (top?.type === "else") diagram += `${top.id} -->|No| ${id}\n`;
      else if (prevId) diagram += `${prevId} --> ${id}\n`;
      prevId = id;
    } else {
      const id = nextId();
      diagram += `${id}[${clean(line)}]\n`;
      const top = [...stack].reverse().find(s => s.indent < indent);
      if (top?.type === "if") diagram += `${top.id} -->|Yes| ${id}\n`;
      else if (top?.type === "else") diagram += `${top.id} -->|No| ${id}\n`;
      else if (top?.type === "while" || top?.type === "for") {
        diagram += `${top.id} -->|Yes| ${id}\n`;
        diagram += `${id} --> ${top.id}\n`;
      } else if (prevId) diagram += `${prevId} --> ${id}\n`;
      prevId = id;
    }
  }

  const endId = nextId();
  diagram += `${endId}([End])\n`;
  if (prevId) diagram += `${prevId} --> ${endId}\n`;
  return diagram;
}

// ─── JAVA ────────────────────────────────────────────────────
function parseJava(code) {
  count = 0;
  const lines = code.split("\n");
  let diagram = "flowchart TD\n";
  let prevId = null;
  let stack = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line || line === "{" || line === "}") continue;
    const indent = raw.search(/\S/);

    if (/^(public|private|protected|static).*\w+\s*\(.*\)\s*\{?$/.test(line)) {
      const id = nextId();
      diagram += `${id}[Method: ${clean(line)}]\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "function", id, indent });
      prevId = id;
    } else if (/^if\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "if", id, indent });
      prevId = id;
    } else if (/^else\s+if\s*\(/.test(line)) {
      const parentIf = [...stack].reverse().find(s => s.type === "if");
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (parentIf) diagram += `${parentIf.id} -->|No| ${id}\n`;
      stack.push({ type: "if", id, indent });
      prevId = id;
    } else if (/^else/.test(line)) {
      const parentIf = [...stack].reverse().find(s => s.type === "if");
      if (parentIf) {
        stack.push({ type: "else", id: parentIf.id, indent });
        prevId = parentIf.id;
      }
    } else if (/^while\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "while", id, indent });
      prevId = id;
    } else if (/^for\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "for", id, indent });
      prevId = id;
    } else if (/^return/.test(line)) {
      const id = nextId();
      diagram += `${id}[Return: ${clean(line.replace("return", ""))}]\n`;
      const top = [...stack].reverse().find(s => s.indent < indent);
      if (top?.type === "if") diagram += `${top.id} -->|Yes| ${id}\n`;
      else if (top?.type === "else") diagram += `${top.id} -->|No| ${id}\n`;
      else if (prevId) diagram += `${prevId} --> ${id}\n`;
      prevId = id;
    } else {
      const id = nextId();
      diagram += `${id}[${clean(line)}]\n`;
      const top = [...stack].reverse().find(s => s.indent < indent);
      if (top?.type === "if") diagram += `${top.id} -->|Yes| ${id}\n`;
      else if (top?.type === "else") diagram += `${top.id} -->|No| ${id}\n`;
      else if (top?.type === "while" || top?.type === "for") {
        diagram += `${top.id} -->|Yes| ${id}\n`;
        diagram += `${id} --> ${top.id}\n`;
      } else if (prevId) diagram += `${prevId} --> ${id}\n`;
      prevId = id;
    }
  }

  const endId = nextId();
  diagram += `${endId}([End])\n`;
  if (prevId) diagram += `${prevId} --> ${endId}\n`;
  return diagram;
}

// ─── C++ ─────────────────────────────────────────────────────
function parseCpp(code) {
  count = 0;
  const lines = code.split("\n");
  let diagram = "flowchart TD\n";
  let prevId = null;
  let stack = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line || line === "{" || line === "}") continue;
    const indent = raw.search(/\S/);

    if (/^(int|void|string|bool|float|double|char)\s+\w+\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}[Function: ${clean(line)}]\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "function", id, indent });
      prevId = id;
    } else if (/^if\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "if", id, indent });
      prevId = id;
    } else if (/^else\s+if\s*\(/.test(line)) {
      const parentIf = [...stack].reverse().find(s => s.type === "if");
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (parentIf) diagram += `${parentIf.id} -->|No| ${id}\n`;
      stack.push({ type: "if", id, indent });
      prevId = id;
    } else if (/^else/.test(line)) {
      const parentIf = [...stack].reverse().find(s => s.type === "if");
      if (parentIf) {
        stack.push({ type: "else", id: parentIf.id, indent });
        prevId = parentIf.id;
      }
    } else if (/^while\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "while", id, indent });
      prevId = id;
    } else if (/^for\s*\(/.test(line)) {
      const id = nextId();
      diagram += `${id}{${clean(line)}}\n`;
      if (prevId) diagram += `${prevId} --> ${id}\n`;
      stack.push({ type: "for", id, indent });
      prevId = id;
    } else if (/^return/.test(line)) {
      const id = nextId();
      diagram += `${id}[Return: ${clean(line.replace("return", ""))}]\n`;
      const top = [...stack].reverse().find(s => s.indent < indent);
      if (top?.type === "if") diagram += `${top.id} -->|Yes| ${id}\n`;
      else if (top?.type === "else") diagram += `${top.id} -->|No| ${id}\n`;
      else if (prevId) diagram += `${prevId} --> ${id}\n`;
      prevId = id;
    } else {
      const id = nextId();
      diagram += `${id}[${clean(line)}]\n`;
      const top = [...stack].reverse().find(s => s.indent < indent);
      if (top?.type === "if") diagram += `${top.id} -->|Yes| ${id}\n`;
      else if (top?.type === "else") diagram += `${top.id} -->|No| ${id}\n`;
      else if (top?.type === "while" || top?.type === "for") {
        diagram += `${top.id} -->|Yes| ${id}\n`;
        diagram += `${id} --> ${top.id}\n`;
      } else if (prevId) diagram += `${prevId} --> ${id}\n`;
      prevId = id;
    }
  }

  const endId = nextId();
  diagram += `${endId}([End])\n`;
  if (prevId) diagram += `${prevId} --> ${endId}\n`;
  return diagram;
}