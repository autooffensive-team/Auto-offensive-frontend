import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const docsAppUrl = (process.env.NEXT_PUBLIC_DOCS_APP_URL || '').replace(/\/$/, '');
export const toDocsUrl = (path: string) => docsAppUrl ? `${docsAppUrl}${path}` : `/docs${path}`;
