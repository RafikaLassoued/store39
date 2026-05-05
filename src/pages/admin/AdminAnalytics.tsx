import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Eye, ShoppingCart, Globe, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getPixelSettings, savePixelSettings } from '../../lib/supabaseStore';
import type { PixelSettings } from '../../types';

export function AdminAnalytics() {
  const [settings, setSettings] = useState<PixelSettings>({
    facebookPixelId: '',
    googleAnalyticsId: '',
    isFacebookEnabled: false,
    isGoogleEnabled: false,
  });

  useEffect(() => {
    const run = async () => {
      const data = await getPixelSettings();
      setSettings(data);
    };
    void run();
  }, []);

  const handleSave = async () => {
    await savePixelSettings(settings);
  };
  const trafficSources = [
    { name: 'فيسبوك', percentage: 42, color: 'bg-blue-500', icon: Globe },
    { name: 'انستغرام', percentage: 28, color: 'bg-pink-500', icon: Smartphone },
    { name: 'تيك توك', percentage: 18, color: 'bg-stone-800', icon: Monitor },
    { name: 'بحث مباشر', percentage: 8, color: 'bg-emerald-500', icon: Eye },
    { name: 'أخرى', percentage: 4, color: 'bg-stone-400', icon: Globe },
  ];

  const conversionFunnel = [
    { step: 'زيارة الصفحة', count: 1250, percentage: 100 },
    { step: 'عرض منتج', count: 890, percentage: 71 },
    { step: 'إضافة للسلة', count: 340, percentage: 27 },
    { step: 'بدء الدفع', count: 180, percentage: 14 },
    { step: 'إتمام الشراء', count: 95, percentage: 8 },
  ];

  const topEvents = [
    { event: 'PageView', count: 3420, platform: 'Meta' },
    { event: 'ViewContent', count: 2180, platform: 'Meta + TikTok' },
    { event: 'AddToCart', count: 890, platform: 'All' },
    { event: 'InitiateCheckout', count: 340, platform: 'All' },
    { event: 'Purchase', count: 95, platform: 'All' },
    { event: 'WhatsApp Click', count: 156, platform: 'GA4' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>الإحصائيات والتحليلات</h1>
        <p className="text-sm text-stone-500 mt-1">Meta Pixel + TikTok Pixel + GA4 + GTM</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'الزوار اليوم', value: '1,250', icon: Eye, change: '+15%' },
          { label: 'معدل التحويل', value: '7.6%', icon: TrendingUp, change: '+2.1%' },
          { title: 'إضافات السلة', value: '340', icon: ShoppingCart, change: '+8%' },
          { label: 'زوار عائدون', value: '28%', icon: Users, change: '+5%' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="text-center">
                <stat.icon size={20} className="text-[#8b1a2b] mx-auto mb-2" />
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-500">{stat.label}</p>
                <p className="text-xs text-emerald-500 font-semibold mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardContent>
            <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>مصادر الزيارات</h3>
            <div className="space-y-3">
              {trafficSources.map((source) => (
                <div key={source.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-stone-600">{source.name}</span>
                    <span className="font-semibold">{source.percentage}%</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${source.color} rounded-full`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardContent>
            <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>قمع التحويل</h3>
            <div className="space-y-2">
              {conversionFunnel.map((step) => (
                <div key={step.step} className="flex items-center gap-3">
                  <span className="text-xs text-stone-400 w-20 text-left">{step.percentage}%</span>
                  <div className="flex-1">
                    <div
                      className="h-8 bg-linear-to-l from-[#8b1a2b] to-[#c9a84c] rounded-lg flex items-center justify-end px-3 transition-all"
                      style={{ width: `${step.percentage}%` }}
                    >
                      <span className="text-xs text-white font-semibold">{step.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className="text-xs text-stone-600 w-24">{step.step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Events */}
      <Card>
        <CardContent>
          <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>الأحداث المتتبعة</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">الحدث</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">العدد</th>
                  <th className="text-right py-2 px-3 text-stone-500 font-medium">المنصة</th>
                </tr>
              </thead>
              <tbody>
                {topEvents.map((event) => (
                  <tr key={event.event} className="border-b border-stone-50">
                    <td className="py-2 px-3 font-mono text-stone-800">{event.event}</td>
                    <td className="py-2 px-3 font-semibold">{event.count.toLocaleString()}</td>
                    <td className="py-2 px-3 text-stone-500">{event.platform}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Setup Info */}
      <Card>
        <CardContent>
          <h3 className="font-bold text-stone-800 mb-4" style={{ fontFamily: 'Tajawal, sans-serif' }}>إعدادات التتبع</h3>
          <div className="space-y-3">
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-stone-800 mb-2">Facebook Pixel</p>
              <Input
                value={settings.facebookPixelId}
                onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                placeholder="1234567890"
              />
              
              
              <label className="text-xs text-stone-600 mt-2 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.isFacebookEnabled}
                  onChange={(e) => setSettings({ ...settings, isFacebookEnabled: e.target.checked })}
                />
                مفعّل
              </label>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-stone-800 mb-2">Instgram Pixel</p>
              <Input
                value={settings.facebookPixelId}
                onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                placeholder="1234567890"
              />
              
              
              <label className="text-xs text-stone-600 mt-2 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.isFacebookEnabled}
                  onChange={(e) => setSettings({ ...settings, isFacebookEnabled: e.target.checked })}
                />
                مفعّل
              </label>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-stone-800 mb-2">Tiktok Pixel</p>
              <Input
                value={settings.facebookPixelId}
                onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                placeholder="1234567890"
              />
              
              
              <label className="text-xs text-stone-600 mt-2 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.isFacebookEnabled}
                  onChange={(e) => setSettings({ ...settings, isFacebookEnabled: e.target.checked })}
                />
                مفعّل
              </label>
            </div>
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-stone-800 mb-2">Google Analytics</p>
              <Input
                value={settings.googleAnalyticsId}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
              <label className="text-xs text-stone-600 mt-2 inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.isGoogleEnabled}
                  onChange={(e) => setSettings({ ...settings, isGoogleEnabled: e.target.checked })}
                />
                مفعّل
              </label>
            </div>
          </div>
          <Button className="mt-4" onClick={handleSave}>حفظ إعدادات البكسلات</Button>
        </CardContent>
      </Card>
    </div>
  );
}
