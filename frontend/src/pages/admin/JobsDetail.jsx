import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ArrowLeft, Car, User, MessageCircle, Star } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/currencyUtils'
import { cn } from '../../lib/utils'

// Map job status to WhatsApp template key (each status has its own message)
const STATUS_TO_TEMPLATE_KEY = {
  RECEIVED: 'received',
  IN_PROGRESS: 'inProgress',
  WASHING: 'washing',
  DRYING: 'drying',
  COMPLETED: 'completed',
  DELIVERED: 'delivered'
}

function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return ''
  return phone.replace(/\D/g, '').trim()
}

function fillTemplate(template, { name = '', vehicleNumber = '', token = '' }) {
  if (!template) return ''
  return template
    .replace(/\{\{name\}\}/g, String(name))
    .replace(/\{\{vehicleNumber\}\}/g, String(vehicleNumber))
    .replace(/\{\{token\}\}/g, String(token))
}

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
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WASHING', label: 'Washing' },
  { value: 'DRYING', label: 'Drying' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

export default function JobsDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    try {
      const [jobRes, settingsRes] = await Promise.all([
        api.get(`/admin/jobs/${id}`),
        api.get('/admin/settings').catch(() => ({ data: {} }))
      ])
      if (jobRes.data.success) {
        setJob(jobRes.data.job)
        setNewStatus(jobRes.data.job.status)
      } else {
        toast.error('Failed to load job')
        navigate('/admin/jobs')
      }
      if (settingsRes?.data?.success && settingsRes.data.settings) {
        setSettings(settingsRes.data.settings)
      } else {
        setSettings({})
      }
    } catch (error) {
      console.error('Failed to load job:', error)
      toast.error(error.response?.data?.message || 'Failed to load job')
      navigate('/admin/jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchJob = () => fetchData()

  const handleStatusUpdate = async (statusOverride) => {
    const targetStatus = statusOverride ?? newStatus
    if (!targetStatus || targetStatus === job.status) return
    setUpdating(true)
    try {
      const response = await api.patch(`/admin/jobs/${id}/status`, { status: targetStatus })
      if (response.data.success) {
        toast.success('Job status updated successfully!')
        setNewStatus(targetStatus)
        fetchJob()
      } else {
        toast.error('Failed to update job status')
      }
    } catch (error) {
      console.error('Update job status error:', error)
      toast.error(error.response?.data?.message || 'Failed to update job status')
    } finally {
      setUpdating(false)
    }
  }

  const customerPhone = job?.customerId?.whatsappNumber || job?.customerId?.phone || ''
  const customerPhoneDigits = normalizePhone(customerPhone)
  const hasShopWhatsApp = !!(settings?.shopWhatsappNumber?.trim())
  const templates = settings?.whatsappTemplates || {}
  const templateKey = job ? STATUS_TO_TEMPLATE_KEY[job.status] : null
  const currentTemplate = templateKey ? (templates[templateKey] || '') : ''
  const canSendWhatsApp = hasShopWhatsApp && customerPhoneDigits && currentTemplate

  const openWhatsAppStatus = () => {
    if (!canSendWhatsApp) return
    const name = job.customerId?.name || ''
    const vehicleNumber = job.carId?.carNumber || ''
    const token = job.tokenNumber || ''
    const text = fillTemplate(currentTemplate, { name, vehicleNumber, token })
    const url = `https://wa.me/${customerPhoneDigits}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    toast.success('WhatsApp opened. Send the message to the customer.')
  }

  const openWhatsAppGoogleReview = () => {
    const link = settings?.googleReviewLink?.trim()
    if (!link) {
      toast.error('Google Review link not set. Add it in WhatsApp Settings.')
      return
    }
    if (!customerPhoneDigits) {
      toast.error('Customer phone number is missing.')
      return
    }
    const text = `Thank you for choosing us 🙏\nPlease leave us a Google review: ${link}`
    const url = `https://wa.me/${customerPhoneDigits}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    toast.success('WhatsApp opened. Send the review request to the customer.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <p>Job not found</p>
        <Link to="/admin/jobs">
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    )
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

  const nextStatus = getNextStatus(job.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/admin/jobs" className="min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Job Details</h1>
          <p className="text-muted-foreground text-sm">Token: {job.tokenNumber}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-1 border-b border-border/60">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={cn('rounded-md', statusColors[job.status] || '')}>
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/60">
              <span className="text-sm text-muted-foreground">Token Number</span>
              <span className="font-medium text-slate-800">{job.tokenNumber}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/60">
              <span className="text-sm text-muted-foreground">Total Price</span>
              <span className="text-xl font-semibold text-primary">{formatCurrency(Number(job.totalPrice), settings?.currency)}</span>
            </div>
            {job.estimatedDelivery && (
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-sm text-muted-foreground">Estimated Delivery</span>
                <span className="font-medium">{format(new Date(job.estimatedDelivery), 'PPp')}</span>
              </div>
            )}
            {job.actualDelivery && (
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-sm text-muted-foreground">Actual Delivery</span>
                <span className="font-medium">{format(new Date(job.actualDelivery), 'PPp')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer & Car</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{job.customerId?.name}</div>
                <div className="text-sm text-muted-foreground">{job.customerId?.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{job.carId?.carNumber}</div>
                <div className="text-sm text-muted-foreground">
                  {job.carId?.brand} {job.carId?.model} {job.carId?.color && `• ${job.carId.color}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {job.services && job.services.map((js, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-2 border-b border-border/60 last:border-0 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="text-slate-700">{js.serviceId?.name || 'Service'}</span>
                  <span className="font-medium text-slate-800">{formatCurrency(Number(js.price), settings?.currency)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status & WhatsApp actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Status & WhatsApp</CardTitle>
            <CardDescription>
              Update job status and send status messages to the customer via WhatsApp (click-to-chat).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.status !== 'DELIVERED' && job.status !== 'CANCELLED' && (
              <>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-full sm:flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions
                        .filter(opt => {
                          if (job.status === 'RECEIVED') return opt.value === 'IN_PROGRESS'
                          if (job.status === 'IN_PROGRESS') return opt.value === 'WASHING'
                          if (job.status === 'WASHING') return opt.value === 'DRYING'
                          if (job.status === 'DRYING') return opt.value === 'COMPLETED'
                          if (job.status === 'COMPLETED') return opt.value === 'DELIVERED'
                          return false
                        })
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={updating || newStatus === job.status}
                    className="w-full sm:w-auto"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={updating}
                    className="w-full sm:flex-1"
                  >
                    {nextStatus === 'IN_PROGRESS' && '▶ Mark In Progress'}
                    {nextStatus === 'WASHING' && '▶ Mark Washing'}
                    {nextStatus === 'DRYING' && '▶ Mark Drying'}
                    {nextStatus === 'COMPLETED' && '✅ Mark Completed'}
                    {nextStatus === 'DELIVERED' && '🚗 Mark Delivered'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openWhatsAppStatus}
                    disabled={!canSendWhatsApp}
                    className="w-full sm:flex-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/30"
                    title={!hasShopWhatsApp ? 'Add Shop WhatsApp number in WhatsApp Settings' : !customerPhoneDigits ? 'Customer phone missing' : !currentTemplate ? 'Template empty in WhatsApp Settings' : 'Open WhatsApp with pre-filled message'}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send {job.status.replace('_', ' ')} WhatsApp
                  </Button>
                </div>
              </>
            )}

            {job.status === 'DELIVERED' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={openWhatsAppStatus}
                  disabled={!canSendWhatsApp}
                  className="w-full sm:flex-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border-[#25D366]/30"
                  title={!hasShopWhatsApp ? 'Add Shop WhatsApp number in WhatsApp Settings' : !customerPhoneDigits ? 'Customer phone missing' : 'Open WhatsApp'}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Delivered WhatsApp
                </Button>
                <Button
                  onClick={openWhatsAppGoogleReview}
                  disabled={!customerPhoneDigits || !settings?.googleReviewLink?.trim()}
                  className="w-full sm:flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  title={!settings?.googleReviewLink?.trim() ? 'Add Google Review link in WhatsApp Settings' : 'Open WhatsApp with review request'}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Ask for Google Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
