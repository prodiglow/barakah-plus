import express from 'express';
import { getProductsByCategory, getProductById, getAllProducts } from '../controllers/islamicProductController';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/category/:categoryName', getProductsByCategory);
router.get('/:id', getProductById);

export default router;
