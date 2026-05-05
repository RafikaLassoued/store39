import { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-stone-100 aspect-3/4 flex items-center justify-center text-stone-400">
        لا توجد صور
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-3/4">
        <img
          src={images[activeIndex]}
          alt={`${name} - الصورة ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              aria-label="الصورة السابقة"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
              aria-label="الصورة التالية"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-stone-700">الصور الإضافية</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? 'border-[#8b1a2b] shadow-lg'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
                aria-label={`عرض الصورة ${i + 1}`}
              >
                <img src={img} alt={`${name} thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
