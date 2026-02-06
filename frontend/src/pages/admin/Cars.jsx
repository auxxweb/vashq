import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { preventEnterSubmit } from '../../lib/formUtils'

const PAGE_SIZE = 12

export default function AdminCars() {
  const [cars, setCars] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [customerFilter, setCustomerFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [formData, setFormData] = useState({
    customerId: '',
    carNumber: '',
    brand: '',
    model: '',
    color: '',
    notes: ''
  })

  useEffect(() => {
    fetchCars()
  }, [search, customerFilter, page])

  useEffect(() => {
    api.get('/admin/customers?limit=500').then((r) => {
      if (r.data?.success) setCustomers(r.data.customers || [])
    }).catch(() => {})
  }, [])

  const fetchCars = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))
      if (search.trim()) params.set('search', search.trim())
      if (customerFilter && customerFilter !== 'ALL') params.set('customerId', customerFilter)
      const response = await api.get(`/admin/cars?${params.toString()}`)
      if (response.data.success) {
        setCars(response.data.cars || [])
        if (response.data.pagination) setPagination({ total: response.data.pagination.total, totalPages: response.data.pagination.totalPages })
      } else {
        toast.error('Failed to load cars')
      }
    } catch (error) {
      console.error('Failed to load cars:', error)
      toast.error(error.response?.data?.message || 'Failed to load cars')
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
    if (!formData.customerId || !formData.carNumber) {
      toast.error('Please select a customer and enter car number')
      return
    }
    try {
      const response = await api.post('/admin/cars', formData)
      if (response.data.success) {
        toast.success('Car added successfully!')
        setDialogOpen(false)
        resetForm()
        fetchCars()
      } else {
        toast.error('Failed to add car')
      }
    } catch (error) {
      console.error('Add car error:', error)
      toast.error(error.response?.data?.message || 'Failed to add car')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingCar) return
    try {
      const response = await api.put(`/admin/cars/${editingCar._id}`, formData)
      if (response.data.success) {
        toast.success('Car updated successfully!')
        setEditDialogOpen(false)
        setEditingCar(null)
        resetForm()
        fetchCars()
      } else {
        toast.error('Failed to update car')
      }
    } catch (error) {
      console.error('Update car error:', error)
      toast.error(error.response?.data?.message || 'Failed to update car')
    }
  }

  const openEditDialog = (car) => {
    setEditingCar(car)
    setFormData({
      customerId: car.customerId?._id || car.customerId || '',
      carNumber: car.carNumber,
      brand: car.brand || '',
      model: car.model || '',
      color: car.color || '',
      notes: car.notes || ''
    })
    setEditDialogOpen(true)
  }

  const handleDelete = async (carId) => {
    if (!confirm('Are you sure you want to delete this car?')) return
    try {
      const response = await api.delete(`/admin/cars/${carId}`)
      if (response.data.success) {
        toast.success('Car deleted successfully!')
        fetchCars()
      } else {
        toast.error('Failed to delete car')
      }
    } catch (error) {
      console.error('Delete car error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete car')
    }
  }

  const resetForm = () => {
    setFormData({
      customerId: '',
      carNumber: '',
      brand: '',
      model: '',
      color: '',
      notes: ''
    })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cars</h1>
          <p className="text-muted-foreground">Manage customer cars</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Car
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by car number, brand, model, color, or customer..."
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
              <Select value={customerFilter} onValueChange={(v) => { setCustomerFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All customers</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name} – {c.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(search || customerFilter !== 'ALL') && (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); setSearchInput(''); setCustomerFilter('ALL'); setPage(1); }}>Clear</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Car</DialogTitle>
            <DialogDescription>Add a car for a customer</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} - {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="carNumber">Car Number *</Label>
              <Input
                id="carNumber"
                value={formData.carNumber}
                onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
                placeholder="e.g. ABC-1234"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Car</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Car</DialogTitle>
            <DialogDescription>Update car details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} - {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-carNumber">Car Number *</Label>
              <Input
                id="edit-carNumber"
                value={formData.carNumber}
                onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-brand">Brand</Label>
                <Input
                  id="edit-brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Input
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setEditDialogOpen(false); setEditingCar(null); }}>
                Cancel
              </Button>
              <Button type="submit">Update Car</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cars.length === 0 && !loading && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">{(search || customerFilter !== 'ALL') ? 'No cars match your search or filter.' : 'No cars yet. Add your first car to get started.'}</p>
              {(search || customerFilter !== 'ALL') && (
                <Button className="mt-4" variant="outline" onClick={() => { setSearch(''); setSearchInput(''); setCustomerFilter('ALL'); setPage(1); }}>Clear</Button>
              )}
            </CardContent>
          </Card>
        )}
        {cars.map((car) => (
          <Card key={car._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{car.carNumber}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(car)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(car._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {car.brand} {car.model} {car.color && `• ${car.color}`}
              </p>
              {car.customerId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Customer: {typeof car.customerId === 'object' ? car.customerId?.name : '-'}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">Showing {cars.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + cars.length} of {pagination.total}</p>
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
