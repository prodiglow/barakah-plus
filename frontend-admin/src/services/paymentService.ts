import api from "./api";

// Base API URL
const API_URL = "/payments";

export interface Transaction {
  orderId: string;
  date: string;
  service: string;
  user: string;
  amount: number;
  status: string;
}

export interface ChartDataPoint {
  date: string;
  earnings: number;
  pending: number;
}

export interface PaymentStats {
  totalEarnings: number;
  pendingPayments: number;
  completedTransactionsCount: number;
  transactions: Transaction[];
  chartData: ChartDataPoint[];
  insights: {
    averageEarnings: number;
    highestEarningDay: string;
    pendingPaymentRatio: number;
  };
}

export const getPaymentStats = async (period: 'day' | 'month' | 'year' = 'month'): Promise<PaymentStats> => {
  const response = await api.get(`${API_URL}/stats`, { params: { period } });
  return response.data;
};
