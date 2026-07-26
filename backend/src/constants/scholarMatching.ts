// Shared constants for scholar matching (Free Personal Dua / Quran Khawani auto-assignment).
// These exact literal values are mirrored in the admin-frontend Gender/Sect fields
// and match the casing already used by frontend-main's existing gender select.

export const SECTS = ["Shia", "Deobandi", "Barelvi", "Ahl-e-Hadith"] as const;
export type Sect = typeof SECTS[number];

export const GENDERS = ["male", "female"] as const;
export type Gender = typeof GENDERS[number];
