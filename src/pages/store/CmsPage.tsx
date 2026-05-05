import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCmsPage } from '../../lib/supabaseStore';
import type { CmsPage as CmsPageType } from '../../types';

const validSlugs: CmsPageType['slug'][] = ['about', 'contact', 'return-policy', 'terms'];

export function CmsPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<CmsPageType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!slug || !validSlugs.includes(slug as CmsPageType['slug'])) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCmsPage(slug as CmsPageType['slug']);
        setPage(data);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12">جاري التحميل...</div>;
  if (!page) return <div className="max-w-4xl mx-auto px-4 py-12">المحتوى غير متوفر حالياً.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-6" style={{ fontFamily: 'Tajawal, sans-serif' }}>
        {page.title}
      </h1>
      <div className="prose prose-stone max-w-none whitespace-pre-wrap leading-8 text-stone-700">
        {page.content}
      </div>
    </div>
  );
}
