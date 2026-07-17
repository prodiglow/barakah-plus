import { Request, Response } from "express";
import { PaymentTransaction } from "../models/PaymentTransaction";

/**
 * 💾 Save a payment transaction (JazzCash response)
 * POST /api/payment-transactions
 */
export const savePaymentTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      userID,
      orderIDs,
      paymentMethod,
      totalAmount,
      jazzCashResponse,
    } = req.body;

    if (!userID) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    if (!jazzCashResponse) {
      res
        .status(400)
        .json({ success: false, message: "JazzCash response is required" });
      return;
    }

    // Determine status from response code
    const responseCode = jazzCashResponse.pp_ResponseCode || "";
    let status: "Success" | "Failed" | "Pending" = "Pending";
    if (responseCode === "000") {
      status = "Success";
    } else if (responseCode) {
      status = "Failed";
    }

    const transaction = new PaymentTransaction({
      userID,
      orderIDs: orderIDs || [],
      status,
      paymentMethod: paymentMethod || "mwallet",
      totalAmount: totalAmount || 0,
      // JazzCash fields
      pp_Amount: jazzCashResponse.pp_Amount || "",
      pp_AuthCode: jazzCashResponse.pp_AuthCode || "",
      pp_BankID: jazzCashResponse.pp_BankID || "",
      pp_BillReference: jazzCashResponse.pp_BillReference || "",
      pp_Language: jazzCashResponse.pp_Language || "",
      pp_MerchantID: jazzCashResponse.pp_MerchantID || "",
      pp_ResponseCode: jazzCashResponse.pp_ResponseCode || "",
      pp_ResponseMessage: jazzCashResponse.pp_ResponseMessage || "",
      pp_RetreivalReferenceNo: jazzCashResponse.pp_RetreivalReferenceNo || "",
      pp_SubMerchantId: jazzCashResponse.pp_SubMerchantId || "",
      pp_TxnCurrency: jazzCashResponse.pp_TxnCurrency || "",
      pp_TxnDateTime: jazzCashResponse.pp_TxnDateTime || "",
      pp_TxnRefNo: jazzCashResponse.pp_TxnRefNo || "",
      pp_SettlementExpiry: jazzCashResponse.pp_SettlementExpiry || "",
      pp_TxnType: jazzCashResponse.pp_TxnType || "",
      pp_Version: jazzCashResponse.pp_Version || "",
      ppmpf_1: jazzCashResponse.ppmpf_1 || "",
      ppmpf_2: jazzCashResponse.ppmpf_2 || "",
      ppmpf_3: jazzCashResponse.ppmpf_3 || "",
      ppmpf_4: jazzCashResponse.ppmpf_4 || "",
      ppmpf_5: jazzCashResponse.ppmpf_5 || "",
      pp_SecureHash: jazzCashResponse.pp_SecureHash || "",
    });

    const saved = await transaction.save();

    console.log(
      `✅ Payment transaction saved: ${saved._id} | Status: ${status} | TxnRef: ${saved.pp_TxnRefNo}`
    );

    res.status(201).json({
      success: true,
      message: "Payment transaction saved successfully",
      data: saved,
    });
  } catch (error: any) {
    console.error("❌ Error saving payment transaction:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📋 Get all payment transactions for a user
 * GET /api/payment-transactions/:userID
 */
export const getUserPaymentTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userID } = req.params;

    const transactions = await PaymentTransaction.find({ userID })
      .populate("orderIDs")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error("❌ Error fetching payment transactions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔍 Get a single payment transaction by ID
 * GET /api/payment-transactions/detail/:id
 */
export const getPaymentTransactionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await PaymentTransaction.findById(id)
      .populate("orderIDs")
      .populate("userID", "name email phone");

    if (!transaction) {
      res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error("❌ Error fetching payment transaction:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📋 Get all payment transactions (admin)
 * GET /api/payment-transactions/all
 */
export const getAllPaymentTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const transactions = await PaymentTransaction.find()
      .populate("userID", "name email phone")
      .populate("orderIDs")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error("❌ Error fetching all payment transactions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
