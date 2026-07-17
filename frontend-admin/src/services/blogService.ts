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

export const getAllBlogs = async (): Promise<{ blogs: BlogData[], count: number }> => {
    const response = await api.get('/blogs');
    return response.data;
};

export const getBlogById = async (id: string): Promise<BlogData> => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
};

export const createBlog = async (data: Partial<BlogData>): Promise<BlogData> => {
    const response = await api.post('/blogs/insert', data);
    return response.data;
};

export const updateBlog = async (id: string, data: Partial<BlogData>): Promise<BlogData> => {
    const response = await api.put(`/blogs/update/${id}`, data);
    return response.data;
};

export const deleteBlog = async (id: string): Promise<void> => {
    await api.delete(`/blogs/delete/${id}`);
};

export const toggleFeatured = async (id: string): Promise<BlogData> => {
    const response = await api.patch(`/blogs/toggle-featured/${id}`);
    return response.data;
};

export const togglePublished = async (id: string): Promise<BlogData> => {
    const response = await api.patch(`/blogs/toggle-published/${id}`);
    return response.data;
};
