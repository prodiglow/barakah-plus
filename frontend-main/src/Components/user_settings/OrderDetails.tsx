// OrderDetails.tsx
import React from "react";
import { Typography, Paper } from "@mui/material";

interface OrderDetailsProps {
  order: {
    id: number;
    title: string;
    status: string;
  };
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: "0px 3px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Typography variant="h6" fontWeight={600} mb={1}>
        {order.title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Status: {order.status}
      </Typography>
      <Typography variant="body2" mt={1}>
        Here you can show more details about <b>{order.title}</b>, such as
        product list, invoice, delivery status, etc.
      </Typography>
    </Paper>
  );
};

export default OrderDetails;
