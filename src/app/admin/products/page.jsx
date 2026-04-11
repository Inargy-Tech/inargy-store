'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@heroui/react/button'
import { Card } from '@heroui/react/card'
import { Table } from '@heroui/react/table'
import Image from 'next/image'
import { Plus, Search, Edit2, Trash2, Package, Star, X } from 'lucide-react'
import { adminGetProducts, deleteProduct, updateProduct } from '../../../lib/queries'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import Pagination from '../../../components/ui/Pagination'
import { formatNaira } from '../../../config'
import { useAuth } from '../../../contexts/AuthContext'
import { can } from '../../../lib/roles'
import RoleGuard from '../../../components/layout/RoleGuard'

const PAGE_SIZE = 20

export default function AdminProductsPage() {
  const { role } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const load = useCallback(async (q = '', p = 1) => {
    setLoading(true)
    const { data, error, count } = await adminGetProducts({ search: q, page: p })
    if (error) console.error('Failed to load products:', error.message)
    setProducts(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [])

  useEffect(() => { load('', 1) }, [load])

  // Debounce search — reset to page 1
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(search, 1) }, 350)
    return () => clearTimeout(t)
  }, [search, load])

  // Load when page changes (but not on search-triggered resets)
  const [prevSearch, setPrevSearch] = useState('')
  useEffect(() => {
    if (search !== prevSearch) { setPrevSearch(search); return }
    load(search, page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteProduct(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setTotal((t) => t - 1)
  }

  async function toggleFeatured(product) {
    setTogglingId(product.id)
    const { error } = await updateProduct(product.id, { featured: !product.featured })
    if (!error) {
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, featured: !p.featured } : p)
      )
    }
    setTogglingId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-green">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <RoleGuard section="products">

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-10 pr-9 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-green/20 focus:border-slate-green transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-slate-green transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <Card className="p-16 text-center">
          <Package size={40} strokeWidth={1} className="text-muted mx-auto mb-4" />
          <p className="text-slate-green font-semibold mb-1">No products found</p>
          <p className="text-sm text-muted mb-4">Add your first product to get started.</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-green text-white text-sm font-semibold rounded-full hover:bg-slate-dark transition-colors"
          >
            <Plus size={15} /> Add Product
          </Link>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Products table" className="w-full text-sm" onRowAction={!isMobile ? (id) => router.push(`/admin/products/${id}`) : undefined}>
                  <Table.Header className="border-b border-border-light bg-surface/50">
                    <Table.Column id="product" isRowHeader className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Product
                    </Table.Column>
                    <Table.Column id="category" className="text-left text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Category
                    </Table.Column>
                    <Table.Column id="price" className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Price
                    </Table.Column>
                    <Table.Column id="stock" className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Stock
                    </Table.Column>
                    <Table.Column id="featured" className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Featured
                    </Table.Column>
                    <Table.Column id="status" className="text-center text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3">
                      Status
                    </Table.Column>
                    <Table.Column id="actions" className="text-right text-xs font-semibold text-muted uppercase tracking-wider px-6 py-3">
                      Actions
                    </Table.Column>
                  </Table.Header>
                  <Table.Body className="divide-y divide-border-light">
                    {products.map((product) => (
                      <Table.Row key={product.id} id={product.id} className="hover:bg-surface/50 transition-colors cursor-pointer">
                        <Table.Cell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface rounded-lg overflow-hidden shrink-0">
                              {product.image_url ? (
                                <Image src={product.image_url} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
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
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 text-muted capitalize">
                          {product.category?.replace(/-/g, ' ') || '—'}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 text-right font-semibold text-slate-green">
                          {formatNaira(product.price_kobo)}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 text-center text-muted">{product.stock ?? '—'}</Table.Cell>
                        <Table.Cell className="px-4 py-4 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFeatured(product) }}
                            disabled={togglingId === product.id}
                            aria-label={product.featured ? 'Remove from featured' : 'Mark as featured'}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface transition-colors disabled:opacity-40"
                          >
                            <Star
                              size={17}
                              className={product.featured
                                ? 'fill-volt text-volt'
                                : 'text-border hover:text-volt transition-colors'}
                            />
                          </button>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            product.is_active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {can(role, 'productsEdit') && (
                              <Link
                                href={`/admin/products/${product.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg text-muted hover:text-slate-green hover:bg-surface transition-colors"
                                aria-label="Edit"
                              >
                                <Edit2 size={15} />
                              </Link>
                            )}
                            <Button
                              isIconOnly
                              variant="ghost"
                              onPress={() => setDeleteTarget(product)}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors min-w-0 h-auto"
                              aria-label="Delete"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </>
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

      </RoleGuard>
    </div>
  )
}
