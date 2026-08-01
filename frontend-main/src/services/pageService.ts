const CMS_URL = import.meta.env.VITE_CMS_URL || 'http://localhost:3000';

export interface PageData {
    title: string;
    slug: string;
    content: string; // HTML
    seo?: { metaTitle?: string; metaDescription?: string };
}

interface PayloadPage {
    title: string;
    slug: string;
    contentHtml?: string;
    seo?: { metaTitle?: string; metaDescription?: string };
}

interface PayloadListResponse<T> {
    docs: T[];
}

export const pageService = {
    getPageBySlug: async (slug: string): Promise<PageData> => {
        const res = await fetch(
            `${CMS_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
        );
        if (!res.ok) throw new Error(`Failed to fetch page: ${res.status}`);
        const data: PayloadListResponse<PayloadPage> = await res.json();
        if (!data.docs.length) throw new Error('Page not found');
        const doc = data.docs[0];
        return {
            title: doc.title,
            slug: doc.slug,
            content: doc.contentHtml || '',
            seo: doc.seo,
        };
    },
};
