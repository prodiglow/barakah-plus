import { Order } from "./order";

export interface Reminder {
  _id?: string;
  OrderID: string | Order;
  reminderCount: number;
  IsSendReminder: 0 | 1 | boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReminderRequest {
  OrderID: string;
  reminderCount?: number;
  IsSendReminder?: 0 | 1 | boolean;
}

export interface UpdateReminderRequest {
  reminderCount?: number;
  IsSendReminder?: 0 | 1 | boolean;
}

export interface ReminderResponse {
  success: boolean;
  message?: string;
  data: Reminder;
}

export interface RemindersResponse {
  success: boolean;
  data: Reminder[];
}

