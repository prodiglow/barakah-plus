import { Request, Response } from "express";
import { Order } from "../models/Orders";
import mongoose from "mongoose";

export const getPaymentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Calculate Total Earnings and Pending Payments
    const earningsStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: {
              $cond: [{ $eq: ["$PaymentStatus", "Paid"] }, "$OrderAmt", 0],
            },
          },
          pendingPayments: {
            $sum: {
              $cond: [{ $eq: ["$PaymentStatus", "Pending"] }, "$OrderAmt", 0],
            },
          },
          completedTransactionsCount: {
            $sum: {
              $cond: [{ $eq: ["$PaymentStatus", "Paid"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const stats = earningsStats[0] || {
      totalEarnings: 0,
      pendingPayments: 0,
      completedTransactionsCount: 0,
    };

    // 2. Determine Time Period (Moved up for reuse)
    const { period } = req.query;
    let startDate = new Date();
    let groupByFormat = "%Y-%m-%d";
    let labelFormat: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }; // Default (Month view)

    if (period === "year") {
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupByFormat = "%Y-%m";
        labelFormat = { month: "short", year: "numeric" };
    } else if (period === "day") {
        startDate.setHours(0, 0, 0, 0); // Start of today
        groupByFormat = "%H"; // Group by hour
        labelFormat = { hour: "numeric", hour12: true }; 
    } else {
        // Default: Month (Last 30 days)
        startDate.setDate(startDate.getDate() - 30);
    }

    // 3. Fetch Transactions (Filtered by Date, No Limit)
    const transactions = await Order.find({
      createdAt: { $gte: startDate }
    })
      .populate("UserID", "name") // Assuming User model has 'name' field
      .sort({ createdAt: -1 })
      .select("OrderID createdAt OrderTitle UserID OrderAmt PaymentStatus");

    const formattedTransactions = transactions.map((order: any) => ({
      orderId: `#${order.OrderID}`,
      date: new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      service: order.OrderTitle, // Using OrderTitle as Service name
      user: order.UserID ? order.UserID.name : "Unknown",
      amount: order.OrderAmt,
      status: order.PaymentStatus,
    }));

    // 4. Chart Data (Earnings by Date)

    const chartAgg = await Order.aggregate([
      {
        $match: {
          PaymentStatus: { $in: ["Paid", "Pending"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
          earnings: {
            $sum: {
              $cond: [{ $eq: ["$PaymentStatus", "Paid"] }, "$OrderAmt", 0],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$PaymentStatus", "Pending"] }, "$OrderAmt", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const chartData = chartAgg.map((item) => {
        let dateLabel = item._id;
        if (period === "day") {
             // item._id is "HH" (00-23)
             const hour = parseInt(item._id);
             const date = new Date();
             date.setHours(hour, 0, 0, 0);
             dateLabel = date.toLocaleTimeString("en-GB", labelFormat);
        } else {
            // "YYYY-MM-DD" or "YYYY-MM"
             const date = new Date(item._id);
             dateLabel = date.toLocaleDateString("en-GB", labelFormat);
        }
        
        return {
            date: dateLabel,
            earnings: item.earnings,
            pending: item.pending
        }
    });

    // 4. Insights
    const averageEarnings = stats.completedTransactionsCount > 0 
        ? Math.round(stats.totalEarnings / stats.completedTransactionsCount) 
        : 0;

    let highestEarningDay = { date: "N/A", earnings: 0 };
    if (chartAgg.length > 0) {
        const max = chartAgg.reduce((prev, current) => (prev.earnings > current.earnings) ? prev : current);
        const maxDate = new Date(max._id);
        highestEarningDay = {
            date: maxDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            earnings: max.earnings
        }
    }

    const totalVolume = stats.totalEarnings + stats.pendingPayments;
    const pendingPaymentRatio = totalVolume > 0 
        ? Math.round((stats.pendingPayments / totalVolume) * 100) 
        : 0;

    res.json({
      totalEarnings: stats.totalEarnings,
      pendingPayments: stats.pendingPayments,
      completedTransactionsCount: stats.completedTransactionsCount,
      transactions: formattedTransactions,
      chartData,
      insights: {
        averageEarnings,
        highestEarningDay: highestEarningDay.date,
        pendingPaymentRatio,
      },
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
