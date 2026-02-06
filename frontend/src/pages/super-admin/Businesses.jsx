import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { Plus, Edit, MoreVertical, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { preventEnterSubmit } from '../../lib/formUtils'

const PAGE_SIZE = 12

export default function SuperAdminBusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    whatsappNumber: '',
    address: '',
    location: '',
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    carHandlingCapacity: 'SINGLE',
    maxConcurrentJobs: 1,
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
    adminEmail: '',
    adminPassword: ''
  })

  useEffect(() => {
    fetchBusinesses()
  }, [search, statusFilter, page])

  const fetchBusinesses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const response = await api.get(`/super-admin/businesses?${params.toString()}`)
      if (response.data.success) {
        setBusinesses(response.data.businesses || [])
        if (response.data.pagination) setPagination({ total: response.data.pagination.total, totalPages: response.data.pagination.totalPages })
      } else {
        toast.error('Failed to load businesses')
      }
    } catch (error) {
      console.error('Failed to load businesses:', error)
      toast.error(error.response?.data?.message || 'Failed to load businesses')
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
      const submitData = { ...formData }
      if (!submitData.adminEmail) delete submitData.adminEmail
      if (!submitData.adminPassword) delete submitData.adminPassword

      const response = await api.post('/super-admin/businesses', submitData)
      if (response.data.success) {
        const message = 'Business created successfully!'
        const description = response.data.adminUser?.password
          ? `Admin Email: ${response.data.adminUser.email}\nPassword: ${response.data.adminUser.password}`
          : 'Business created'
        
        toast.success(message, {
          description: description,
          duration: 10000
        })
        setDialogOpen(false)
        resetForm()
        fetchBusinesses()
      } else {
        toast.error('Failed to create business')
      }
    } catch (error) {
      console.error('Create business error:', error)
      toast.error(error.response?.data?.message || 'Failed to create business')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await api.put(`/super-admin/businesses/${selectedBusiness._id}`, formData)
      if (response.data.success) {
        toast.success('Business updated successfully!')
        setEditDialogOpen(false)
        resetForm()
        fetchBusinesses()
      } else {
        toast.error('Failed to update business')
      }
    } catch (error) {
      console.error('Update business error:', error)
      toast.error(error.response?.data?.message || 'Failed to update business')
    }
  }

  const handleSuspend = async (businessId, status) => {
    try {
      const response = await api.post(`/super-admin/businesses/${businessId}/suspend`, { status })
      if (response.data.success) {
        toast.success(`Business ${status === 'ACTIVE' ? 'activated' : 'suspended'} successfully!`)
        fetchBusinesses()
      } else {
        toast.error('Failed to update business status')
      }
    } catch (error) {
      console.error('Suspend business error:', error)
      toast.error(error.response?.data?.message || 'Failed to update business status')
    }
  }

  const handleDelete = async (businessId) => {
    if (!confirm('Are you sure you want to delete this business? This will remove the business and its admin user. This action cannot be undone.')) return
    try {
      const response = await api.delete(`/super-admin/businesses/${businessId}`)
      if (response.data.success) {
        toast.success('Business deleted successfully!')
        fetchBusinesses()
      } else {
        toast.error('Failed to delete business')
      }
    } catch (error) {
      console.error('Delete business error:', error)
      toast.error(error.response?.data?.message || 'Failed to delete business')
    }
  }

  const handleResetPassword = async (businessId) => {
    try {
      const response = await api.post(`/super-admin/businesses/${businessId}/reset-password`, {})
      if (response.data.success) {
        toast.success('Password reset successfully!', {
          description: response.data.newPassword ? `New password: ${response.data.newPassword}` : 'Password updated'
        })
      } else {
        toast.error('Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error(error.response?.data?.message || 'Failed to reset password')
    }
  }

  const resetForm = () => {
    setFormData({
      businessName: '',
      ownerName: '',
      phone: '',
      email: '',
      whatsappNumber: '',
      address: '',
      location: '',
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      carHandlingCapacity: 'SINGLE',
      maxConcurrentJobs: 1,
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      adminEmail: '',
      adminPassword: ''
    })
    setSelectedBusiness(null)
  }

  const openEditDialog = (business) => {
    setSelectedBusiness(business)
    setFormData({
      businessName: business.businessName,
      ownerName: business.ownerName,
      phone: business.phone,
      email: business.email,
      whatsappNumber: business.whatsappNumber,
      address: business.address,
      location: business.location || '',
      workingHoursStart: business.workingHoursStart,
      workingHoursEnd: business.workingHoursEnd,
      carHandlingCapacity: business.carHandlingCapacity,
      maxConcurrentJobs: business.maxConcurrentJobs,
      defaultCurrency: business.defaultCurrency,
      defaultLanguage: business.defaultLanguage
    })
    setEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-32 bg-muted rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Car Washes</h1>
          <p className="text-muted-foreground">Manage all car wash businesses</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Business
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Onboard New Car Wash Business</DialogTitle>
              <DialogDescription>Complete the onboarding workflow to add a new car wash business</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} className="space-y-6">
              {/* Business Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                  <Input
                    id="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State, Country"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workingHoursStart">Working Hours Start *</Label>
                    <Input
                      id="workingHoursStart"
                      type="time"
                      value={formData.workingHoursStart}
                      onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workingHoursEnd">Working Hours End *</Label>
                    <Input
                      id="workingHoursEnd"
                      type="time"
                      value={formData.workingHoursEnd}
                      onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Operational Settings Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Operational Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carHandlingCapacity">Car Handling Capacity *</Label>
                    <Select
                      value={formData.carHandlingCapacity}
                      onValueChange={(value) => setFormData({ ...formData, carHandlingCapacity: value, maxConcurrentJobs: value === 'SINGLE' ? 1 : formData.maxConcurrentJobs })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single Car</SelectItem>
                        <SelectItem value="MULTIPLE">Multiple Cars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.carHandlingCapacity === 'MULTIPLE' && (
                    <div className="space-y-2">
                      <Label htmlFor="maxConcurrentJobs">Max Concurrent Jobs *</Label>
                      <Input
                        id="maxConcurrentJobs"
                        type="number"
                        min="1"
                        value={formData.maxConcurrentJobs}
                        onChange={(e) => setFormData({ ...formData, maxConcurrentJobs: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Credentials Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">Admin User Credentials</h3>
                <p className="text-sm text-muted-foreground">Leave blank to use business email and auto-generate password</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email (Optional)</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      placeholder="Leave blank to use business email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminPassword">Admin Password (Optional)</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      placeholder="Leave blank to auto-generate"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Onboard Business</Button>
              </div>
            </form>
          </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, owner, email..."
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
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {(search || statusFilter !== 'ALL') && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter('ALL'); setPage(1); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <Card key={business._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{business.businessName}</CardTitle>
                  <CardDescription>{business.ownerName}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault()
                        openEditDialog(business)
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault()
                        handleResetPassword(business._id)
                      }}
                    >
                      Reset Password
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault()
                        handleSuspend(business._id, business.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                      }}
                    >
                      {business.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(business._id)
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={business.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {business.status}
                  </Badge>
                </div>
                {business.plan?.planId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="font-medium">{business.plan.planId.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Jobs</span>
                  <span className="font-medium">{business.stats?.jobs || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Customers</span>
                  <span className="font-medium">{business.stats?.customers || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {businesses.length === 0 && !loading && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No businesses found</p>
              {(search || statusFilter !== 'ALL') ? (
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter('ALL'); setPage(1); }}>
                  Clear filters
                </Button>
              ) : (
                <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Business
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, pagination.total)}–{Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {pagination.totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= pagination.totalPages}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>Update all business information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-businessName">Business Name *</Label>
                <Input
                  id="edit-businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ownerName">Owner Name *</Label>
                <Input
                  id="edit-ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Business Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-whatsappNumber">WhatsApp Number *</Label>
              <Input
                id="edit-whatsappNumber"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="+1234567890"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location (Optional)</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State, Country"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-workingHoursStart">Working Hours Start *</Label>
                <Input
                  id="edit-workingHoursStart"
                  type="time"
                  value={formData.workingHoursStart}
                  onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-workingHoursEnd">Working Hours End *</Label>
                <Input
                  id="edit-workingHoursEnd"
                  type="time"
                  value={formData.workingHoursEnd}
                  onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-carHandlingCapacity">Car Handling Capacity *</Label>
                <Select
                  value={formData.carHandlingCapacity}
                  onValueChange={(value) => setFormData({ ...formData, carHandlingCapacity: value, maxConcurrentJobs: value === 'SINGLE' ? 1 : formData.maxConcurrentJobs })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single Car</SelectItem>
                    <SelectItem value="MULTIPLE">Multiple Cars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.carHandlingCapacity === 'MULTIPLE' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-maxConcurrentJobs">Max Concurrent Jobs *</Label>
                  <Input
                    id="edit-maxConcurrentJobs"
                    type="number"
                    min="1"
                    value={formData.maxConcurrentJobs}
                    onChange={(e) => setFormData({ ...formData, maxConcurrentJobs: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-defaultLanguage">Default Language</Label>
                <Select
                  value={formData.defaultLanguage}
                  onValueChange={(value) => setFormData({ ...formData, defaultLanguage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Business</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
