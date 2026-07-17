// User type for populated UserID
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
}

// Scholar type for populated ScholarID
export interface Scholar {
  _id: string;
  scholarID: number;
  scholarName: string;
  rating: number;
  ProfileImg: string;
  fee: number;
}

// Order type with populated UserID and ScholarID
export interface OrderWithDetails {
  _id: string;
  OrderTitle: string;
  Status: "Pending Admin Review" | "Rejected By Admin" | "User Review Requested" | "Awaiting User Revision" | "Sent To Scholar" | "In Progress By Scholar" | "Revision Requested By Admin" | "Approved By Admin" | "Delivered To User" | "Completed" | "Cancelled" | "Confirmed" | "Scholar Submitted – Pending Review";
  UserID: User;
  ScholarID: Scholar;
  OrderAmt: number;
  PaymentStatus: "Unpaid" | "Paid" | "Refunded" | "Pending";
  OrderID: number;
  name?: string;
  motherName?: string;
  gender?: string;
  phone?: string;
  Sect?: string;
  Reason?: string;
  PrefferedLanguage?: string;
  message?: string;
  AudioURL?: string;
  createdAt?: string;
  updatedAt?: string;
  isReadByAdmin?: boolean;
  ScholarHadiyapaid?: boolean;
}

// Participant type for user conversation
export interface Participant {
  _id: string;
  name: string;
  email: string;
}

// User Conversation type
export interface UserConversation {
  _id: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

// Message sender type
export interface MessageSender {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  
  // Scholar specific fields
  scholarName?: string;
  rating?: number;
  ProfileImg?: string;
  fee?: number;
  scholarID?: number;
}

// Message type
export interface Message {
  _id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  type: "user" | "scholar" | "adminToScholar" | "adminToUser";
  createdAt: string;
  updatedAt: string;
  audioUrl?: string;
  __v?: number;
}

// Latest message type (same as Message)
export interface LatestMessage {
  _id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  type: "user" | "scholar" | "adminToScholar" | "adminToUser";
  createdAt: string;
  updatedAt: string;
  audioUrl?: string;
  __v?: number;
}

// Order with user conversation item
export interface OrderWithUserConversation {
  order: OrderWithDetails;
  conversation: UserConversation;
  messages: Message[];
  latestMessage: LatestMessage;
  messageCount: number;
}

// API response type for orders with user conversations
export interface OrdersWithUserConversationsResponse {
  message: string;
  count: number;
  ordersWithConversations: OrderWithUserConversation[];
}

