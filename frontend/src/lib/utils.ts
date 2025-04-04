import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a random ID using nanoid
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
export const generateId = () => nanoid();

// Format date
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}
