import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Package, ChevronLeft } from 'lucide-react'
import { createServerSupabase } from '../../../../lib/supabase-server'
import NairaPrice from '../../../../components/ui/NairaPrice'
import AddToCartSection from './AddToCartSection'

async function getProduct(slug) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found' }
  const price = (product.price_kobo / 100).toFixed(2)
  return {
    title: product.name,
    description: product.description || `Buy ${product.name} from Inargy Store.`,
    alternates: { canonical: `https://store.inargy.tech/product/${slug}` },
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} from Inargy Store.`,
      url: `https://store.inargy.tech/product/${slug}`,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
    other: {
      'product:price:amount': price,
      'product:price:currency': 'NGN',
    },
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const nonce = (await headers()).get('x-nonce') ?? undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image_url || undefined,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'Inargy' },
    offers: {
      '@type': 'Offer',
      url: `https://store.inargy.tech/product/${slug}`,
      priceCurrency: 'NGN',
      price: (product.price_kobo / 100).toFixed(2),
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="py-10">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted mb-8">
        <Link href="/catalog" className="hover:text-slate-green transition-colors">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/catalog?category=${product.category}`}
              className="hover:text-slate-green transition-colors capitalize"
            >
              {product.category.replace(/-/g, ' ')}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-green font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-surface rounded-2xl overflow-hidden border border-border relative">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted" role="img" aria-label={product.name}>
              <Package size={80} strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              {product.category.replace(/-/g, ' ')}
            </span>
          )}
          <h1 className="text-3xl font-bold text-slate-green mb-4">{product.name}</h1>

          <NairaPrice kobo={product.price_kobo} size="xl" showInstallment className="mb-6" />

          {/* Stock badge */}
          {product.stock !== undefined && (
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                  <span className="w-2 h-2 bg-success rounded-full" />
                  {product.stock > 10 ? 'In stock' : `Only ${product.stock} left`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-danger">
                  <span className="w-2 h-2 bg-danger rounded-full" />
                  Out of stock
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none text-muted mb-8">
              <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Add to cart (client component) */}
          <AddToCartSection product={product} />

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-border-light grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Flexible payment plans', sub: 'Pay monthly, worry less' },
              { label: 'Genuine products', sub: '100% authentic solar equipment' },
              { label: 'Free installation support', sub: 'Expert guidance included' },
              { label: '12-month warranty', sub: 'Peace of mind guaranteed' },
            ].map((b) => (
              <div key={b.label}>
                <p className="text-sm font-semibold text-slate-green">{b.label}</p>
                <p className="text-xs text-muted">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
