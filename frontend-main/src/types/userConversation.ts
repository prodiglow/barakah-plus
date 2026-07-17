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
  Status: "Confirmed" | "Pending Admin Review" | "Unsafe Requires Edit" | "Completed";
  UserID: User;
  ScholarID: Scholar;
  OrderAmt: number;
  PaymentStatus: "Unpaid" | "Paid" | "Refunded" | "Pending";
  OrderID: number;
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
}

// Message type
export interface Message {
  _id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  type: "user" | "scholar" | "adminToUser" | "adminToScholar";
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
  type: "user" | "scholar" | "adminToUser" | "adminToScholar";
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

// Conversation with order details (for getUserChat)
export interface ConversationWithOrder {
  _id: string;
  participants: Participant[];
  orderId: {
    _id: string;
    OrderTitle: string;
    Status: "Confirmed" | "Pending Admin Review" | "Unsafe Requires Edit" | "Completed";
  };
  createdAt: string;
  updatedAt: string;
}

// API response type for user chat (getUserChat)
export interface UserChatResponse {
  conversation: ConversationWithOrder;
  messages: Message[];
}

// Conversation with latest message (for getUserConversations)
export interface ConversationWithLatestMessage {
  _id: string;
  participants: Participant[];
  orderId: {
    _id: string;
    OrderTitle: string;
    Status: "Confirmed" | "Pending Admin Review" | "Unsafe Requires Edit" | "Completed";
    OrderID: number;
    feedbackGiven?: boolean;
    feedbackPopupCount?: number;
    OrderAmt?: number;
  };
  createdAt: string;
  updatedAt: string;
  latestMessage: LatestMessage | null;
}

// API response type for user conversations (getUserConversations)
export interface UserConversationsResponse {
  message: string;
  count: number;
  conversations: ConversationWithLatestMessage[];
}

