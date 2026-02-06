import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Plus, Edit, Trash2, Search, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { preventEnterSubmit } from '../../lib/formUtils'

const PAGE_SIZE = 12

function normalizeWhatsAppNumber(phone) {
  if (!phone || typeof phone !== 'string') return ''
  const digits = phone.replace(/\D/g, '')
  return digits
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    address: '',
    notes: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [search, page])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))
      if (search.trim()) params.set('search', search.trim())
      const response = await api.get(`/admin/customers?${params.toString()}`)
      if (response.data.success) {
        setCustomers(response.data.customers || [])
        if (response.data.pagination) {
          setPagination({
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages
          })
        }
      } else {
        toast.error('Failed to load customers')
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
      toast.error(error.response?.data?.message || 'Failed to load customers')
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

  const openWhatsApp = (customer) => {
    const num = normalizeWhatsAppNumber(customer.whatsappNumber || customer.phone)
    if (!num) {
      toast.error('No WhatsApp number for this customer')
      return
    }
    window.open(`https://wa.me/${num}`, '_blank', 'noopener,noreferrer')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/admin/customers', formData)
      if (response.data.success) {
        toast.success('Customer created successfully!')
        setDialogOpen(false)
        resetForm()
        fetchCustomers()
      } else {
        toast.error('Failed to create customer')
      }
    } catch (error) {
      console.error('Create customer error:', error)
      toast.error(error.response?.data?.message || 'Failed to create customer')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editingCustomer) return
    try {
      const response = await api.put(`/admin/customers/${editingCustomer._id}`, formData)
      if (response.data.success) {
        toast.success('Customer updated successfully!')
        setEditDialogOpen(false)
        setEditingCustomer(null)
        resetForm()
        fetchCustomers()
      } else {
        toast.error('Failed to update customer')
      }
    } catch (error) {
      console.error('Update customer error:', error)
      toast.error(error.response?.data?.message || 'Failed to update customer')
    }
  }

  const openEditDialog = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      whatsappNumber: customer.whatsappNumber || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || ''
    })
    setEditDialogOpen(true)
  }

  const handleDelete = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      const response = await api.delete(`/admin/customers/${customerId}`)
      if (response.data.success) {
        toast.success('Customer deleted successfully!')
        fetchCustomers()
      } else {
        toast.error('Failed to delete customer')
      }
    } catch (error) {
      console.error('Delete customer error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete customer')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      whatsappNumber: '',
      email: '',
      address: '',
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
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Customer</DialogTitle>
              <DialogDescription>Add a new customer to your system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                  <Input
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Customer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>Update customer information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} onKeyDown={preventEnterSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-whatsappNumber">WhatsApp Number *</Label>
                  <Input
                    id="edit-whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
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
                <Button type="button" variant="outline" onClick={() => { setEditDialogOpen(false); setEditingCustomer(null); }}>
                  Cancel
                </Button>
                <Button type="submit">Update Customer</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and filter */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, WhatsApp, or email..."
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.length === 0 && !loading && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">{search ? 'No customers match your search.' : 'No customers yet. Add your first customer to get started.'}</p>
              {search && (
                <Button className="mt-4" variant="outline" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        {customers.map((customer) => (
          <Card key={customer._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{customer.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openWhatsApp(customer)}
                    title="WhatsApp"
                    className="text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(customer)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(customer._id)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{customer.phone}</p>
                <p className="text-muted-foreground">{customer.whatsappNumber}</p>
                {customer.email && <p className="text-muted-foreground">{customer.email}</p>}
                <div className="pt-2">
                  <span className="text-muted-foreground">Cars: </span>
                  <span className="font-medium">{customer.stats?.cars || 0}</span>
                  <span className="text-muted-foreground ml-4">Jobs: </span>
                  <span className="font-medium">{customer.stats?.jobs || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {customers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + customers.length} of {pagination.total} customers
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm px-2">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
