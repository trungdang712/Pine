import { vi } from "./vi";
import { en } from "./en";
import type { Language, Translations } from "../types";

export const translations: Record<Language, Translations> = {
  vi,
  en,
};

export { vi, en };
