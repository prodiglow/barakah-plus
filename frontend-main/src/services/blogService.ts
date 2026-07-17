import api from './api';

export interface BlogData {
    _id?: string;
    blogID?: number;
    title: string;
    slug?: string;
    content: string;
    excerpt: string;
    coverImage: string;
    images: string[];
    tags: string[];
    author: string;
    isFeatured: boolean;
    isPublished: boolean;
    status?: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
}

export const blogService = {
    getAllBlogs: async (): Promise<{ blogs: BlogData[], count: number }> => {
        const response = await api.get('/blogs');
        return response.data;
    },

    getBlogById: async (id: string): Promise<{ blog: BlogData }> => {
        const response = await api.get(`/blogs/${id}`);
        return response.data;
    },

    getBlogBySlug: async (slug: string): Promise<{ blog: BlogData }> => {
        const response = await api.get(`/blogs/slug/${slug}`);
        return response.data;
    },
};
