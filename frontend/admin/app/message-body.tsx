"use client";

import { memo } from "react";

/**
 * Message rendering: fenced code blocks, inline code, bold, italic, links and
 * @mentions.
 *
 * Deliberately a small hand-written formatter rather than a markdown library.
 * The decisive reason is safety: this only ever builds React elements, never
 * an HTML string, and nothing here goes near dangerouslySetInnerHTML — so
 * message text (which is user input rendered into other people's DOM) has no
 * injection surface at all. A markdown pipeline would need a sanitizer
 * configured correctly and kept correct.
 *
 * The tradeoff is scope: no tables, headings, images or nested lists. What a
 * dev team actually pastes into chat — code, a bold word, a link — is covered.
 */

type Member = { id: number; name: string };

/** Only http(s) become links; this is what keeps javascript: URLs out. */
function isSafeUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Splits on the first matching delimiter pair and recurses over the remainder. */
function renderInline(text: string, members: Member[], me: number | undefined, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  // Longest names first so "Ali Hassan" wins over a member also called "Ali".
  const names = [...members].sort((a, b) => b.name.length - a.name.length);
  let rest = text;
  let key = 0;

  const pushText = (s: string) => { if (s) out.push(<span key={`${keyBase}t${key++}`}>{s}</span>); };

  while (rest.length > 0) {
    // Find the earliest special construct in the remaining text.
    const code = rest.indexOf("`");
    const bold = rest.indexOf("**");
    const at = rest.indexOf("@");
    const link = rest.search(/https?:\/\/\S/);
    const candidates = [code, bold, at, link].filter((i) => i >= 0);

    if (candidates.length === 0) { pushText(rest); break; }
    const next = Math.min(...candidates);
    pushText(rest.slice(0, next));
    rest = rest.slice(next);

    if (rest.startsWith("`")) {
      const end = rest.indexOf("`", 1);
      if (end === -1) { pushText(rest); break; }
      out.push(
        <code key={`${keyBase}c${key++}`} className="px-1 py-0.5 rounded bg-gray-200 text-gray-900 font-mono text-[13px]">
          {rest.slice(1, end)}
        </code>
      );
      rest = rest.slice(end + 1);
      continue;
    }

    if (rest.startsWith("**")) {
      const end = rest.indexOf("**", 2);
      if (end === -1) { pushText(rest); break; }
      out.push(<strong key={`${keyBase}b${key++}`}>{rest.slice(2, end)}</strong>);
      rest = rest.slice(end + 2);
      continue;
    }

    if (rest.startsWith("@")) {
      const hit = names.find((m) => rest.startsWith(`@${m.name}`));
      if (hit) {
        out.push(
          <span key={`${keyBase}m${key++}`}
            className={`rounded px-1 font-medium ${hit.id === me ? "bg-amber-400 text-gray-50" : "bg-gray-200 text-gray-900"}`}>
            @{hit.name}
          </span>
        );
        rest = rest.slice(1 + hit.name.length);
      } else {
        pushText("@");
        rest = rest.slice(1);
      }
      continue;
    }

    const match = rest.match(/^https?:\/\/\S+/);
    if (match && isSafeUrl(match[0])) {
      out.push(
        <a key={`${keyBase}l${key++}`} href={match[0]} target="_blank" rel="noreferrer noopener" className="underline break-all">
          {match[0]}
        </a>
      );
      rest = rest.slice(match[0].length);
      continue;
    }

    // Nothing matched cleanly (e.g. a bare "http" with no URL after it).
    pushText(rest.slice(0, 1));
    rest = rest.slice(1);
  }

  return out;
}

export const MessageBody = memo(function MessageBody({ text, members, me }: {
  text: string | null;
  members: Member[];
  me?: number;
}) {
  if (!text) return null;

  // Fenced blocks are split out first so their contents are never re-parsed for
  // bold/mentions — pasted code must survive exactly as written.
  const segments = text.split(/```/);
  return (
    <>
      {segments.map((segment, i) =>
        i % 2 === 1 ? (
          <pre key={`f${i}`} className="my-1 p-2 rounded bg-gray-200 text-gray-900 overflow-x-auto">
            <code className="font-mono text-[13px] whitespace-pre">{segment.replace(/^\n/, "")}</code>
          </pre>
        ) : (
          <span key={`s${i}`} className="whitespace-pre-wrap">{renderInline(segment, members, me, `s${i}`)}</span>
        )
      )}
    </>
  );
});
