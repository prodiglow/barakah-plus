// src/types/Event.ts

export interface IEvent {
  _id?: string; // optional because it’s added by MongoDB
  eventID: number;
  eventTitle: string;
  eventSpecial: string;
  eventLocation: string;
  eventDate: string; // ISO string (from backend)
  eventPic: string;
  participants?: IParticipant[]; // optional populated field
  createdAt?: string;
  updatedAt?: string;
}

export interface IParticipant {
  _id: string;
  name: string;
  email: string;
  profileImg?: string;
  role?: string; // if you include role from EventParticipant
}
