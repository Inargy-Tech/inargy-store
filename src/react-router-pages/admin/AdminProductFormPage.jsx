import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react'
import {
  adminGetProductById,
  createProduct,
  updateProduct,
} from '../../lib/queries'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const CATEGORIES = [
  'solar-panels',
  'inverters',
  'batteries',
  'controllers',
  'accessories',
]

const EMPTY = {
  name: '',
  slug: '',
  category: '',
  description: '',
  image_url: '',
  price_kobo: '',
  stock: '',
  is_active: true,
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    async function load() {
      const { data, error } = await adminGetProductById(id)
      setLoading(false)
      if (error || !data) {
        setError('Product not found.')
        return
      }
      setForm({
        name: data.name || '',
        slug: data.slug || '',
        category: data.category || '',
        description: data.description || '',
        image_url: data.image_url || '',
        price_kobo: data.price_kobo != null ? String(data.price_kobo) : '',
        stock: data.stock != null ? String(data.stock) : '',
        is_active: data.is_active ?? true,
      })
      setSlugEdited(true)
    }
    load()
  }, [id, isEdit])

  function handleNameChange(e) {
    const name = e.target.value
    setForm((f) => ({
      ...f,
      name,
      slug: slugEdited ? f.slug : slugify(name),
    }))
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
    setSuccess('')

    if (!form.name.trim() || !form.slug.trim() || !form.price_kobo) {
      setError('Name, slug and price are required.')
      return
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      price_kobo: parseInt(form.price_kobo, 10),
      stock: form.stock !== '' ? parseInt(form.stock, 10) : 0,
      is_active: form.is_active,
    }

    setSaving(true)
    const { error } = isEdit
      ? await updateProduct(id, payload)
      : await createProduct(payload)
    setSaving(false)

    if (error) {
      setError(error.message || 'Could not save product.')
    } else if (!isEdit) {
      navigate('/admin/products')
    } else {
      setSuccess('Product saved successfully.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-slate-green transition-colors mb-6"
      >
        <ChevronLeft size={16} /> Products
      </Link>

      <h1 className="text-2xl font-bold text-slate-green mb-6">
        {isEdit ? 'Edit Product' : 'Add Product'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-xl text-sm text-danger">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl text-sm text-success">
            <CheckCircle size={16} className="shrink-0" /> {success}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-slate-green mb-1.5">Product name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={handleNameChange}
              placeholder="e.g. 400W Monocrystalline Solar Panel"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-green mb-1.5">URL slug *</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => { setSlugEdited(true); update('slug')(e) }}
              placeholder="400w-monocrystalline-solar-panel"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
            />
            <p className="text-xs text-muted mt-1">Used in product URL: /product/{form.slug || '…'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-green mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={update('category')}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors bg-white"
            >
              <option value="">— Select category —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-green mb-1.5">Description</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={update('description')}
              placeholder="Describe the product, its specs, and key benefits…"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Pricing & Stock</h2>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Price (kobo) *</label>
              <input
                type="number"
                required
                min="0"
                value={form.price_kobo}
                onChange={update('price_kobo')}
                placeholder="e.g. 15000000 = ₦150,000"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
              />
              {form.price_kobo && (
                <p className="text-xs text-muted mt-1">
                  = ₦{(parseInt(form.price_kobo, 10) / 100).toLocaleString('en-NG')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-green mb-1.5">Stock quantity</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={update('stock')}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-green mb-1">Media</h2>

          <div>
            <label className="block text-sm font-medium text-slate-green mb-1.5">Image URL</label>
            <input
              type="url"
              value={form.image_url}
              onChange={update('image_url')}
              placeholder="https://…"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
            />
          </div>

          {form.image_url && (
            <div className="w-32 h-32 rounded-xl overflow-hidden border border-border">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Active toggle */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={update('is_active')}
              className="w-4 h-4 accent-slate-green"
            />
            <div>
              <p className="text-sm font-medium text-slate-green">Published</p>
              <p className="text-xs text-muted">Visible to customers in the store</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-slate-green text-white font-semibold rounded-full hover:bg-slate-dark transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
          <Link
            to="/admin/products"
            className="px-8 py-3 border border-border text-muted font-medium rounded-full hover:bg-surface transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
