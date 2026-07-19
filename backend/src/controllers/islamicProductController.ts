import { Request, Response } from 'express';
import { IslamicProduct } from '../models/IslamicProduct';

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryName } = req.params;
    
    // Decode category name to handle URL encoding (e.g., "Prayers%20Mats%20&%20Caps")
    const decodedCategory = decodeURIComponent(String(categoryName));

    // Use regex for flexible matching (case-insensitive) to allow "Prayer Mat" to find products named "...Prayer Mat..."
    const searchRegex = new RegExp(decodedCategory, 'i');

    const products = await IslamicProduct.find({
      $or: [
        { category: searchRegex },
        { name: searchRegex }
      ]
    });

    if (!products.length) {
      return res.status(404).json({ message: 'No products found for this category' });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await IslamicProduct.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await IslamicProduct.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};
