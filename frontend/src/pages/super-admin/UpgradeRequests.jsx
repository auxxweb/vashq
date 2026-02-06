import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function UpgradeRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [detailRequest, setDetailRequest] = useState(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await api.get('/super-admin/upgrade-requests')
      if (res.data.success) setRequests(res.data.requests || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/super-admin/upgrade-requests/${id}/approve`)
      if (res.data.success) {
        toast.success('Upgrade approved. Shop subscription updated.')
        setDetailRequest(null)
        fetchRequests()
      } else toast.error(res.data.message || 'Failed to approve')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to approve')
    }
  }

  const handleReject = async (id) => {
    try {
      const res = await api.patch(`/super-admin/upgrade-requests/${id}/reject`)
      if (res.data.success) {
        toast.success('Upgrade rejected')
        setDetailRequest(null)
        fetchRequests()
      } else toast.error(res.data.message || 'Failed to reject')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject')
    }
  }

  const shopName = (r) => r.shopId?.businessName || r.shopId?.ownerName || 'Shop'
  const currentPlan = (r) => r.currentPlanId?.name || '—'
  const requestedPlan = (r) => r.requestedPlanId?.name || '—'

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted rounded-lg" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upgrade Requests</h1>
        <p className="text-muted-foreground">Review and approve or reject plan upgrade requests from shops. No payment processing.</p>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r._id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{shopName(r)}</CardTitle>
                  <CardDescription>
                    {currentPlan(r)} → {requestedPlan(r)}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requested {r.createdAt ? format(new Date(r.createdAt), 'PPp') : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={r.status === 'PENDING' ? 'default' : r.status === 'APPROVED' ? 'default' : 'secondary'}
                    className={r.status === 'APPROVED' ? 'bg-green-600' : r.status === 'REJECTED' ? 'bg-gray-500' : ''}
                  >
                    {r.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => setDetailRequest(r)} aria-label="View details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {r.status === 'PENDING' && (
                    <>
                      <Button size="sm" onClick={() => handleApprove(r._id)} className="gap-1">
                        <CheckCircle className="h-4 w-4" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(r._id)} className="gap-1">
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {requests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No upgrade requests yet. Shops will appear here when they request a plan upgrade.
          </CardContent>
        </Card>
      )}

      {/* Detail modal */}
      <Dialog open={!!detailRequest} onOpenChange={(open) => !open && setDetailRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade request details</DialogTitle>
          </DialogHeader>
          {detailRequest && (
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Shop:</span> {shopName(detailRequest)}</p>
              <p><span className="font-medium">Current plan:</span> {currentPlan(detailRequest)}</p>
              <p><span className="font-medium">Requested plan:</span> {requestedPlan(detailRequest)}</p>
              <p><span className="font-medium">Request date:</span> {detailRequest.createdAt ? format(new Date(detailRequest.createdAt), 'PPp') : '—'}</p>
              {detailRequest.actionedAt && (
                <p><span className="font-medium">Actioned:</span> {format(new Date(detailRequest.actionedAt), 'PPp')}</p>
              )}
              {detailRequest.message && (
                <p><span className="font-medium">Message:</span> {detailRequest.message}</p>
              )}
              <p><span className="font-medium">Status:</span> <Badge>{detailRequest.status}</Badge></p>
              {detailRequest.status === 'PENDING' && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleApprove(detailRequest._id)} className="gap-1"><CheckCircle className="h-4 w-4" /> Approve</Button>
                  <Button variant="destructive" onClick={() => handleReject(detailRequest._id)} className="gap-1"><XCircle className="h-4 w-4" /> Reject</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
