import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Bell, CheckCircle, Circle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/notifications')
      if (response.data.success) {
        setNotifications(response.data.notifications || [])
        setUnreadCount(response.data.unreadCount || 0)
      }
    } catch (error) {
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`)
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(Math.max(0, unreadCount - 1))
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to update notification')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/admin/notifications/read-all')
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to update notifications')
    }
  }

  const getTypeBadge = (type) => {
    const colors = {
      PLAN_EXPIRY: 'bg-orange-500',
      JOB_UPDATE: 'bg-blue-500',
      SUPPORT_RESPONSE: 'bg-green-500',
      SYSTEM_ALERT: 'bg-red-500',
      PAYMENT_REMINDER: 'bg-yellow-500'
    }
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.replace('_', ' ')}</Badge>
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your business activities</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification._id} className={!notification.isRead ? 'border-blue-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      {getTypeBadge(notification.type)}
                      {!notification.isRead && (
                        <Badge variant="default" className="bg-blue-500">New</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {new Date(notification.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                {notification.link && (
                  <Button
                    variant="link"
                    className="mt-2 p-0"
                    onClick={() => window.location.href = notification.link}
                  >
                    View Details →
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
