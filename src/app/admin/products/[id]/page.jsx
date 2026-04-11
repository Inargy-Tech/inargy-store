'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@heroui/react/button'
import { ChevronLeft, AlertCircle, CheckCircle, UploadCloud } from 'lucide-react'
import { adminGetProductById, updateProduct, uploadProductImage } from '../../../../lib/queries'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'
import RoleGuard from '../../../../components/layout/RoleGuard'

const CATEGORIES = ['solar-panels', 'inverters', 'batteries', 'controllers', 'accessories']

const EMPTY = {
  name: '', slug: '', category: '', description: '', image_url: '', price_kobo: '', stock: '', is_active: true, featured: false,
}

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
}

export default function EditProductPage() {
  const { id } = useParams()
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [slugEdited, setSlugEdited] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await adminGetProductById(id)
      setLoading(false)
      if (error || !data) { setError('Product not found.'); return }
      setForm({
        name: data.name || '', slug: data.slug || '', category: data.category || '',
        description: data.description || '', image_url: data.image_url || '',
        price_kobo: data.price_kobo != null ? String(data.price_kobo) : '',
        stock: data.stock != null ? String(data.stock) : '', is_active: data.is_active ?? true, featured: data.featured ?? false,
      })
    }
    load()
  }, [id])

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
    setError(''); setSuccess('')
    if (!form.name.trim() || !form.slug.trim() || !form.price_kobo) {
      setError('Name, slug and price are required.'); return
    }
    const payload = {
      name: form.name.trim(), slug: form.slug.trim(), category: form.category || null,
      description: form.description.trim() || null, image_url: form.image_url.trim() || null,
      price_kobo: parseInt(form.price_kobo, 10), stock: form.stock !== '' ? parseInt(form.stock, 10) : 0,
      is_active: form.is_active, featured: form.featured,
    }
    setSaving(true)
    const { error } = await updateProduct(id, payload)
    setSaving(false)
    if (error) setError(error.message || 'Could not save product.')
    else setSuccess('Product saved successfully.')
  }

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <RoleGuard section="productsEdit">
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-green transition-colors mb-6">
        <ChevronLeft size={16} /> Products
      </Link>
      <h1 className="text-2xl font-bold text-slate-green mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (<div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger"><AlertCircle size={16} className="shrink-0" /> {error}</div>)}
        {success && (<div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl text-sm text-success"><CheckCircle size={16} className="shrink-0" /> {success}</div>)}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Basic Info</h2>
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-green mb-1.5">Product name *</label>
            <input id="edit-name" type="text" required value={form.name} onChange={handleNameChange} placeholder="e.g. 400W Monocrystalline Solar Panel" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
          </div>
          <div>
            <label htmlFor="edit-slug" className="block text-sm font-medium text-slate-green mb-1.5">URL slug *</label>
            <input id="edit-slug" type="text" required value={form.slug} onChange={(e) => { setSlugEdited(true); update('slug')(e) }} placeholder="400w-monocrystalline-solar-panel" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
            <p className="text-xs text-muted mt-1">Used in product URL: /product/{form.slug || '…'}</p>
          </div>
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-slate-green mb-1.5">Category</label>
            <select id="edit-category" value={form.category} onChange={update('category')} className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors bg-white">
              <option value="">— Select category —</option>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-slate-green mb-1.5">Description</label>
            <textarea id="edit-description" rows={5} value={form.description} onChange={update('description')} placeholder="Describe the product, its specs, and key benefits…" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors resize-none" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Pricing & Stock</h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="edit-price" className="block text-sm font-medium text-slate-green mb-1.5">Price (kobo) *</label>
              <input id="edit-price" type="number" required min="0" value={form.price_kobo} onChange={update('price_kobo')} placeholder="e.g. 15000000 = ₦150,000" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
              {form.price_kobo && (<p className="text-xs text-muted mt-1">= ₦{(parseInt(form.price_kobo, 10) / 100).toLocaleString('en-NG')}</p>)}
            </div>
            <div>
              <label htmlFor="edit-stock" className="block text-sm font-medium text-slate-green mb-1.5">Stock quantity</label>
              <input id="edit-stock" type="number" min="0" value={form.stock} onChange={update('stock')} placeholder="0" className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Media</h2>
          <div className="space-y-3">
            <label htmlFor="edit-imageUpload" className="block text-sm font-medium text-slate-green mb-1.5">Product image</label>
            <label htmlFor="edit-imageUpload" className={`flex items-center gap-3 px-4 py-2.5 border border-dashed rounded-xl text-sm cursor-pointer transition-colors ${uploading ? 'border-border text-muted' : 'border-slate-green/40 hover:border-slate-green text-muted hover:text-slate-green'}`}>
              <UploadCloud size={18} className="shrink-0" />
              {uploading ? 'Uploading…' : 'Choose file to upload'}
            </label>
            <input
              id="edit-imageUpload"
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                setError(''); setSuccess('')
                const { url, error: uploadError } = await uploadProductImage(file)
                setUploading(false)
                if (uploadError) setError('Image upload failed: ' + (uploadError.message || 'Unknown error'))
                else setForm((f) => ({ ...f, image_url: url }))
                e.target.value = ''
              }}
            />
            {form.image_url && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-surface">
                <Image src={form.image_url} alt="Preview" fill sizes="100vw" className="object-contain" />
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input id="edit-active" type="checkbox" checked={form.is_active} onChange={update('is_active')} className="w-4 h-4 accent-slate-green" />
              <div>
                <p className="text-sm font-medium text-slate-green">Published</p>
                <p className="text-xs text-muted">Visible to customers in the store</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input id="edit-featured" type="checkbox" checked={form.featured} onChange={update('featured')} className="w-4 h-4 accent-volt" />
              <div>
                <p className="text-sm font-medium text-slate-green">Featured</p>
                <p className="text-xs text-muted">Shown in Featured Products on the homepage</p>
              </div>
            </label>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="submit" isLoading={saving} className="px-6 py-2 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-volt hover:text-slate-green transition-colors disabled:opacity-60">
            Save Changes
          </Button>
          <Link href="/admin/products" className="inline-flex items-center justify-center px-6 py-2 text-sm border border-border text-slate-green font-semibold rounded-full hover:bg-danger hover:text-white hover:border-danger active:bg-red-700 active:border-red-700 transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
    </RoleGuard>
  )
}
