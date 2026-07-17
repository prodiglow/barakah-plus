import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentTransaction extends Document {
  // User & Order Info
  userID: mongoose.Schema.Types.ObjectId;
  orderIDs: mongoose.Schema.Types.ObjectId[];
  
  // Payment Status
  status: "Success" | "Failed" | "Pending";
  
  // JazzCash Response Fields
  pp_Amount: string;
  pp_AuthCode: string;
  pp_BankID: string;
  pp_BillReference: string;
  pp_Language: string;
  pp_MerchantID: string;
  pp_ResponseCode: string;
  pp_ResponseMessage: string;
  pp_RetreivalReferenceNo: string;
  pp_SubMerchantId: string;
  pp_TxnCurrency: string;
  pp_TxnDateTime: string;
  pp_TxnRefNo: string;
  pp_SettlementExpiry: string;
  pp_TxnType: string;
  pp_Version: string;
  ppmpf_1: string;
  ppmpf_2: string;
  ppmpf_3: string;
  ppmpf_4: string;
  ppmpf_5: string;
  pp_SecureHash: string;

  // Additional metadata
  paymentMethod: "card" | "mwallet" | "alfalah";
  totalAmount: number;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    // User & Order Info
    userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderIDs: [{ type: Schema.Types.ObjectId, ref: "Order" }],

    // Payment Status
    status: {
      type: String,
      enum: ["Success", "Failed", "Pending"],
      default: "Pending",
    },

    // JazzCash Response Fields
    pp_Amount: { type: String, default: "" },
    pp_AuthCode: { type: String, default: "" },
    pp_BankID: { type: String, default: "" },
    pp_BillReference: { type: String, default: "" },
    pp_Language: { type: String, default: "" },
    pp_MerchantID: { type: String, default: "" },
    pp_ResponseCode: { type: String, default: "" },
    pp_ResponseMessage: { type: String, default: "" },
    pp_RetreivalReferenceNo: { type: String, default: "" },
    pp_SubMerchantId: { type: String, default: "" },
    pp_TxnCurrency: { type: String, default: "" },
    pp_TxnDateTime: { type: String, default: "" },
    pp_TxnRefNo: { type: String, default: "" },
    pp_SettlementExpiry: { type: String, default: "" },
    pp_TxnType: { type: String, default: "" },
    pp_Version: { type: String, default: "" },
    ppmpf_1: { type: String, default: "" },
    ppmpf_2: { type: String, default: "" },
    ppmpf_3: { type: String, default: "" },
    ppmpf_4: { type: String, default: "" },
    ppmpf_5: { type: String, default: "" },
    pp_SecureHash: { type: String, default: "" },

    // Additional metadata
    paymentMethod: {
      type: String,
      enum: ["card", "mwallet", "alfalah"],
      default: "mwallet",
    },
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for quick lookups
PaymentTransactionSchema.index({ userID: 1 });
PaymentTransactionSchema.index({ pp_TxnRefNo: 1 });
PaymentTransactionSchema.index({ pp_BillReference: 1 });

export const PaymentTransaction = mongoose.model<IPaymentTransaction>(
  "PaymentTransaction",
  PaymentTransactionSchema
);
