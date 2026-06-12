import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"
import { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function generateId() {
  return uuidv4();
}

 export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T
}

export function formatZodError(
  error: ZodError
): Record<string, string> {
  const out: Record<string, string> = {}

  for (const issue of error.issues) {
    if (issue.path.length > 0) {
      const field = String(issue.path[0])
      if (!out[field]) {
        out[field] = issue.message
      }
    }
  }

  return out
}