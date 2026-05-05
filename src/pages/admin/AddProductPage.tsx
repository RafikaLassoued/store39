import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';// ← تأكد من المسار الصحيح

// ─── Types ───────────────────────────────────────────────
interface ProductColor {
  hex: string;
  name: string;
  nameAr: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  nameEn: string;
  slug: string;
  description: string;
  price: string;
  oldPrice: string;
  categoryId: string;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  isNew: boolean;
  rating: number;
  reviewCount: string;
}

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\u0621-\u064A-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42'];

const PRESET_COLORS: ProductColor[] = [
  { hex: '#1a1a1a', name: 'Black',   nameAr: 'أسود'    },
  { hex: '#ffffff', name: 'White',   nameAr: 'أبيض'    },
  { hex: '#8b1a2b', name: 'Burgundy',nameAr: 'عنابي'   },
  { hex: '#2563eb', name: 'Blue',    nameAr: 'أزرق'    },
  { hex: '#16a34a', name: 'Green',   nameAr: 'أخضر'    },
  { hex: '#ca8a04', name: 'Gold',    nameAr: 'ذهبي'    },
  { hex: '#7c3aed', name: 'Purple',  nameAr: 'بنفسجي'  },
  { hex: '#db2777', name: 'Pink',    nameAr: 'وردي'    },
  { hex: '#ea580c', name: 'Orange',  nameAr: 'برتقالي' },
  { hex: '#64748b', name: 'Gray',    nameAr: 'رمادي'   },
  { hex: '#92400e', name: 'Brown',   nameAr: 'بني'     },
  { hex: '#0e7490', name: 'Teal',    nameAr: 'زيتي'    },
];

// ─── Helper Components ───────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-stone-50/60">
        <span className="text-xl">{icon}</span>
        <h2 className="font-bold text-stone-700 text-sm tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-stone-500 tracking-wider uppercase">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            ⚠ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-sm font-medium text-stone-800 bg-stone-50
   placeholder:text-stone-300 outline-none transition-all duration-200
   focus:bg-white focus:border-[#8b1a2b] focus:ring-2 focus:ring-[#8b1a2b]/10
   ${hasError ? 'border-red-400 bg-red-50/30' : 'border-stone-200'}`;

// ─── Main Component ───────────────────────────────────────
export function AddProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const adminPath = pathname.split('/').slice(0, 2).join('/');

  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get('id');
  const isEditMode = !!editId;

  // ── State ─────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const [form, setForm] = useState<ProductFormData>({
    name: '', nameEn: '', slug: '', description: '',
    price: '', oldPrice: '', categoryId: '',
    sizes: [], colors: [], images: [],
    isNew: true, rating: 5, reviewCount: '0',
  });

  // ── جلب الفئات من Supabase ────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name')
          .abortSignal(abortController.signal);

        if (!isMounted) return;

        if (error) {
          console.error('خطأ في جلب الفئات:', error.message);
          setSupabaseError('فشل في جلب الفئات: ' + error.message);
        } else {
          setCategories(data || []);
        }
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('تم إلغاء طلب جلب الفئات');
          return;
        }
        console.error('خطأ في جلب الفئات:', error);
        setSupabaseError('فشل في جلب الفئات: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  // ── جلب المنتج عند التعديل ────────────────────────────
  useEffect(() => {
    if (!isEditMode || !editId) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')        // ← اسم الجدول في Supabase
        .select('*')
        .eq('id', editId)
        .single();

      if (error) {
        console.error('خطأ في جلب المنتج:', error.message);
        setSupabaseError('فشل في جلب بيانات المنتج: ' + error.message);
        return;
      }

      if (data) {
        setForm({
          name:        data.name        || '',
          nameEn:      data.name_en     || '',
          slug:        data.slug        || '',
          description: data.description || '',
          price:       String(data.price || ''),
          oldPrice:    data.old_price ? String(data.old_price) : '',
          categoryId:  data.category_id || '',
          sizes:       data.sizes       || [],
          colors:      (data.colors     || []).map((c: { hex?: string; name?: string; name_ar?: string }) => ({
            hex:    c.hex || '',
            name:   c.name || '',
            nameAr: c.name_ar || '',   // jsonb يخزّن name_ar وليس nameAr
          })),
          images:      data.images      || [],
          isNew:       data.is_new      ?? true,
          rating:      data.rating      ?? 5,
          reviewCount: String(data.review_count ?? 0),
        });
      }
    };

    fetchProduct();
  }, [editId, isEditMode]);

  // ── رفع الصور إلى Supabase Storage ───────────────────
  /**
   * يرفع صورة إلى bucket "product-images" في Supabase Storage
   * ويرجع الـ public URL
   * إذا كانت الصورة base64 (محلية) يرفعها، أما إذا كانت URL فيعيدها مباشرة
   */
  // ── رفع الصور إلى Supabase Storage ───────────────────
const uploadImageToStorage = async (base64OrUrl: string): Promise<string> => {
  if (base64OrUrl.startsWith('http')) return base64OrUrl;

  const res = await fetch(base64OrUrl);
  const blob = await res.blob();
  const ext = blob.type.split('/')[1] || 'jpg';

  const fileName = `images/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  // ✅ FIXED: bucket name = products
  const { error } = await supabase.storage
    .from('products')   // 👈 كان خطأ product-images
    .upload(fileName, blob, {
      contentType: blob.type,
      upsert: false,
    });

  if (error) {
    throw new Error('فشل رفع الصورة: ' + error.message);
  }

  const { data: urlData } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};
  // ── Helpers ───────────────────────────────────────────
  const set = <K extends keyof ProductFormData>(key: K) => (val: ProductFormData[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  };

  const handleNameChange = (v: string) => {
    setForm((f) => ({ ...f, name: v, slug: slugify(v) }));
    setErrors((e) => { const n = { ...e }; delete n.name; return n; });
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((f) => ({ ...f, images: [...f.images, ev.target?.result as string] }));
        setErrors((e) => { const n = { ...e }; delete n.images; return n; });
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleSize = (size: string) =>
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));

  const toggleColor = (color: ProductColor) =>
    setForm((f) => {
      const exists = f.colors.find((c) => c.hex === color.hex);
      return { ...f, colors: exists ? f.colors.filter((c) => c.hex !== color.hex) : [...f.colors, color] };
    });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())        e.name        = 'اسم المنتج مطلوب';
    if (!form.price)              e.price       = 'السعر مطلوب';
    if (!form.categoryId)        e.categoryId  = 'الفئة مطلوبة';
    if (!form.description.trim()) e.description = 'الوصف مطلوب';
    if (form.images.length === 0) e.images      = 'يجب إضافة صورة واحدة على الأقل';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── حفظ المنتج في Supabase ────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setSupabaseError(null);

    try {
      // 1. رفع الصور الجديدة (base64) إلى Storage
      const uploadedImages = await Promise.all(
        form.images.map((img) => uploadImageToStorage(img))
      );

      // 2. بناء كائن البيانات — يطابق أعمدة جدول products في schema
      // الأعمدة: id, name, name_en, slug, description, price, old_price,
      //          category_id, sizes, colors (jsonb), images, is_new,
      //          rating, review_count, in_stock, featured, created_at
      const productData = {
        name:         form.name,
        name_en:      form.nameEn || null,
        slug:         form.slug || slugify(form.name),
        description:  form.description,
        price:        Number(form.price),
        old_price:    form.oldPrice ? Number(form.oldPrice) : null,
        category_id:  form.categoryId || null,
        sizes:        form.sizes,                        // text[]
        colors:       form.colors.map((c) => ({          // jsonb
          hex:     c.hex,
          name:    c.name,
          name_ar: c.nameAr,
        })),
        images:       uploadedImages,                    // text[]
        is_new:       form.isNew,
        rating:       form.rating,
        review_count: Number(form.reviewCount || 0),
        in_stock:     true,
        featured:     false,
      };

      if (isEditMode && editId) {
        // ── تعديل منتج موجود ──
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editId);

        if (error) throw new Error('فشل تعديل المنتج: ' + error.message);

      } else {
        // ── إضافة منتج جديد — id و created_at يُولَّدان تلقائياً بـ default
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw new Error('فشل إضافة المنتج: ' + error.message);
      }

      setSaved(true);
      setTimeout(() => navigate(`${adminPath}/products`), 1400);

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(error);
      setSupabaseError(error.message || 'حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf8f5] p-4 md:p-8" dir="rtl">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-stone-300 transition-all"
          >
            ←
          </button>
          <div>
            <p className="text-xs text-stone-400 font-medium">لوحة التحكم / المنتجات</p>
            <h1 className="text-xl font-bold text-stone-800" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              {isEditMode ? '✏️ تعديل المنتج' : 'إضافة منتج جديد'}
            </h1>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={saving || saved}
          className="flex items-center gap-2 bg-[#8b1a2b] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#8b1a2b]/20 disabled:opacity-60 transition-all"
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري الحفظ...</>
          ) : saved ? <>✅ تم الحفظ</>
          : <>{isEditMode ? '💾 حفظ التعديلات' : '💾 حفظ المنتج'}</>}
        </motion.button>
      </motion.div>

      {/* رسالة خطأ Supabase */}
      <AnimatePresence>
        {supabaseError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm font-medium"
          >
            ❌ {supabaseError}
            <button
              className="mr-auto text-red-400 hover:text-red-600 text-lg"
              onClick={() => setSupabaseError(null)}
            >×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          <Section title="المعلومات الأساسية" icon="📦">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="اسم المنتج بالعربية" error={errors.name}>
                <input className={inputClass(!!errors.name)} placeholder="مثال: حقيبة جلدية فاخرة"
                  value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
              </Field>
              <Field label="اسم المنتج بالإنجليزية">
                <input className={inputClass()} placeholder="Leather Luxury Bag" dir="ltr"
                  value={form.nameEn} onChange={(e) => set('nameEn')(e.target.value)} />
              </Field>
              <Field label="الرابط (Slug)">
                <input className={inputClass() + ' text-stone-400'} value={form.slug} readOnly dir="ltr" placeholder="يتولد تلقائياً" />
              </Field>
              <Field label="الفئة" error={errors.categoryId}>
                <select
                  className={inputClass(!!errors.categoryId)}
                  value={form.categoryId}
                  onChange={(e) => set('categoryId')(e.target.value)}
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'جاري التحميل...' : 'اختر الفئة'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="وصف المنتج" error={errors.description}>
                <textarea className={inputClass(!!errors.description) + ' resize-none h-28'}
                  placeholder="اكتب وصفاً تفصيلياً للمنتج..."
                  value={form.description} onChange={(e) => set('description')(e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="التسعير" icon="💰">
            <div className="grid grid-cols-2 gap-4">
              <Field label="السعر الحالي (دج)" error={errors.price}>
                <div className="relative">
                  <input type="number" className={inputClass(!!errors.price) + ' pl-12'} placeholder="0" dir="ltr"
                    value={form.price} onChange={(e) => set('price')(e.target.value)} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">دج</span>
                </div>
              </Field>
              <Field label="السعر القديم — اختياري">
                <div className="relative">
                  <input type="number" className={inputClass() + ' pl-12'} placeholder="0" dir="ltr"
                    value={form.oldPrice} onChange={(e) => set('oldPrice')(e.target.value)} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">دج</span>
                </div>
              </Field>
            </div>
            {form.price && form.oldPrice && Number(form.oldPrice) > Number(form.price) && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                <span className="text-green-600 font-bold text-sm">
                  🏷 خصم {Math.round((1 - Number(form.price) / Number(form.oldPrice)) * 100)}%
                </span>
                <span className="text-xs text-green-500">
                  وفر {(Number(form.oldPrice) - Number(form.price)).toLocaleString('ar-DZ')} دج
                </span>
              </motion.div>
            )}
          </Section>

          <Section title="المقاسات" icon="📐">
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => {
                const selected = form.sizes.includes(size);
                return (
                  <motion.button key={size} whileTap={{ scale: 0.93 }} onClick={() => toggleSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all
                      ${selected
                        ? 'bg-[#8b1a2b] text-white border-[#8b1a2b] shadow-md shadow-[#8b1a2b]/20'
                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:border-stone-300'}`}>
                    {size}
                  </motion.button>
                );
              })}
            </div>
            {form.sizes.length > 0 && (
              <p className="mt-3 text-xs text-stone-400">
                المقاسات المختارة: <span className="font-semibold text-stone-600">{form.sizes.join('، ')}</span>
              </p>
            )}
          </Section>

          <Section title="الألوان" icon="🎨">
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map((color) => {
                const selected = form.colors.find((c) => c.hex === color.hex);
                return (
                  <motion.button key={color.hex} whileTap={{ scale: 0.9 }} onClick={() => toggleColor(color)} title={color.nameAr}
                    className={`relative w-9 h-9 rounded-full border-2 transition-all
                      ${selected ? 'border-[#8b1a2b] scale-110 shadow-lg' : 'border-stone-200 hover:border-stone-400'}`}
                    style={{ backgroundColor: color.hex }}>
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs"
                        style={{ color: color.hex === '#ffffff' || color.hex === '#ca8a04' ? '#000' : '#fff' }}>✓</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {form.colors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.colors.map((c) => (
                  <span key={c.hex} className="flex items-center gap-1.5 bg-stone-100 rounded-lg px-2.5 py-1 text-xs font-medium text-stone-600">
                    <span className="w-3 h-3 rounded-full border border-stone-200" style={{ backgroundColor: c.hex }} />
                    {c.nameAr}
                  </span>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">

          <Section title="صور المنتج" icon="🖼">
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => processFiles(e.target.files)} />
            <motion.div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
              animate={{ borderColor: dragOver ? '#8b1a2b' : '#e7e5e4', backgroundColor: dragOver ? '#fdf2f3' : '#fafaf9' }}
              className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer"
            >
              <div className="text-3xl mb-2">📸</div>
              <p className="text-sm font-semibold text-stone-600">اسحب الصور هنا</p>
              <p className="text-xs text-stone-400 mt-1">أو اضغط للاختيار</p>
              <p className="text-[10px] text-stone-300 mt-1">سيتم رفعها إلى Supabase Storage</p>
            </motion.div>
            {errors.images && <p className="text-xs text-red-500 mt-2">⚠ {errors.images}</p>}
            <AnimatePresence>
              {form.images.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-3 gap-2">
                  {form.images.map((img, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden aspect-square">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <span className="absolute top-1 right-1 bg-[#8b1a2b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          رئيسية
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
                        }}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl"
                      >🗑</button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          <Section title="حالة المنتج" icon="⚙️">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer"
                onClick={() => set('isNew')(!form.isNew)}>
                <div>
                  <p className="text-sm font-semibold text-stone-700">منتج جديد</p>
                  <p className="text-xs text-stone-400">يظهر شارة "جديد" على المنتج</p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isNew ? 'bg-[#8b1a2b]' : 'bg-stone-200'}`}>
                  <motion.div animate={{ x: form.isNew ? 22 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <Field label="عدد التقييمات">
                <input type="number" className={inputClass()} placeholder="0" dir="ltr"
                  value={form.reviewCount} onChange={(e) => set('reviewCount')(e.target.value)} />
              </Field>
              <div>
                <label className="text-xs font-semibold text-stone-500 tracking-wider uppercase block mb-2">التقييم الابتدائي</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => set('rating')(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= form.rating ? 'opacity-100' : 'opacity-25'}`}>⭐</button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <div className="bg-linear-to-br from-[#8b1a2b] to-[#6b1321] rounded-2xl p-5 text-white">
            <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>
              {isEditMode ? 'جاهز لحفظ التعديلات؟' : 'جاهز للنشر؟'}
            </h3>
            <p className="text-xs text-white/70 mb-4">تأكد من ملء جميع الحقول المطلوبة</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit}
              disabled={saving || saved}
              className="w-full bg-white text-[#8b1a2b] font-bold py-3 rounded-xl text-sm disabled:opacity-60">
              {saving ? 'جاري الحفظ...' : saved ? '✅ تم بنجاح' : isEditMode ? '💾 حفظ التعديلات' : '🚀 نشر المنتج'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 40, x: '-50%' }}
            className="fixed bottom-6 left-1/2 bg-white border border-green-100 shadow-xl rounded-2xl px-6 py-3 flex items-center gap-3 z-50"
          >
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-stone-800 text-sm">
                {isEditMode ? 'تم تحديث المنتج بنجاح' : 'تم حفظ المنتج بنجاح'}
              </p>
              <p className="text-xs text-stone-400">جاري التحويل...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
