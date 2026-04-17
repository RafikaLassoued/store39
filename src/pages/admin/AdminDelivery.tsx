import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Key, ToggleLeft, ToggleRight, Globe } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DELIVERY_COMPANIES } from '../../data/seed';
import { WILAYAS } from '../../data/seed';

export function AdminDelivery() {
  const [companies, setCompanies] = useState(DELIVERY_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.id || '');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const toggleCompany = (id: string) => {
    setCompanies(companies.map((c) =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const activeCompany = companies.find((c) => c.id === selectedCompany);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>شركات التوصيل</h1>
        <p className="text-sm text-stone-500 mt-1">إدارة شركات التوصيل وأسعار الشحن</p>
      </div>

      {/* Companies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {companies.map((company) => (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={company.isActive ? 'border-[#8b1a2b]/20' : 'opacity-60'}>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{company.logo}</span>
                    <div>
                      <h3 className="font-bold text-stone-800">{company.nameAr}</h3>
                      <p className="text-xs text-stone-400">{company.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCompany(company.id)}
                    className="text-2xl"
                  >
                    {company.isActive ? (
                      <ToggleRight className="text-[#8b1a2b]" size={28} />
                    ) : (
                      <ToggleLeft className="text-stone-300" size={28} />
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Globe size={12} />
                    <span className="font-mono">{company.apiUrl}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key size={12} className="text-stone-400" />
                    <Input
                      value={apiKeys[company.id] || ''}
                      onChange={(e) => setApiKeys({ ...apiKeys, [company.id]: e.target.value })}
                      placeholder="API Key"
                      className="text-xs h-8"
                      dir="ltr"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setSelectedCompany(company.id)}
                >
                  عرض الأسعار
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Delivery Pricing Table */}
      <Card>
        <CardContent>
          <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>
            جدول أسعار التوصيل - {activeCompany?.nameAr}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">الولاية</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">للمنزل</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">المكتب</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">البلدية</th>
                </tr>
              </thead>
              <tbody>
                {WILAYAS.slice(0, 15).map((wilaya) => {
                  const baseHome = wilaya.code <= 16 ? 400 : wilaya.code <= 35 ? 550 : 700;
                  const multiplier = activeCompany?.id === 'dc-2' ? 1.1 : 1;
                  return (
                    <tr key={wilaya.code} className="border-b border-stone-50">
                      <td className="py-2 px-3 font-medium text-stone-700">
                        {wilaya.code} - {wilaya.nameAr}
                      </td>
                      <td className="py-2 px-3 text-stone-600">
                        {Math.round(baseHome * multiplier)} دج
                      </td>
                      <td className="py-2 px-3 text-stone-600">
                        {Math.round((baseHome - 100) * multiplier)} دج
                      </td>
                      <td className="py-2 px-3 text-stone-600">
                        {Math.round((baseHome - 50) * multiplier)} دج
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
