import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ToggleLeft, ToggleRight, Globe, Plus, Trash2, Pencil, X, Save, Truck } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  getDeliveryCompanies,
  createDeliveryCompany,
  updateDeliveryCompany,
  deleteDeliveryCompany,
  toggleDeliveryCompany,
  getCompanyPricing,
  upsertDeliveryPricing,
} from '../../lib/deliveryCompanies';
import { WILAYAS } from '../../data/seed';
import type { DeliveryCompany, DeliveryPricing } from '../../types';

const emptyForm = (): Omit<DeliveryCompany, 'id'> => ({
  name: '',
  nameAr: '',
  apiKey: '',
  apiUrl: '',
  isActive: true,
  logo: '',
});

export function AdminDelivery() {
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('');

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Pricing
  const [pricing, setPricing] = useState<Record<string, DeliveryPricing[]>>({});
  const [pricingEdits, setPricingEdits] = useState<Record<string, DeliveryPricing>>({});
  const [savingPricing, setSavingPricing] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getDeliveryCompanies();
      setCompanies(data);
      if (data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0].id);
        await loadPricing(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPricing = async (companyId: string) => {
    if (pricing[companyId]) return;
    try {
      const rows = await getCompanyPricing(companyId);
      setPricing(prev => ({ ...prev, [companyId]: rows }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { void loadCompanies(); }, []);

  const handleSelectCompany = async (id: string) => {
    setSelectedCompany(id);
    await loadPricing(id);
  };

  const getPricingValue = (companyId: string, wilayaCode: number): DeliveryPricing => {
    const editKey = `${companyId}-${wilayaCode}`;
    if (pricingEdits[editKey]) return pricingEdits[editKey];
    const found = pricing[companyId]?.find(p => p.wilayaCode === wilayaCode);
    return found ?? { companyId, wilayaCode, homePrice: 0, officePrice: 0, communePrice: 0 };
  };

  const setPricingField = (
    companyId: string,
    wilayaCode: number,
    field: 'homePrice' | 'officePrice' | 'communePrice',
    value: number
  ) => {
    const editKey = `${companyId}-${wilayaCode}`;
    const current = getPricingValue(companyId, wilayaCode);
    setPricingEdits(prev => ({ ...prev, [editKey]: { ...current, [field]: value } }));
  };

  const savePricing = async () => {
    if (!selectedCompany) return;
    setSavingPricing(true);
    try {
      const toSave = Object.entries(pricingEdits)
        .filter(([key]) => key.startsWith(`${selectedCompany}-`))
        .map(([, v]) => v);
      for (const p of toSave) await upsertDeliveryPricing(p);
      const rows = await getCompanyPricing(selectedCompany);
      setPricing(prev => ({ ...prev, [selectedCompany]: rows }));
      setPricingEdits(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => { if (k.startsWith(`${selectedCompany}-`)) delete next[k]; });
        return next;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPricing(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (company: DeliveryCompany) => {
    setEditingId(company.id);
    setForm({
      name: company.name,
      nameAr: company.nameAr,
      apiKey: company.apiKey,
      apiUrl: company.apiUrl,
      isActive: company.isActive,
      logo: company.logo,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.nameAr) {
      setFormError('الاسم بالعربية والإنجليزية مطلوبان');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateDeliveryCompany(editingId, form);
      } else {
        await createDeliveryCompany(form);
      }
      await loadCompanies();
      setShowForm(false);
    } catch (e) {
      setFormError('حدث خطأ، حاول مجدداً');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف شركة التوصيل؟')) return;
    try {
      await deleteDeliveryCompany(id);
      if (selectedCompany === id) setSelectedCompany('');
      await loadCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleDeliveryCompany(id, !current);
      await loadCompanies();
    } catch (e) {
      console.error(e);
    }
  };

  const activeCompany = companies.find(c => c.id === selectedCompany);
  const hasPricingEdits = Object.keys(pricingEdits).some(k => k.startsWith(`${selectedCompany}-`));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            شركات التوصيل
          </h1>
          <p className="text-sm text-stone-500 mt-1">إدارة شركات التوصيل وأسعار الشحن</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#8b1a2b] hover:bg-[#6b1520] text-white flex items-center gap-2"
        >
          <Plus size={16} />
          إضافة شركة
        </Button>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-10 text-stone-400">جاري التحميل...</div>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-16">
              <Truck size={40} className="mx-auto text-stone-300 mb-3" />
              <p className="text-stone-500" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                لا توجد شركات توصيل. أضف شركة جديدة.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.map((company) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`transition-all ${selectedCompany === company.id ? 'border-[#8b1a2b]/40 ring-1 ring-[#8b1a2b]/20' : ''} ${!company.isActive ? 'opacity-60' : ''}`}>
                <CardContent>
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Icon placeholder instead of logo */}
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                        <Truck size={20} className="text-stone-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-800">{company.nameAr}</h3>
                        <p className="text-xs text-stone-400">{company.name}</p>
                      </div>
                    </div>
                    <button onClick={() => void handleToggle(company.id, company.isActive)}>
                      {company.isActive
                        ? <ToggleRight className="text-[#8b1a2b]" size={28} />
                        : <ToggleLeft className="text-stone-300" size={28} />}
                    </button>
                  </div>

                  {/* API info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Globe size={12} />
                      <span className="font-mono truncate">{company.apiUrl || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Key size={12} className="text-stone-400 shrink-0" />
                      <span className="font-mono">
                        {company.apiKey ? '••••••••' : 'لا يوجد مفتاح'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => void handleSelectCompany(company.id)}
                    >
                      عرض الأسعار
                    </Button>
                    <button
                      onClick={() => openEdit(company)}
                      className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => void handleDelete(company.id)}
                      className="p-2 rounded-lg border border-stone-200 hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pricing Table */}
      {selectedCompany && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-800" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                جدول أسعار التوصيل — {activeCompany?.nameAr}
              </h3>
              {hasPricingEdits && (
                <Button
                  size="sm"
                  className="bg-[#8b1a2b] hover:bg-[#6b1520] text-white flex items-center gap-1"
                  onClick={() => void savePricing()}
                  disabled={savingPricing}
                >
                  <Save size={13} />
                  {savingPricing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    <th className="text-right py-2 px-3 text-stone-500 font-medium">الولاية</th>
                    <th className="text-center py-2 px-3 text-stone-500 font-medium">للمنزل 🏠</th>
                    <th className="text-center py-2 px-3 text-stone-500 font-medium">المكتب 🏢</th>
                    <th className="text-center py-2 px-3 text-stone-500 font-medium">البلدية 📍</th>
                  </tr>
                </thead>
                <tbody>
                  {WILAYAS.map((wilaya) => {
                    const p = getPricingValue(selectedCompany, wilaya.code);
                    const isDirty = !!pricingEdits[`${selectedCompany}-${wilaya.code}`];
                    return (
                      <tr
                        key={wilaya.code}
                        className={`border-b border-stone-50 transition-colors ${isDirty ? 'bg-amber-50/60' : 'hover:bg-stone-50/50'}`}
                      >
                        <td className="py-2 px-3 font-medium text-stone-700 whitespace-nowrap">
                          {wilaya.code} - {wilaya.nameAr}
                        </td>
                        {(['homePrice', 'officePrice', 'communePrice'] as const).map((field) => (
                          <td key={field} className="py-1 px-2 text-center">
                            <input
                              type="number"
                              min={0}
                              value={p[field] || ''}
                              onChange={(e) =>
                                setPricingField(selectedCompany, wilaya.code, field, Number(e.target.value))
                              }
                              placeholder="0"
                              className="w-24 text-center text-sm border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#8b1a2b] focus:ring-1 focus:ring-[#8b1a2b]/20 transition-all"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal: Create / Edit */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                  {editingId ? 'تعديل شركة التوصيل' : 'إضافة شركة جديدة'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone-600 block mb-1">الاسم بالعربية *</label>
                  <Input
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="يالا ليفري"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 block mb-1">الاسم بالإنجليزية *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Yalla Livri"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 block mb-1">رابط API</label>
                  <Input
                    value={form.apiUrl}
                    onChange={(e) => setForm({ ...form, apiUrl: e.target.value })}
                    placeholder="https://api.example.com"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600 block mb-1">مفتاح API</label>
                  <Input
                    value={form.apiKey}
                    onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                    placeholder="sk-xxxxxxxx"
                    dir="ltr"
                    type="password"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <span className="text-sm font-medium text-stone-700">نشطة</span>
                  <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                    {form.isActive
                      ? <ToggleRight size={28} className="text-[#8b1a2b]" />
                      : <ToggleLeft size={28} className="text-stone-300" />}
                  </button>
                </div>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-[#8b1a2b] hover:bg-[#6b1520] text-white"
                    onClick={() => void handleSave()}
                    disabled={saving}
                  >
                    {saving ? 'جاري الحفظ...' : editingId ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    إلغاء
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
