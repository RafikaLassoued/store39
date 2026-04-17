import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useStore } from '../../hooks/useStore';
import { formatPrice } from '../../lib/utils';

export function AdminProducts() {
  const products = useStore((s) => s.products);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) =>
    p.name.includes(search) || p.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Tajawal, sans-serif' }}>المنتجات</h1>
          <p className="text-sm text-stone-500 mt-1">{products.length} منتج</p>
        </div>
        <Button size="sm">
          <Plus size={16} />
          إضافة منتج
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="pr-10"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/50">
                  <th className="text-right py-3 px-4 text-stone-500 font-medium">المنتج</th>
                  <th className="text-right py-3 px-4 text-stone-500 font-medium">التصنيف</th>
                  <th className="text-right py-3 px-4 text-stone-500 font-medium">السعر</th>
                  <th className="text-right py-3 px-4 text-stone-500 font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 text-stone-500 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-stone-800">{product.name}</p>
                          <p className="text-xs text-stone-400">{product.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">{product.category}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-stone-800">{formatPrice(product.price)} دج</span>
                        {product.oldPrice && (
                          <span className="text-xs text-stone-400 line-through block">{formatPrice(product.oldPrice)} دج</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {product.inStock && <Badge variant="success">متوفر</Badge>}
                        {product.isNew && <Badge variant="info">جديد</Badge>}
                        {product.featured && <Badge>مميز</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Link to={`/product/${product.slug}`}>
                          <button className="p-1.5 text-stone-400 hover:text-blue-500 transition-colors">
                            <Eye size={16} />
                          </button>
                        </Link>
                        <button className="p-1.5 text-stone-400 hover:text-amber-500 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
