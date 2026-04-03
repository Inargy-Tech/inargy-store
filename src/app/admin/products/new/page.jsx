'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@heroui/react'
import { ChevronLeft, AlertCircle } from 'lucide-react'
import { createProduct } from '../../../../lib/queries'

const CATEGORIES = ['solar-panels', 'inverters', 'batteries', 'controllers', 'accessories']

const EMPTY = {
  name: '', slug: '', category: '', description: '', image_url: '', price_kobo: '', stock: '', is_active: true,
}

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
}

export default function NewProductPage() {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  function handleNameChange(e) {
    const name = e.target.value
    setForm((f) => ({ ...f, name, slug: slugEdited ? f.slug : slugify(name) }))
  }

  function update(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setForm((f) => ({ ...f, [field]: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.slug.trim() || !form.price_kobo) {
      setError('Name, slug and price are required.')
      return
    }
    const payload = {
      name: form.name.trim(), slug: form.slug.trim(), category: form.category || null,
      description: form.description.trim() || null, image_url: form.image_url.trim() || null,
      price_kobo: parseInt(form.price_kobo, 10), stock: form.stock !== '' ? parseInt(form.stock, 10) : 0,
      is_active: form.is_active,
    }
    setSaving(true)
    const { error } = await createProduct(payload)
    setSaving(false)
    if (error) setError(error.message || 'Could not save product.')
    else router.push('/admin/products')
  }

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-green transition-colors mb-6">
        <ChevronLeft size={16} /> Products
      </Link>
      <h1 className="text-2xl font-bold text-slate-green mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div id="new-product-error" role="alert" className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Basic Info</h2>
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-slate-green mb-1.5">Product name *</label>
            <input id="productName" type="text" required value={form.name} onChange={handleNameChange} placeholder="e.g. 400W Monocrystalline Solar Panel" aria-describedby={error ? 'new-product-error' : undefined} className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-green mb-1.5">URL slug *</label>
            <input id="slug" type="text" required value={form.slug} onChange={(e) => { setSlugEdited(true); update('slug')(e) }} placeholder="400w-monocrystalline-solar-panel" aria-describedby="slug-hint" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
            <p id="slug-hint" className="text-xs text-muted mt-1">Used in product URL: /product/{form.slug || '…'}</p>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-green mb-1.5">Category</label>
            <select id="category" value={form.category} onChange={update('category')} className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors bg-white">
              <option value="">— Select category —</option>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-green mb-1.5">Description</label>
            <textarea id="description" rows={5} value={form.description} onChange={update('description')} placeholder="Describe the product, its specs, and key benefits…" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors resize-none" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Pricing & Stock</h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="priceKobo" className="block text-sm font-medium text-slate-green mb-1.5">Price (kobo) *</label>
              <input id="priceKobo" type="number" required min="0" value={form.price_kobo} onChange={update('price_kobo')} placeholder="e.g. 15000000 = ₦150,000" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
              {form.price_kobo && (<p className="text-xs text-muted mt-1">= ₦{(parseInt(form.price_kobo, 10) / 100).toLocaleString('en-NG')}</p>)}
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-slate-green mb-1.5">Stock quantity</label>
              <input id="stock" type="number" min="0" value={form.stock} onChange={update('stock')} placeholder="0" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Media</h2>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-green mb-1.5">Image URL</label>
            <input id="imageUrl" type="url" value={form.image_url} onChange={update('image_url')} placeholder="https://…" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
          </div>
          {form.image_url && (<div className="w-32 h-32 rounded-xl overflow-hidden border border-border relative"><Image src={form.image_url} alt="Preview" fill sizes="128px" className="object-cover" /></div>)}
        </div>
        <div className="bg-white rounded-2xl border border-border p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input id="new-active" type="checkbox" checked={form.is_active} onChange={update('is_active')} className="w-4 h-4 accent-slate-green" />
            <div>
              <p className="text-sm font-medium text-slate-green">Published</p>
              <p className="text-xs text-muted">Visible to customers in the store</p>
            </div>
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" isLoading={saving} className="px-8 py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors disabled:opacity-60">
            Create Product
          </Button>
          <Link href="/admin/products" className="px-8 py-3 border border-border text-muted font-medium rounded-full hover:bg-surface transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
