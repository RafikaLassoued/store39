// SEO utilities

export function generateStructuredData(type: string, data: Record<string, unknown>): string {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
  return JSON.stringify(baseSchema);
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  price: number;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
}): string {
  return generateStructuredData('Product', {
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'DZD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  });
}

export function generateStoreSchema(): string {
  return generateStructuredData('Store', {
    name: 'متجر ملابس',
    description: 'متجر إلكتروني جزائري للأزياء والموضة',
    url: window.location.origin,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'DZ',
      addressLocality: 'الجزائر',
    },
  });
}

export function updateMetaTags(tags: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}): void {
  if (tags.title) {
    document.title = tags.title;
    setMeta('og:title', tags.title);
    setMeta('twitter:title', tags.title);
  }
  if (tags.description) {
    setMeta('description', tags.description);
    setMeta('og:description', tags.description);
    setMeta('twitter:description', tags.description);
  }
  if (tags.image) {
    setMeta('og:image', tags.image);
    setMeta('twitter:image', tags.image);
  }
  if (tags.url) {
    setMeta('og:url', tags.url);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', tags.url);
  }
  if (tags.type) {
    setMeta('og:type', tags.type);
  }
}

function setMeta(property: string, content: string): void {
  let el = document.querySelector(`meta[property="${property}"]`) ||
    document.querySelector(`meta[name="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      el.setAttribute('property', property);
    } else {
      el.setAttribute('name', property);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
