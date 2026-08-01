const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000';

export interface BlogData {
    _id?: string;
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

interface PayloadPost {
    id: string;
    title: string;
    slug: string;
    content?: unknown;
    contentHtml?: string;
    excerpt?: string;
    coverImage?: { url?: string } | string | null;
    tags?: Array<{ tag?: string }>;
    author?: string;
    featured?: boolean;
    publishedAt?: string;
    _status?: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
}

interface PayloadListResponse<T> {
    docs: T[];
    totalDocs: number;
}

// Maps a Payload `posts` document back to the shape the existing frontend
// pages (AllBlogsPage, BlogDetailPage) already expect. `images` has no
// Payload equivalent (in-body images now live in the rich text / media
// library) and `blogID` is dropped (routing uses `slug`) — see
// docs/superpowers/specs/2026-08-01-payload-cms-integration-design.md.
function mapPost(doc: PayloadPost): BlogData {
    const coverImage =
        typeof doc.coverImage === 'object' && doc.coverImage
            ? doc.coverImage.url || ''
            : (doc.coverImage as string) || '';

    return {
        _id: doc.id,
        title: doc.title,
        slug: doc.slug,
        content: doc.contentHtml || '',
        excerpt: doc.excerpt || '',
        coverImage,
        images: [],
        tags: (doc.tags || []).map((t) => t.tag || '').filter(Boolean),
        author: doc.author || 'Admin',
        isFeatured: Boolean(doc.featured),
        isPublished: doc._status === 'published',
        status: doc._status,
        createdAt: doc.publishedAt || doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

export const blogService = {
    getAllBlogs: async (): Promise<{ blogs: BlogData[]; count: number }> => {
        const res = await fetch(
            `${CMS_URL}/api/posts?where[_status][equals]=published&sort=-publishedAt&limit=100`,
        );
        if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
        const data: PayloadListResponse<PayloadPost> = await res.json();
        return { blogs: data.docs.map(mapPost), count: data.totalDocs };
    },

    getBlogById: async (id: string): Promise<{ blog: BlogData }> => {
        const res = await fetch(`${CMS_URL}/api/posts/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
        const doc: PayloadPost = await res.json();
        return { blog: mapPost(doc) };
    },

    getBlogBySlug: async (slug: string): Promise<{ blog: BlogData }> => {
        const res = await fetch(
            `${CMS_URL}/api/posts?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&limit=1`,
        );
        if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
        const data: PayloadListResponse<PayloadPost> = await res.json();
        if (!data.docs.length) throw new Error('Post not found');
        return { blog: mapPost(data.docs[0]) };
    },
};
