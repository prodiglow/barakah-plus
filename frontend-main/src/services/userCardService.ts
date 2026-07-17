import axios from "axios";
import { UserCard } from "../types/userCard";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/cards`; 
//const API_BASE_URL = "http://localhost:5000/api/cards"; 

/**
 * 🔹 Get all cards for a specific user
 */
export const getUserCards = async (userID: string): Promise<UserCard[]> => {
  const res = await axios.get<{ success: boolean; data: UserCard[] }>(`${API_BASE_URL}/${userID}`);
  return res.data.data;
};

/**
 * 🔹 Add a new card
 */
export const addUserCard = async (card: {
  userID: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  nameOnCard: string;
}): Promise<UserCard> => {
  const res = await axios.post<{ success: boolean; data: UserCard }>(API_BASE_URL, card);
  return res.data.data;
};

/**
 * 🔹 Delete a card
 */
export const deleteUserCard = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};
