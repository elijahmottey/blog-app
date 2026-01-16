import type { PostDto } from "../service/BackendApi";

// Sanitize string for safe filename
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function stripHtml(html?: string): string {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function formatIsoDate(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

export function downloadPost(post: PostDto) {
  const title = post.title || "blog-post";
  const author = (post as any).users?.name || (post as any).users || "Anonymous";
  const createdDate = formatIsoDate(post.createdAt) || new Date().toISOString().slice(0, 10);
  const filename = `${slugify(title)}_${createdDate}.txt`;

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`Author: ${author}`);
  if (post.createdAt) lines.push(`Created: ${new Date(post.createdAt).toLocaleString()}`);
  if (post.updatedAt) lines.push(`Updated: ${new Date(post.updatedAt).toLocaleString()}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(stripHtml(post.content));
  lines.push("");

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPostPdf(post: PostDto) {
  const title = post.title || "blog-post";
  const author = (post as any).users?.name || (post as any).users || "Anonymous";
  const created = post.createdAt ? new Date(post.createdAt).toLocaleString() : "";
  const updated = post.updatedAt ? new Date(post.updatedAt).toLocaleString() : "";
  const createdDate = formatIsoDate(post.createdAt) || new Date().toISOString().slice(0, 10);
  const fileBase = `${slugify(title)}_${createdDate}`;

  // Basic HTML formatting for print-to-PDF
  const safeContent = (post.content || "")
    .split("\n\n").map(p => `<p>${p.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`).join("\n");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${fileBase}.pdf</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 32px; color: #111; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    .meta { color: #555; margin-bottom: 16px; font-size: 12px; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 16px 0; }
    p { line-height: 1.6; margin: 0 0 12px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Author: ${author}${created ? ` • Created: ${created}` : ""}${updated ? ` • Updated: ${updated}` : ""}</div>
  <hr />
  <article>${safeContent}</article>
  <script>
    window.onload = function() { setTimeout(function(){ window.print(); }, 200); };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, '_blank');
  if (!w) {
    // Fallback: open data URL directly
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
    window.open(dataUrl, '_blank');
  }
}
