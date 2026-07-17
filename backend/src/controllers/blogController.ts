import { Request, Response } from "express";
import { Blog } from "../models/Blog";

// Helper: generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// ➕ CREATE BLOG
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, coverImage, images, tags, author, isFeatured, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Generate unique slug
    let slug = generateSlug(title);
    const existingSlug = await Blog.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const status = isPublished ? "published" : "draft";

    const blog = new Blog({
      title,
      slug,
      content,
      excerpt: excerpt || "",
      coverImage: coverImage || "",
      images: images || [],
      tags: tags || [],
      author: author || "Admin",
      isFeatured: isFeatured || false,
      isPublished: isPublished || false,
      status,
    });

    await blog.save();

    res.status(201).json({ message: "✅ Blog created successfully", blog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📋 GET ALL BLOGS
export const getAllBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "✅ Blogs fetched successfully",
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔍 GET BLOG BY ID
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "✅ Blog fetched successfully", blog });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔍 GET BLOG BY SLUG
export const getBlogBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "✅ Blog fetched successfully", blog });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✏️ UPDATE BLOG
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, coverImage, images, tags, author, isFeatured, isPublished } = req.body;

    const updates: any = {};
    if (title !== undefined) {
      updates.title = title;
      // Regenerate slug if title changes
      let slug = generateSlug(title);
      const existingSlug = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
      updates.slug = slug;
    }
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (coverImage !== undefined) updates.coverImage = coverImage;
    if (images !== undefined) updates.images = images;
    if (tags !== undefined) updates.tags = tags;
    if (author !== undefined) updates.author = author;

    if (isFeatured !== undefined) {
      updates.isFeatured = typeof isFeatured === "string" ? isFeatured === "true" : isFeatured;
    }

    if (isPublished !== undefined) {
      const published = typeof isPublished === "string" ? isPublished === "true" : isPublished;
      updates.isPublished = published;
      updates.status = published ? "published" : "draft";
    }

    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "✅ Blog updated successfully", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ❌ DELETE BLOG
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "🗑️ Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔄 TOGGLE FEATURED
export const toggleFeatured = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.isFeatured = !blog.isFeatured;
    await blog.save();

    res.status(200).json({ message: "✅ Featured status toggled", blog });
  } catch (error) {
    console.error("Error toggling featured:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 🔄 TOGGLE PUBLISHED
export const togglePublished = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.isPublished = !blog.isPublished;
    blog.status = blog.isPublished ? "published" : "draft";
    await blog.save();

    res.status(200).json({ message: "✅ Published status toggled", blog });
  } catch (error) {
    console.error("Error toggling published:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
