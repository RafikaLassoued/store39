import { motion } from 'framer-motion';
import { Tags } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { CATEGORIES } from '../../data/seed';

export function AdminCategories() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>التصنيفات</h1>
        <p className="text-sm text-stone-500 mt-1">{CATEGORIES.length} تصنيف</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card hover>
              <CardContent className="flex items-center gap-4">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800">{cat.name}</h3>
                  <p className="text-xs text-stone-500">{cat.productCount} منتج</p>
                  <p className="text-xs text-stone-400">/{cat.slug}</p>
                </div>
                <Tags size={18} className="text-stone-300" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
