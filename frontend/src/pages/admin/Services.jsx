import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Plus, Trash2, Edit, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { preventEnterSubmit } from '../../lib/formUtils'
import { formatCurrency } from '../../lib/currencyUtils'

const PAGE_SIZE = 12

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [currency, setCurrency] = useState('USD')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    minTime: 30,
    maxTime: 60,
    description: '',
    isActive: true
  })

  useEffect(() => {
    fetchServices()
  }, [search, page])

  useEffect(() => {
    api.get('/admin/settings').then((r) => {
      if (r.data?.success && r.data.settings?.currency) setCurrency(r.data.settings.currency)
    }).catch(() => {})
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))
      if (search.trim()) params.set('search', search.trim())
      const response = await api.get(`/admin/services?${params.toString()}`)
      if (response.data.success) {
        setServices(response.data.services || [])
        if (response.data.pagination) setPagination({ total: response.data.pagination.total, totalPages: response.data.pagination.totalPages })
      } else {
        toast.error('Failed to load services')
      }
    } catch (error) {
      console.error('Failed to load services:', error)
      toast.error(error.response?.data?.message || 'Failed to load services')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/admin/services', formData)
      if (response.data.success) {
        toast.success('Service created successfully!')
        setDialogOpen(false)
        resetForm()
        fetchServices()
      } else {
        toast.error('Failed to create service')
      }
    } catch (error) {
      console.error('Create service error:', error)
      toast.error(error.response?.data?.message || 'Failed to create service')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingService) return
    try {
      const response = await api.put(`/admin/services/${editingService._id}`, formData)
      if (response.data.success) {
        toast.success('Service updated successfully!')
        setEditDialogOpen(false)
        setEditingService(null)
        resetForm()
        fetchServices()
      } else {
        toast.error('Failed to update service')
      }
    } catch (error) {
      console.error('Update service error:', error)
      toast.error(error.response?.data?.message || 'Failed to update service')
    }
  }

  const openEditDialog = (service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      price: service.price,
      minTime: service.minTime,
      maxTime: service.maxTime,
      description: service.description || '',
      isActive: service.isActive !== false
    })
    setEditDialogOpen(true)
  }

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      const response = await api.delete(`/admin/services/${serviceId}`)
      if (response.data.success) {
        toast.success('Service deleted successfully!')
        fetchServices()
      } else {
        toast.error('Failed to delete service')
      }
    } catch (error) {
      console.error('Delete service error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete service')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      minTime: 30,
      maxTime: 60,
      description: '',
      isActive: true
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage your services</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>Add a new service to your catalog</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minTime">Min Time (min) *</Label>
                  <Input
                    id="minTime"
                    type="number"
                    min="1"
                    value={formData.minTime}
                    onChange={(e) => setFormData({ ...formData, minTime: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTime">Max Time (min) *</Label>
                  <Input
                    id="maxTime"
                    type="number"
                    min="1"
                    value={formData.maxTime}
                    onChange={(e) => setFormData({ ...formData, maxTime: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Service</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>Update service details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} onKeyDown={preventEnterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Service Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minTime">Min Time (min) *</Label>
                  <Input
                    id="edit-minTime"
                    type="number"
                    min="1"
                    value={formData.minTime}
                    onChange={(e) => setFormData({ ...formData, minTime: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxTime">Max Time (min) *</Label>
                  <Input
                    id="edit-maxTime"
                    type="number"
                    min="1"
                    value={formData.maxTime}
                    onChange={(e) => setFormData({ ...formData, maxTime: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setEditDialogOpen(false); setEditingService(null); }}>
                  Cancel
                </Button>
                <Button type="submit">Update Service</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
              {search && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 && !loading && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">{search ? 'No services match your search.' : 'No services yet. Add your first service to get started.'}</p>
              {search && <Button className="mt-4" variant="outline" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>Clear search</Button>}
            </CardContent>
          </Card>
        )}
        {services.map((service) => (
          <Card key={service._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{service.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(service._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatCurrency(service.price, currency)}</div>
                <div className="text-sm text-muted-foreground">
                  {service.minTime} - {service.maxTime} minutes
                </div>
                {service.description && (
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">Showing {services.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + services.length} of {pagination.total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
                <span className="text-sm px-2">Page {page} of {pagination.totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= pagination.totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
