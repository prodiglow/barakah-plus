export interface Order {
  _id?: string;
  audioUrl:string;
  OrderTitle: string;
  OrderID: number;
  Status: "Pending Admin Review" | "Rejected By Admin" | "User Review Requested" | "Awaiting User Revision" | "Sent To Scholar" | "In Progress By Scholar" | "Revision Requested By Admin" | "Approved By Admin" | "Delivered To User" | "Completed" | "Cancelled" | "Confirmed" | "Scholar Submitted – Pending Review";
  UserID: string;
  OrderAmt: number;
  PaymentStatus: "Unpaid" | "Paid" | "Refunded" | "Pending";
  name?: string;
  motherName?: string;
  gender?: string;
  phoneNumber?: string;
  phone?: string;
  Sect?: string;
  Reason?: string;
  PrefferedLanguage?: string;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  isReadByUser?: boolean;
  isReadByAdmin?: boolean;
  ScholarHadiyapaid?: boolean;
  ScholarID?: any;
  // Quran Khawani specific fields
  quranKhawaniDate?: string;
  quranKhawaniTimeSlot?: string;
  featureOnHomePage?: boolean;
  isEventCreated?: boolean;
  selectWazifa?: string;
}