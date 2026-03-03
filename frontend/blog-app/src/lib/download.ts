import BackendApi, { type PostDto } from "../service/BackendApi";
import { toast } from "sonner";

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

export function downloadPost(post: PostDto, isAuthenticated: boolean) {
  if (!isAuthenticated) {
    toast.error("You must be logged in to download posts.");
    return;
  }

  // Track download
  if (post.id) {
    BackendApi.trackPostDownload(post.id).catch(err => console.error("Failed to track download", err));
  }

  const title = post.title || "blog-post";
  const author = (post as any).users?.name || (post as any).users || "Anonymous";
  const createdDate = formatIsoDate(post.createdAt) || new Date().toISOString().slice(0, 10);
  const filename = `${slugify(title)}_${createdDate}.txt`;

  const lines: string[] = [];
  lines.push("LIVBlog");
  lines.push("");
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

export async function downloadPostPdf(post: PostDto, isAuthenticated: boolean) {
  if (!isAuthenticated) {
    toast.error("You must be logged in to download posts.");
    return;
  }

  // Track download
  if (post.id) {
    BackendApi.trackPostDownload(post.id).catch(err => console.error("Failed to track download", err));
  }

  const title = post.title || "blog-post";
  const author = (post as any).users?.name || (post as any).users || "Anonymous";
  const created = post.createdAt ? new Date(post.createdAt).toLocaleString() : "";
  const updated = post.updatedAt ? new Date(post.updatedAt).toLocaleString() : "";
  const createdDate = formatIsoDate(post.createdAt) || new Date().toISOString().slice(0, 10);
  const fileBase = `${slugify(title)}_${createdDate}`;

  // Fetch the logo and convert it to a data URL
  const response = await fetch('/LIV Blog logo design.png');
  const blob = await response.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  const logoDataUrl = await new Promise<string>(resolve => {
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
  });

  // Basic HTML formatting for print-to-PDF
  const safeContent = (post.content || "")
    .split("\n\n").map(p => `<p>${p.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`).join("\n");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${fileBase}.pdf</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding: 32px; color: #111; position: relative; }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      opacity: 0.5;
      pointer-events: none;
      width: 80%;
      height: auto;
    }
    .logo { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
    h1 { font-size: 28px; margin: 0 0 8px; }
    .meta { color: #555; margin-bottom: 16px; font-size: 12px; }
    hr { border: 0; border-top: 1px solid #ddd; margin: 16px 0; }
    p { line-height: 1.6; margin: 0 0 12px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <img src="${logoDataUrl}" class="watermark" alt="LIVBlog Watermark" />
  <div class="logo">LIVBlog</div>
  <h1>${title}</h1>
  <div class="meta">Author: ${author}${created ? ` • Created: ${created}` : ""}${updated ? ` • Updated: ${updated}` : ""}</div>
  <hr />
  <article>${safeContent}</article>
  <script>
    window.onload = function() { setTimeout(function(){ window.print(); }, 200); };
  </script>
</body>
</html>`;

  const newBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(newBlob);
  const w = window.open(url, '_blank');
  if (!w) {
    // Fallback: open data URL directly
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
    window.open(dataUrl, '_blank');
  }
}