/**
 * A small Markdown-to-HTML renderer, enough for the repo's own docs: headings,
 * fenced code, lists, tables, quotes, rules and inline emphasis/links/code.
 * Deliberately dependency-free — the docs app should not pull a parser in to
 * display files that are already in the repo.
 *
 * All text is escaped before any markup is added, so document content can
 * never inject HTML.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_match, label: string, href: string) =>
        /^(https?:|\/|#)/.test(href)
          ? `<a href="${href}" ${href.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}>${label}</a>`
          : `${label}`,
    )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export type Heading = { level: number; text: string; id: string }

export function renderMarkdown(source: string): { html: string; headings: Heading[] } {
  const lines = source.split("\n")
  const out: string[] = []
  const headings: Heading[] = []
  let index = 0

  const closeList = (stack: string[]) => {
    while (stack.length > 0) out.push(`</${stack.pop()}>`)
  }
  const listStack: string[] = []

  while (index < lines.length) {
    const line = lines[index] ?? ""

    // Fenced code
    const fence = line.match(/^```(\w*)/)
    if (fence) {
      closeList(listStack)
      const body: string[] = []
      index += 1
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        body.push(lines[index] ?? "")
        index += 1
      }
      index += 1
      out.push(
        `<pre data-lang="${escapeHtml(fence[1] ?? "")}"><code>${escapeHtml(body.join("\n"))}</code></pre>`,
      )
      continue
    }

    // Table: a header row followed by a separator row
    if (line.includes("|") && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[index + 1] ?? "")) {
      closeList(listStack)
      const cells = (row: string) =>
        row
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim())
      const header = cells(line)
      index += 2
      const rows: string[][] = []
      while (index < lines.length && (lines[index] ?? "").includes("|")) {
        rows.push(cells(lines[index] ?? ""))
        index += 1
      }
      out.push(
        `<table><thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table>`,
      )
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      closeList(listStack)
      const level = (heading[1] ?? "#").length
      const text = (heading[2] ?? "").trim()
      const id = slugify(text)
      headings.push({ level, text, id })
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`)
      index += 1
      continue
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      closeList(listStack)
      out.push("<hr />")
      index += 1
      continue
    }

    if (line.startsWith("> ")) {
      closeList(listStack)
      const quote: string[] = []
      while (index < lines.length && (lines[index] ?? "").startsWith("> ")) {
        quote.push((lines[index] ?? "").slice(2))
        index += 1
      }
      out.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`)
      continue
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    const ordered = line.match(/^\s*\d+\.\s+(.*)$/)
    if (bullet || ordered) {
      const wanted = bullet ? "ul" : "ol"
      if (listStack[listStack.length - 1] !== wanted) {
        closeList(listStack)
        listStack.push(wanted)
        out.push(`<${wanted}>`)
      }
      out.push(`<li>${inline((bullet ?? ordered)?.[1] ?? "")}</li>`)
      index += 1
      continue
    }

    if (line.trim() === "") {
      closeList(listStack)
      index += 1
      continue
    }

    // Paragraph: consume until a blank line or a block-level opener.
    const paragraph: string[] = []
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() !== "" &&
      !/^(#{1,6}\s|```|>\s|\s*[-*]\s|\s*\d+\.\s)/.test(lines[index] ?? "")
    ) {
      paragraph.push(lines[index] ?? "")
      index += 1
    }
    closeList(listStack)
    out.push(`<p>${inline(paragraph.join(" "))}</p>`)
  }

  closeList(listStack)
  return { html: out.join("\n"), headings }
}
