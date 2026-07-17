import express from "express";
import {
  addToCart,
  getUserCart,
  removeFromCart,
  updateCartItem,
  clearUserCart,
  moveCartToOrder,
} from "../controllers/cartController";

const router = express.Router();

router.post("/", addToCart);                // Add new item
router.get("/:userID", getUserCart);        // Get user cart
router.delete("/:id", removeFromCart);      // Remove one item
router.put("/:id", updateCartItem);         // Update an item
router.delete("/clear/:userID", clearUserCart); // Clear full cart
router.post("/move-to-order", moveCartToOrder); // Clear full cart

export default router;
