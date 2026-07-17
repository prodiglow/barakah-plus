import api from "./api";
import {
  CreateReminderRequest,
  UpdateReminderRequest,
  ReminderResponse,
  RemindersResponse,
} from "../types/reminder";

const API_URL = "/reminders";

/**
 * @desc Create a new reminder
 * @route POST /api/reminders
 */
export const createReminder = async (
  reminderData: CreateReminderRequest
): Promise<ReminderResponse> => {
  const response = await api.post(API_URL, reminderData);
  return response.data;
};

/**
 * @desc Get all reminders
 * @route GET /api/reminders
 */
export const getAllReminders = async (): Promise<RemindersResponse> => {
  const response = await api.get(API_URL);
  return response.data;
};

/**
 * @desc Get reminder by ID
 * @route GET /api/reminders/:id
 */
export const getReminderById = async (id: string): Promise<ReminderResponse> => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

/**
 * @desc Get reminders by OrderID
 * @route GET /api/reminders/order/:orderID
 */
export const getRemindersByOrderId = async (
  orderID: string
): Promise<RemindersResponse> => {
  const response = await api.get(`${API_URL}/order/${orderID}`);
  return response.data;
};

/**
 * @desc Update reminder
 * @route PUT /api/reminders/:id
 */
export const updateReminder = async (
  id: string,
  updateData: UpdateReminderRequest
): Promise<ReminderResponse> => {
  const response = await api.put(`${API_URL}/${id}`, updateData);
  return response.data;
};

/**
 * @desc Increment reminder count
 * @route PATCH /api/reminders/:id/increment
 */
export const incrementReminderCount = async (
  id: string
): Promise<ReminderResponse> => {
  const response = await api.patch(`${API_URL}/${id}/increment`);
  return response.data;
};

/**
 * @desc Delete reminder
 * @route DELETE /api/reminders/:id
 */
export const deleteReminder = async (id: string): Promise<ReminderResponse> => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};
