import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Draf",
    GROUP_STAGE: "Fase Grup",
    KNOCKOUT: "Fase Knockout",
    COMPLETED: "Selesai",
    SCHEDULED: "Terjadwal",
    COMPLETED_MATCH: "Selesai",
    CANCELLED: "Dibatalkan",
    PENDING: "Menunggu",
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    GROUP_STAGE: "bg-blue-100 text-blue-700",
    KNOCKOUT: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    SCHEDULED: "bg-blue-100 text-blue-700",
    PENDING: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}

// Generate a unique slug with a short suffix
export async function generateUniqueSlug(
  name: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let attempt = 0;

  while (await checkExists(slug)) {
    attempt++;
    slug = `${base}-${attempt}`;
  }

  return slug;
}
