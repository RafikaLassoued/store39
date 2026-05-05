import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getCmsPage, getSocialLinks, saveCmsPage, saveSocialLinks } from '../../lib/supabaseStore';
import type { CmsPage, SocialLinks } from '../../types';

interface AdminSettingsProps {}

const cmsSlugs: CmsPage['slug'][] = ['about', 'contact', 'return-policy', 'terms'];
const cmsLabels: Record<CmsPage['slug'], string> = {
  about: 'من نحن',
  contact: 'اتصل بنا',
  'return-policy': 'سياسة الإرجاع',
  terms: 'شروط الاستخدام',
};

export function AdminSettings() {
  const [social, setSocial] = useState<SocialLinks>({ facebook: '', instagram: '', tiktok: '', whatsapp: '' });
  const [selectedSlug, setSelectedSlug] = useState<CmsPage['slug']>('about');
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsContent, setCmsContent] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      const links = await getSocialLinks();
      setSocial(links);
    };
    void run();
  }, []);

  useEffect(() => {
    const run = async () => {
      const page = await getCmsPage(selectedSlug);
      setCmsTitle(page?.title ?? cmsLabels[selectedSlug]);
      setCmsContent(page?.content ?? '');
    };
    void run();
  }, [selectedSlug]);

  const saveSocial = async () => {
    await saveSocialLinks(social);
    setMessage('تم حفظ روابط التواصل.');
  };

  const saveCms = async () => {
    await saveCmsPage({ slug: selectedSlug, title: cmsTitle, content: cmsContent });
    setMessage('تم حفظ محتوى الصفحة.');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>الإعدادات</h1>

      <section className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
        <h2 className="font-bold text-stone-800">روابط التواصل الاجتماعي</h2>
        <Input value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="Facebook URL" />
        <Input value={social.instagram} onChange={(e) => setSocial({ ...social, instagram: e.target.value })} placeholder="Instagram URL" />
        <Input value={social.tiktok} onChange={(e) => setSocial({ ...social, tiktok: e.target.value })} placeholder="TikTok URL" />
        <Input value={social.whatsapp} onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })} placeholder="WhatsApp URL" />
        <Button onClick={saveSocial}>حفظ الروابط</Button>
      </section>

      <section className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
        <h2 className="font-bold text-stone-800">CMS صفحات الموقع</h2>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value as CmsPage['slug'])}
          className="h-10 rounded-xl border border-stone-200 px-3 w-full"
        >
          {cmsSlugs.map((slug) => (
            <option key={slug} value={slug}>{cmsLabels[slug]}</option>
          ))}
        </select>
        <Input value={cmsTitle} onChange={(e) => setCmsTitle(e.target.value)} placeholder="عنوان الصفحة" />
        <textarea
          value={cmsContent}
          onChange={(e) => setCmsContent(e.target.value)}
          rows={10}
          className="w-full rounded-xl border border-stone-200 px-3 py-2"
          placeholder="محتوى الصفحة"
        />
        <Button onClick={saveCms}>حفظ المحتوى</Button>
      </section>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </div>
  );
}
