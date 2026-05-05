import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Facebook, Instagram, Music2, MessageCircle } from 'lucide-react';
import { getActiveCoupon } from '../../lib/supabaseStore';
import { formatPrice } from '../../lib/utils';
import type { Coupon } from '../../types';
interface SocialLinks {
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

export function Footer() {
  const [social, setSocial] = useState<SocialLinks>({
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);

  const [coupon, setCoupon] = useState<Coupon | null>(null);

  // ─── جلب وسائل التواصل من Supabase ─────────────
  useEffect(() => {
    const fetchSocial = async () => {
      const { data, error } = await supabase
        .from('social_links')   // ← اسم الجدول
        .select('*')
        .single();              // صف واحد فقط

      if (error) {
        console.error('Social Links Error:', error.message);
        return;
      }

      if (data) {
        setSocial({
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          tiktok: data.tiktok || '',
          whatsapp: data.whatsapp || '',
        });
      }
    };

    fetchSocial();
  }, []);

  // ─── جلب الفئات ───────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (!error && data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  // ─── جلب الكوبون المفعل ─────────────────────
  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const coupon = await getActiveCoupon();
        setCoupon(coupon);
      } catch (error) {
        console.error('Failed to load active coupon', error);
      }
    };

    void loadCoupon();
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-3xl overflow-hidden bg-white shadow-sm flex items-center justify-center">
                <img src="/logo.png" alt="شعار متجر ملابس" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">
                  متجر ملابس
                </span>
                <p className="text-sm text-stone-400 mt-1">
                  تشكيلات عصرية وجودة مضمونة.
                </p>
              </div>
            </div>

            {/* Coupon Banner */}
            {coupon && (
              <div className="mt-4 p-3 bg-linear-to-r from-[#8b1a2b] to-[#c9a84c] rounded-lg text-center">
                <p className="text-white font-semibold text-sm">
                  {coupon.type === 'percentage'
                    ? `استخدم كود ${coupon.code} للحصول على خصم ${coupon.discount}%`
                    : `استخدم كود ${coupon.code} للحصول على خصم ${formatPrice(coupon.discount)}`
                  }
                </p>
              </div>
            )}
          </div>

          {/* روابط سريعة */}
          <div>
            <h3 className="text-white font-bold mb-4">روابط سريعة</h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className="hover:text-[#c9a84c]">
                  كل المنتجات
                </Link>
              </li>

              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.slug || cat.id}`}
                    className="hover:text-[#c9a84c]"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* خدمة العملاء */}
          <div>
            <h3 className="text-white font-bold mb-4">خدمة العملاء</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/page/return-policy" className="hover:text-[#c9a84c]">سياسة الإرجاع</Link></li>
              <li><Link to="/page/terms" className="hover:text-[#c9a84c]">الشروط</Link></li>
              <li><Link to="/page/contact" className="hover:text-[#c9a84c]">اتصل بنا</Link></li>
            </ul>
          </div>

          {/* التواصل + السوشيال */}
          <div>
            <h3 className="text-white font-bold mb-4">تواصل معنا</h3>

            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <span dir="ltr">+213 555 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <span>matjari@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                <span>الوادي، الجزائر</span>
              </li>
            </ul>

            {/* SOCIAL MEDIA */}
            <div className="flex gap-3 mt-4">

  <a
    href={social.facebook || '#'}
    target="_blank"
    rel="noreferrer"
    className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center hover:bg-[#1877F2] transition-colors"
  >
    <Facebook size={16} className="text-white" />
  </a>

  <a
    href={social.instagram || '#'}
    target="_blank"
    rel="noreferrer"
    className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center hover:bg-linear-to-tr from-pink-500 to-purple-500 transition-colors"
  >
    <Instagram size={16} className="text-white" />
  </a>

  <a
    href={social.tiktok || '#'}
    target="_blank"
    rel="noreferrer"
    className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center hover:bg-black transition-colors"
  >
    <Music2 size={16} className="text-white" />
  </a>

  <a
    href={social.whatsapp || '#'}
    target="_blank"
    rel="noreferrer"
    className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center hover:bg-[#25D366] transition-colors"
  >
    <MessageCircle size={16} className="text-white" />
  </a>

</div>
          </div>

        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between text-xs text-stone-500">
          <p>© 2026 متجر ملابس. جميع الحقوق محفوظة.</p>
          <p>developed by offitexcode</p>
        </div>
      </div>

    </footer>
  );
}