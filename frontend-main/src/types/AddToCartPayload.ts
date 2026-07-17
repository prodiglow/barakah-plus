export interface AddToCartPayload {
  userID: string | null;
  scholarID: string; // just the ID
  service: string;
  fee: number;
  name: string;
  motherName?: string;
  gender: string;
  contact: string;
  sect: string;
  reason: string;
  language?: string;
  message?: string;
  audioUrl?: string;
  // Quran Khawani specific fields (optional)
  quranKhawaniDate?: string;
  quranKhawaniTimeSlot?: string;
  featureOnHomePage?: boolean;
  // Wazaif & Azkar specific field
  selectWazifa?: string;
}
