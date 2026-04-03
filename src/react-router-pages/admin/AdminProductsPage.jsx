import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react'
import { adminGetProducts, deleteProduct } from '../../lib/queries'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { formatNaira, formatDate } from '../../config'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load(q = '') {
    setLoading(true)
    const { data } = await adminGetProducts({ search: q })
    setProducts(data || [])
    setLoading(false)
  }

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => load(search), 350)
    return () => clearTimeout(t)
  }, [search])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteProduct(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-green">Products</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center">
          <Package size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold mb-1">No products found</p>
          <p className="text-sm text-muted mb-4">Add your first product to get started.</p>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
          >
            <Plus size={15} /> Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-light bg-surface/50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Price</th>
                  <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Stock</th>
                  <th className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-muted" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-green">{product.name}</p>
                          <p className="text-xs text-muted">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted capitalize">
                      {product.category?.replace(/-/g, ' ') || '—'}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-green">
                      {formatNaira(product.price_kobo)}
                    </td>
                    <td className="px-4 py-4 text-center text-muted">{product.stock ?? '—'}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        product.is_active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="p-1.5 rounded-lg text-muted hover:text-slate-green hover:bg-surface transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete product?"
        message={`"${deleteTarget?.name}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
