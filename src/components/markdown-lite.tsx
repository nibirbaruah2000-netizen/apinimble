import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

type Block =
  | { type: "p"; text: string }
  | { type: "h"; level: 2 | 3; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; text: string };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        buf.push(lines[i] ?? "");
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: "code", lang, text: buf.join("\n") });
      continue;
    }
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: "h", level: heading[1]!.length > 2 ? 3 : 2, text: heading[2] ?? "" });
      i += 1;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*\d+[.)]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    const para = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !(lines[i] ?? "").trim().startsWith("```") &&
      !/^#{1,3}\s+/.test(lines[i] ?? "") &&
      !/^\s*[-*]\s+/.test(lines[i] ?? "") &&
      !/^\s*\d+[.)]\s+/.test(lines[i] ?? "")
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end > i + 2) {
        nodes.push(
          <strong key={key} className="font-semibold">
            {text.slice(i + 2, end)}
          </strong>,
        );
        key += 1;
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i + 1) {
        nodes.push(
          <code key={key} className="inline">
            {text.slice(i + 1, end)}
          </code>,
        );
        key += 1;
        i = end + 1;
        continue;
      }
    }
    if (text[i] === "[") {
      const close = text.indexOf("]", i + 1);
      if (close > i && text[close + 1] === "(") {
        const end = text.indexOf(")", close + 2);
        const href = end > close ? text.slice(close + 2, end) : "";
        if (end > close && /^https?:\/\//i.test(href)) {
          nodes.push(
            <a key={key} href={href} target="_blank" rel="noreferrer">
              {text.slice(i + 1, close)}
            </a>,
          );
          key += 1;
          i = end + 1;
          continue;
        }
      }
    }
    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end > i + 1) {
        nodes.push(<em key={key}>{text.slice(i + 1, end)}</em>);
        key += 1;
        i = end + 1;
        continue;
      }
    }
    let j = i + 1;
    while (j < text.length && text[j] !== "*" && text[j] !== "`" && text[j] !== "[") j += 1;
    nodes.push(text.slice(i, j));
    i = j;
  }
  return <>{nodes}</>;
}

function CodeBlock({ lang, text }: { lang: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg">
      <div className="flex items-center justify-between gap-3 px-3 py-2 text-muted">
        <span className="truncate font-mono text-xs">{lang || "code"}</span>
        <button
          type="button"
          className="press inline-flex min-h-8 items-center gap-1 text-xs text-muted"
          onClick={() => {
            void navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            });
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 pb-3 font-mono text-sm text-fg">
        <code>{text}</code>
      </pre>
    </div>
  );
}

export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  if (!blocks.length) return null;
  return (
    <div className="md break-words">
      {blocks.map((block, index) => {
        if (block.type === "code") return <CodeBlock key={index} lang={block.lang} text={block.text} />;
        if (block.type === "h") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return (
            <Tag key={index}>
              <Inline text={block.text} />
            </Tag>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const Tag = block.type === "ul" ? "ul" : "ol";
          return (
            <Tag key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Inline text={item} />
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={index}>
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
