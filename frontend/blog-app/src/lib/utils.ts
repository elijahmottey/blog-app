import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(iso?: string) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch {
        return iso;
    }
}

export function excerpt(text?: string, length = 160) {
    if (!text) return "";
    const stripped = text.replace(/<[^>]+>/g, "");
    return stripped.length > length ? stripped.slice(0, length).trim() + "..." : stripped;
}

 export function getAuthorName(user?: { name?: string; email?: string }) {
    if (!user) return "Anonymous";
    if (user.name && user.name !== "Anonymous" && user.name.length > 0) {
        return user.name;
    }
    if (user.email) {
        return user.email.split('@')[0];
    }
    return "Anonymous";
}
