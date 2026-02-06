import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Badge } from '../../components/ui/badge'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format, differenceInDays } from 'date-fns'
import { preventEnterSubmit } from '../../lib/formUtils'
import { formatCurrency } from '../../lib/currencyUtils'

export default function MyPlan() {
  const [subscription, setSubscription] = useState(null)
  const [availablePlans, setAvailablePlans] = useState([])
  const [pendingRequest, setPendingRequest] = useState(null)
  const [canRequestUpgrade, setCanRequestUpgrade] = useState(true)
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [requestingPlanId, setRequestingPlanId] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    api.get('/admin/settings').then((r) => {
      if (r.data?.success && r.data.settings?.currency) setCurrency(r.data.settings.currency)
    }).catch(() => {})
  }, [])

  const loadData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        api.get('/admin/my-subscription'),
        api.get('/admin/available-plans')
      ])
      if (subRes.data.success) {
        setSubscription(subRes.data.subscription)
        setCanRequestUpgrade(subRes.data.canRequestUpgrade !== false)
      }
      if (plansRes.data.success) setAvailablePlans(plansRes.data.plans || [])
      const pendingRes = await api.get('/admin/upgrade-requests').catch(() => ({}))
      if (pendingRes.data?.requests) {
        const pending = pendingRes.data.requests.find((r) => r.status === 'PENDING')
        setPendingRequest(pending || null)
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load plan data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    if (!requestingPlanId) {
      toast.error('Select a plan')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post('/admin/upgrade-request', {
        requestedPlanId: requestingPlanId,
        message: message || undefined
      })
      if (res.data.success) {
        toast.success('Upgrade request submitted. Pending admin approval.')
        setRequestModalOpen(false)
        setRequestingPlanId('')
        setMessage('')
        setPendingRequest(res.data.request)
        setCanRequestUpgrade(false)
      } else toast.error(res.data.message || 'Failed to submit request')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const openRequestModal = (planId) => {
    setRequestingPlanId(planId)
    setMessage('')
    setRequestModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const plan = subscription?.planId
  const startDate = subscription?.startDate ? new Date(subscription.startDate) : null
  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null
  const daysRemaining = expiryDate && expiryDate > new Date() ? differenceInDays(expiryDate, new Date()) : 0
  const isExpired = subscription?.status === 'EXPIRED'
  const hasPendingRequest = !!pendingRequest
  const upgradeDisabled = !canRequestUpgrade || hasPendingRequest

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">My Plan</h1>
        <p className="text-muted-foreground text-sm mt-0.5">View your current subscription and request plan upgrades. Admin approval required.</p>
      </div>

      {/* Section 1: Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!subscription ? (
            <p className="text-muted-foreground">No subscription found. Contact platform admin.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-semibold text-slate-800">{plan?.name || '—'}</span>
                <Badge variant={isExpired ? 'secondary' : 'default'} className={!isExpired ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}>
                  {subscription.status}
                </Badge>
              </div>
              {plan?.price != null && (
                <p className="text-sm"><span className="text-muted-foreground">Price:</span> <span className="font-medium">{formatCurrency(plan.price, currency)}</span></p>
              )}
              <div className="grid gap-2 text-sm">
                {startDate && <p><span className="text-muted-foreground">Start date:</span> {format(startDate, 'PPP')}</p>}
                {expiryDate && (
                  <p>
                    <span className="text-muted-foreground">Expiry date:</span> {format(expiryDate, 'PPP')}
                    {!isExpired && <span className="ml-2 text-muted-foreground">({daysRemaining} days remaining)</span>}
                  </p>
                )}
              </div>
              {plan?.features?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Features</p>
                  <ul className="list-disc list-inside text-sm space-y-0.5">
                    {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {hasPendingRequest && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-sm text-amber-800">
                  <strong>Pending upgrade request</strong> — Waiting for admin approval. You cannot submit another request until this is processed.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Available plans */}
      <div>
        <h2 className="text-lg font-medium text-slate-800 mb-1">Available Plans</h2>
        <p className="text-sm text-muted-foreground mb-4">Request an upgrade. Admin approval required — no online payment.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availablePlans.map((p) => {
            const isCurrent = plan?._id === p._id
            return (
              <Card key={p._id} className="transition-shadow duration-150">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">{p.name}</CardTitle>
                  <CardDescription>{p.validityDays} days validity · {formatCurrency(p.price ?? 0, currency)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                  {p.features?.length > 0 && (
                    <ul className="text-sm list-disc list-inside space-y-0.5">
                      {p.features.slice(0, 5).map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  )}
                  <Button
                    size="sm"
                    variant={isCurrent ? 'secondary' : 'default'}
                    disabled={isCurrent || upgradeDisabled}
                    onClick={() => openRequestModal(p._id)}
                    className="gap-1"
                  >
                    <Send className="h-4 w-4" />
                    {isCurrent ? 'Current plan' : hasPendingRequest ? 'Request pending' : !canRequestUpgrade ? 'Upgrade not available' : 'Request upgrade'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {availablePlans.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">No other plans available.</CardContent>
          </Card>
        )}
      </div>

      {/* Upgrade request modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request plan upgrade</DialogTitle>
            <DialogDescription>Your request will be reviewed by the admin. No payment is processed — admin approval required.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRequest} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div>
              <Label>Message to admin (optional)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. We need more capacity for the upcoming season"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRequestModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
