export interface UserCard {
  _id: string;
  userID: string;
  cardNumber: string; // e.g. ************0004
  expiryDate: string; // e.g. "11/26"
  cvc: string;
  nameOnCard: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
