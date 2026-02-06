import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Plus, Clock, Car, ChevronRight, Search, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/currencyUtils'

const statusColors = {
  RECEIVED: 'bg-sky-50 text-sky-700 border border-sky-100',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-100',
  WASHING: 'bg-violet-50 text-violet-700 border border-violet-100',
  DRYING: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  DELIVERED: 'bg-slate-100 text-slate-700 border border-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-100',
}

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WASHING', label: 'Washing' },
  { value: 'DRYING', label: 'Drying' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

const PAGE_SIZE = 10

export default function AdminJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })

  useEffect(() => {
    fetchJobs()
  }, [statusFilter, search, page])

  useEffect(() => {
    api.get('/admin/settings').then((r) => {
      if (r.data?.success && r.data.settings?.currency) setCurrency(r.data.settings.currency)
    }).catch(() => {})
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('status', statusFilter)
      params.set('page', String(page))
      params.set('limit', String(PAGE_SIZE))
      if (search.trim()) params.set('search', search.trim())
      const response = await api.get(`/admin/jobs?${params.toString()}`)
      if (response.data.success) {
        setJobs(response.data.jobs || [])
        if (response.data.pagination) setPagination({ total: response.data.pagination.total, totalPages: response.data.pagination.totalPages })
      } else {
        toast.error('Failed to load jobs')
      }
    } catch (error) {
      console.error('Failed to load jobs:', error)
      toast.error(error.response?.data?.message || 'Failed to load jobs')
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

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      const response = await api.patch(`/admin/jobs/${jobId}/status`, { status: newStatus })
      if (response.data.success) {
        toast.success('Job status updated successfully!')
        fetchJobs()
      } else {
        toast.error('Failed to update job status')
      }
    } catch (error) {
      console.error('Update job status error:', error)
      toast.error(error.response?.data?.message || 'Failed to update job status')
    }
  }

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      RECEIVED: 'IN_PROGRESS',
      IN_PROGRESS: 'WASHING',
      WASHING: 'DRYING',
      DRYING: 'COMPLETED',
      COMPLETED: 'DELIVERED'
    }
    return statusFlow[currentStatus]
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-24" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Jobs</h1>
          <p className="text-muted-foreground text-sm">Manage all car wash jobs. Open a job to update status and send WhatsApp messages to the customer.</p>
        </div>
        <Link to="/admin/jobs/new" className="min-h-[44px] flex items-center">
          <Button className="w-full sm:w-auto gap-2">
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Search and filter */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by token, customer name, phone, or car number..."
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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

      <div className="grid gap-4">
        {jobs.map((job) => {
          const nextStatus = getNextStatus(job.status)
          return (
            <Card key={job._id} className="transition-shadow duration-150">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-foreground">Token: {job.tokenNumber}</h3>
                      <Badge className={statusColors[job.status] || ''}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Car className="h-4 w-4" />
                      <span>{job.carId?.carNumber}</span>
                      {job.carId?.brand && job.carId?.model && (
                        <span>• {job.carId.brand} {job.carId.model}</span>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Customer:</span> {job.customerId?.name} • {job.customerId?.phone}
                    </div>
                    {job.estimatedDelivery && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>ETA: {format(new Date(job.estimatedDelivery), 'PPp')}</span>
                      </div>
                    )}
                    {job.services && job.services.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Services: {job.services.map(s => s.serviceId?.name || 'N/A').join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="sm:text-right space-y-2 flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-semibold text-slate-800">{formatCurrency(Number(job.totalPrice), currency)}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {nextStatus && job.status !== 'DELIVERED' && job.status !== 'CANCELLED' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(job._id, nextStatus)}
                        >
                          Mark as {nextStatus.replace('_', ' ')}
                        </Button>
                      )}
                      <Link to={`/admin/jobs/${job._id}`} className="min-h-[40px] flex items-center">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1">
                          <ChevronRight className="h-4 w-4" />
                          View details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {jobs.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">{search || statusFilter !== 'ALL' ? 'No jobs match your search or filter.' : 'No jobs found'}</p>
              {(search || statusFilter !== 'ALL') ? (
                <Button className="mt-4" variant="outline" onClick={() => { setSearch(''); setSearchInput(''); setStatusFilter('ALL'); setPage(1); }}>
                  Clear filters
                </Button>
              ) : (
                <Link to="/admin/jobs/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Job
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {jobs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + jobs.length} of {pagination.total} jobs
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
