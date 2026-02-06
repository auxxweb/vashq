import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { Plus, MoreVertical, Edit, CheckCircle, XCircle, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { preventEnterSubmit } from '../../lib/formUtils'
import { formatCurrency } from '../../lib/currencyUtils'

const PAGE_SIZE = 12

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [currency, setCurrency] = useState('USD')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    validityDays: 30,
    price: 0,
    features: [''],
    isActive: true,
    isFreeTrial: false
  })

  useEffect(() => {
    fetchPlans()
  }, [search, statusFilter, page])

  useEffect(() => {
    api.get('/super-admin/settings').then((r) => {
      if (r.data?.success && r.data.settings?.defaultCurrency) setCurrency(r.data.settings.defaultCurrency)
    }).catch(() => {})
  }, [])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter !== 'ALL') params.set('isActive', statusFilter === 'true')
      const res = await api.get(`/super-admin/subscription-plans?${params.toString()}`)
      if (res.data.success) {
        setPlans(res.data.plans || [])
        if (res.data.pagination) setPagination({ total: res.data.pagination.total, totalPages: res.data.pagination.totalPages })
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setPage(newPage)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      validityDays: 30,
      price: 0,
      features: [''],
      isActive: true,
      isFreeTrial: false
    })
    setEditingPlan(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const features = formData.features.filter(Boolean)
    if (!formData.name || formData.validityDays < 1) {
      toast.error('Name and validity (≥1 day) required')
      return
    }
    try {
      const res = await api.post('/super-admin/subscription-plans', {
        ...formData,
        features
      })
      if (res.data.success) {
        toast.success('Plan created')
        setDialogOpen(false)
        resetForm()
        fetchPlans()
      } else toast.error('Failed to create plan')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create plan')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingPlan) return
    const features = formData.features.filter(Boolean)
    try {
      const res = await api.put(`/super-admin/subscription-plans/${editingPlan._id}`, {
        ...formData,
        features
      })
      if (res.data.success) {
        toast.success('Plan updated')
        setEditDialogOpen(false)
        resetForm()
        fetchPlans()
      } else toast.error('Failed to update plan')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update plan')
    }
  }

  const toggleStatus = async (plan, active) => {
    try {
      const res = await api.patch(`/super-admin/subscription-plans/${plan._id}/status`, { isActive: active })
      if (res.data.success) {
        toast.success(active ? 'Plan activated' : 'Plan deactivated')
        fetchPlans()
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update status')
    }
  }

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return
    try {
      const res = await api.delete(`/super-admin/subscription-plans/${plan._id}`)
      if (res.data.success) {
        toast.success('Plan deleted')
        fetchPlans()
      } else toast.error(res.data.message || 'Failed to delete plan')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete plan')
    }
  }

  const openEdit = (plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      validityDays: plan.validityDays || 30,
      price: plan.price ?? 0,
      features: plan.features?.length ? plan.features : [''],
      isActive: plan.isActive !== false,
      isFreeTrial: plan.isFreeTrial === true
    })
    setEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted rounded-lg" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Subscription Plans</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manual subscription plans (no online payments). Admin approval required for upgrades.</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="min-h-[44px] gap-2">
          <Plus className="h-4 w-4" />
          Add Plan
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="secondary" size="icon" className="shrink-0 h-10 w-10" title="Search">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All plans</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {(search || statusFilter !== 'ALL') && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter('ALL'); setPage(1); }}>Clear</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan._id} className="transition-shadow duration-150">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-800">{plan.name}</CardTitle>
                  <CardDescription>{plan.validityDays} days validity · {formatCurrency(plan.price ?? 0, currency)}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(plan)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatus(plan, !plan.isActive)}>
                      {plan.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    {!plan.isActive && (
                      <DropdownMenuItem onClick={() => handleDelete(plan)} className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>
                {plan.isFreeTrial && <Badge variant="outline">Free trial</Badge>}
              </div>
              {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
              {plan.features?.length > 0 && (
                <ul className="text-sm list-disc list-inside space-y-1">
                  {plan.features.slice(0, 4).map((f, i) => (<li key={i}>{f}</li>))}
                  {plan.features.length > 4 && <li className="text-muted-foreground">+{plan.features.length - 4} more</li>}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            {(search || statusFilter !== 'ALL') ? 'No plans match your search or filter.' : 'No subscription plans yet. Add a plan to let shops request upgrades.'}
            {(search || statusFilter !== 'ALL') && (
              <Button className="mt-4" variant="outline" onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter('ALL'); setPage(1); }}>Clear</Button>
            )}
          </CardContent>
        </Card>
      )}

      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">Showing {plans.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + plans.length} of {pagination.total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
                <span className="text-sm px-2">Page {page} of {pagination.totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= pagination.totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Subscription Plan</DialogTitle>
            <DialogDescription>Plans are used for manual upgrades. No payment processing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div>
              <Label>Plan name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Validity (days) *</Label>
              <Input type="number" min={1} value={formData.validityDays} onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 1 })} required />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" min={0} step={0.01} value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div>
              <Label>Features (one per line)</Label>
              {formData.features.map((f, i) => (
                <Input
                  key={i}
                  className="mb-2"
                  value={f}
                  onChange={(e) => {
                    const arr = [...formData.features]
                    arr[i] = e.target.value
                    setFormData({ ...formData, features: arr })
                  }}
                  placeholder={`Feature ${i + 1}`}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}>+ Add feature</Button>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4" />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFreeTrial" checked={formData.isFreeTrial} onChange={(e) => setFormData({ ...formData, isFreeTrial: e.target.checked })} className="h-4 w-4" />
              <Label htmlFor="isFreeTrial">Free trial (one-time per shop; disabled for life after upgrade)</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Plan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Update plan details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div>
              <Label>Plan name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
            </div>
            <div>
              <Label>Validity (days) *</Label>
              <Input type="number" min={1} value={formData.validityDays} onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 1 })} required />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" min={0} step={0.01} value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} placeholder="0" />
            </div>
            <div>
              <Label>Features</Label>
              {formData.features.map((f, i) => (
                <Input
                  key={i}
                  className="mb-2"
                  value={f}
                  onChange={(e) => {
                    const arr = [...formData.features]
                    arr[i] = e.target.value
                    setFormData({ ...formData, features: arr })
                  }}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}>+ Add feature</Button>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="editActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="h-4 w-4" />
              <Label htmlFor="editActive">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="editFreeTrial" checked={formData.isFreeTrial} onChange={(e) => setFormData({ ...formData, isFreeTrial: e.target.checked })} className="h-4 w-4" />
              <Label htmlFor="editFreeTrial">Free trial (one-time per shop; disabled for life after upgrade)</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Update Plan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
