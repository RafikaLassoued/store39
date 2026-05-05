import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tags, Plus, Pencil, Trash2, X, Check, ImagePlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── Types ───────────────────────────────────────────────
interface CategoryFormData {
  name: string;
  slug: string;
  image: string;
}

// ─── Helpers ─────────────────────────────────────────────
function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9\u0621-\u064A-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const empty = (): CategoryFormData => ({ name: '', slug: '', image: '' });

// ─── Modal ────────────────────────────────────────────────
function CategoryModal({
  mode,
  initial,
  onSave,
  onClose,
}: {
  mode: 'add' | 'edit';
  initial?: CategoryFormData;
  onSave: (data: CategoryFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CategoryFormData>(initial ?? empty());
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof CategoryFormData) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const handleNameChange = (v: string) => {
    setForm((f) => ({ ...f, name: v, slug: slugify(v) }));
    setErrors((e) => { const n = { ...e }; delete n.name; return n; });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('image')(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Partial<CategoryFormData> = {};
    if (!form.name.trim()) e.name = 'الاسم مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <h2 className="font-bold text-stone-800" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            {mode === 'add' ? '➕ إضافة تصنيف جديد' : '✏️ تعديل التصنيف'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => fileRef.current?.click()}
              className="w-28 h-28 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all border-stone-300 hover:border-[#8b1a2b] bg-stone-50 hover:bg-[#fdf2f3]"
            >
              {form.image ? (
                <img src={form.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImagePlus size={22} className="text-stone-400" />
                  <span className="text-xs text-stone-400 mt-1">رفع صورة</span>
                </>
              )}
            </motion.div>
            <p className="text-xs text-stone-400">اختياري</p>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">اسم التصنيف</label>
            <input
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-stone-50 outline-none transition-all
                focus:bg-white focus:border-[#8b1a2b] focus:ring-2 focus:ring-[#8b1a2b]/10
                ${errors.name ? 'border-red-400 bg-red-50/30' : 'border-stone-200'}`}
              placeholder="مثال: الأحذية الرياضية"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {errors.name && <p className="text-xs text-red-500">⚠ {errors.name}</p>}
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">الرابط (Slug)</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm font-medium bg-stone-100 text-stone-400 outline-none"
              value={form.slug}
              readOnly
              dir="ltr"
              placeholder="يتولد تلقائياً"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition-colors"
          >
            إلغاء
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { if (validate()) onSave(form); }}
            className="flex-1 py-3 rounded-xl bg-[#8b1a2b] text-white font-bold text-sm shadow-lg shadow-[#8b1a2b]/20 flex items-center justify-center gap-2"
          >
            <Check size={16} />
            {mode === 'add' ? 'إضافة' : 'حفظ التعديلات'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────
function DeleteModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
      >
        <div className="text-4xl mb-3">🗑️</div>
        <h3 className="font-bold text-stone-800 text-lg mb-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          حذف التصنيف
        </h3>
        <p className="text-sm text-stone-500 mb-6">
          هل أنت متأكد من حذف تصنيف <span className="font-bold text-stone-700">"{name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition-colors"
          >
            إلغاء
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
          >
            نعم، احذف
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [modal, setModal] = useState<null | { mode: 'add' } | { mode: 'edit'; id: string; data: CategoryFormData }>(null);
  const [deleteTarget, setDeleteTarget] = useState<null | { id: string; name: string }>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ─── Load Categories ───────────────────────────────
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setCategories(data);
  };

  // ─── Save Category ─────────────────────────────────
  const handleSave = async (data: CategoryFormData) => {
    if (!modal) return;

    if (modal.mode === 'add') {
      const { error } = await supabase.from('categories').insert([
        { name: data.name, slug: data.slug, image: data.image },
      ]);

      if (!error) {
        showToast('✅ تم إضافة التصنيف بنجاح');
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          slug: data.slug,
          image: data.image,
        })
        .eq('id', modal.id);

      if (!error) {
        showToast('✅ تم تحديث التصنيف');
        fetchCategories();
      }
    }

    setModal(null);
  };

  // ─── Delete Category ──────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', deleteTarget.id);

    if (!error) {
      showToast('🗑️ تم حذف التصنيف');
      fetchCategories();
    }

    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 p-1" dir="rtl">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            التصنيفات
          </h1>
          <p className="text-sm text-stone-500 mt-1">إدارة جميع تصنيفات المتجر</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#8b1a2b] text-white font-semibold shadow-lg shadow-[#8b1a2b]/20"
        >
          <Plus size={18} />
          إضافة تصنيف
        </motion.button>
      </motion.div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">

        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white shadow-md border border-stone-200 flex flex-col gap-4"
          >
            <img
              src={cat.image || '/placeholder.png'}
              className="w-full h-36 object-cover rounded-xl"
            />

            <div>
              <h3 className="font-bold text-stone-800 text-lg">{cat.name}</h3>
              <p className="text-sm text-stone-500 break-all" dir="ltr">{cat.slug}</p>
            </div>

            <div className="flex gap-2 mt-auto pt-3">

              <button
                onClick={() =>
                  setModal({
                    mode: 'edit',
                    id: cat.id,
                    data: { name: cat.name, slug: cat.slug, image: cat.image },
                  })
                }
                className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm flex items-center justify-center gap-1"
              >
                <Pencil size={15} />
                تعديل
              </button>

              <button
                onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 font-semibold text-sm flex items-center justify-center gap-1"
              >
                <Trash2 size={15} />
                حذف
              </button>
            </div>
          </motion.div>
        ))}

      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <CategoryModal
            mode={modal.mode}
            initial={modal.mode === 'edit' ? modal.data : undefined}
            onSave={handleSave}
            onClose={() => setModal(null)}
          />
        )}

        {deleteTarget && (
          <DeleteModal
            name={deleteTarget.name}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="fixed bottom-6 right-6 px-5 py-3 rounded-xl bg-stone-800 text-white text-sm shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}