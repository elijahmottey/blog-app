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
  const author = post.users || "Anonymous";
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
