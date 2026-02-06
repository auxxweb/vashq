import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettings() {
  const [business, setBusiness] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    whatsappNumber: '',
    address: '',
    location: '',
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    carHandlingCapacity: 'SINGLE',
    maxConcurrentJobs: 1
  })
  const [settings, setSettings] = useState({
    capacity: 5,
    currency: 'USD',
    timezone: 'UTC',
    autoSendWhatsApp: true,
    workingHours: { start: '09:00', end: '18:00' },
    notificationPreferences: {
      jobCreated: true,
      jobCompleted: true,
      jobDelivered: true,
      planExpiry: true
    }
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const loadData = async () => {
    try {
      const [businessRes, settingsRes] = await Promise.allSettled([
        api.get('/admin/business'),
        api.get('/admin/settings')
      ])
      if (businessRes.status === 'fulfilled' && businessRes.value?.data?.success && businessRes.value.data.business) {
        const b = businessRes.value.data.business
        setBusiness({
          businessName: b.businessName || '',
          ownerName: b.ownerName || '',
          email: b.email || '',
          phone: b.phone || '',
          whatsappNumber: b.whatsappNumber || '',
          address: b.address || '',
          location: b.location || '',
          workingHoursStart: b.workingHoursStart || '09:00',
          workingHoursEnd: b.workingHoursEnd || '18:00',
          carHandlingCapacity: b.carHandlingCapacity || 'SINGLE',
          maxConcurrentJobs: b.maxConcurrentJobs ?? 1
        })
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.data?.success && settingsRes.value.data.settings) {
        const s = settingsRes.value.data.settings
        setSettings(prev => ({
          ...prev,
          capacity: s.capacity ?? prev.capacity,
          currency: s.currency ?? prev.currency,
          timezone: s.timezone ?? prev.timezone,
          autoSendWhatsApp: s.autoSendWhatsApp !== undefined ? s.autoSendWhatsApp : prev.autoSendWhatsApp,
          workingHours: s.workingHours ? { start: s.workingHours.start || '09:00', end: s.workingHours.end || '18:00' } : prev.workingHours,
          notificationPreferences: s.notificationPreferences
            ? { ...prev.notificationPreferences, ...s.notificationPreferences }
            : prev.notificationPreferences
        }))
      }
      if (settingsRes.status === 'rejected') {
        toast.error('Failed to load settings')
      }
    } catch (e) {
      toast.error('Failed to load page')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    loadData().then(() => {})
    return () => { cancelled = true }
  }, [])

  const handleSaveBusiness = async () => {
    setLoading(true)
    try {
      await api.put('/admin/business', business)
      toast.success('Business information updated successfully')
      loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update business information')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const payload = {
        capacity: settings.capacity,
        timezone: settings.timezone,
        autoSendWhatsApp: settings.autoSendWhatsApp,
        workingHours: settings.workingHours || { start: '09:00', end: '18:00' },
        notificationPreferences: settings.notificationPreferences
      }
      const response = await api.put('/admin/settings', payload)
      if (response.data.success) {
        toast.success('Settings saved successfully')
        if (response.data.settings) {
          const s = response.data.settings
          setSettings(prev => ({
            ...prev,
            ...s,
            workingHours: s.workingHours ? { ...prev.workingHours, ...s.workingHours } : prev.workingHours,
            notificationPreferences: s.notificationPreferences
              ? { ...prev.notificationPreferences, ...s.notificationPreferences }
              : prev.notificationPreferences
          }))
        }
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your business information and preferences</p>
      </div>

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="business">Business Information</TabsTrigger>
          <TabsTrigger value="settings">Settings & Preferences</TabsTrigger>
        </TabsList>

        {/* Business Information Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details. You can edit this information anytime.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={business.businessName}
                    onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={business.ownerName}
                    onChange={(e) => setBusiness({ ...business, ownerName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Business Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={business.email}
                  onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={business.address}
                  onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={business.location}
                  onChange={(e) => setBusiness({ ...business, location: e.target.value })}
                  placeholder="City, State, Country"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={business.phone}
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                  <Input
                    id="whatsappNumber"
                    value={business.whatsappNumber}
                    onChange={(e) => setBusiness({ ...business, whatsappNumber: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="workingHoursStart">Working Hours Start *</Label>
                  <Input
                    id="workingHoursStart"
                    type="time"
                    value={business.workingHoursStart}
                    onChange={(e) => setBusiness({ ...business, workingHoursStart: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="workingHoursEnd">Working Hours End *</Label>
                  <Input
                    id="workingHoursEnd"
                    type="time"
                    value={business.workingHoursEnd}
                    onChange={(e) => setBusiness({ ...business, workingHoursEnd: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carHandlingCapacity">Car Handling Capacity *</Label>
                  <Select
                    value={business.carHandlingCapacity}
                    onValueChange={(value) => setBusiness({ 
                      ...business, 
                      carHandlingCapacity: value,
                      maxConcurrentJobs: value === 'SINGLE' ? 1 : business.maxConcurrentJobs
                    })}
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
                {business.carHandlingCapacity === 'MULTIPLE' && (
                  <div>
                    <Label htmlFor="maxConcurrentJobs">Max Concurrent Jobs *</Label>
                    <Input
                      id="maxConcurrentJobs"
                      type="number"
                      min="1"
                      value={business.maxConcurrentJobs}
                      onChange={(e) => setBusiness({ ...business, maxConcurrentJobs: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={handleSaveBusiness} disabled={loading} className="min-h-[44px]">
                  {loading ? 'Saving...' : 'Save Business Information'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings & Preferences Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Settings</CardTitle>
              <CardDescription>Configure your business operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="settingsWorkingHoursStart">Working Hours Start</Label>
                  <Input
                    id="settingsWorkingHoursStart"
                    type="time"
                    value={settings.workingHours?.start || '09:00'}
                    onChange={(e) => setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, start: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="settingsWorkingHoursEnd">Working Hours End</Label>
                  <Input
                    id="settingsWorkingHoursEnd"
                    type="time"
                    value={settings.workingHours?.end || '18:00'}
                    onChange={(e) => setSettings({
                      ...settings,
                      workingHours: { ...settings.workingHours, end: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="capacity">Daily Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={settings.capacity}
                  onChange={(e) => setSettings({ ...settings, capacity: parseInt(e.target.value) || 5 })}
                />
                <p className="text-sm text-muted-foreground mt-1">Maximum number of jobs per day</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Timezone preferences. Currency is set in Super Admin Settings and applies across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">EST (America/New_York)</SelectItem>
                      <SelectItem value="America/Chicago">CST (America/Chicago)</SelectItem>
                      <SelectItem value="America/Denver">MST (America/Denver)</SelectItem>
                      <SelectItem value="America/Los_Angeles">PST (America/Los_Angeles)</SelectItem>
                      <SelectItem value="Asia/Kolkata">IST (Asia/Kolkata)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-send WhatsApp Messages</Label>
                  <p className="text-sm text-muted-foreground">Automatically send WhatsApp notifications for job updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSendWhatsApp}
                  onChange={(e) => setSettings({ ...settings, autoSendWhatsApp: e.target.checked })}
                  className="h-4 w-4"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Job Created</Label>
                  <input
                    type="checkbox"
                    checked={settings.notificationPreferences?.jobCreated || false}
                    onChange={(e) => setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        jobCreated: e.target.checked
                      }
                    })}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Job Completed</Label>
                  <input
                    type="checkbox"
                    checked={settings.notificationPreferences?.jobCompleted || false}
                    onChange={(e) => setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        jobCompleted: e.target.checked
                      }
                    })}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Job Delivered</Label>
                  <input
                    type="checkbox"
                    checked={settings.notificationPreferences?.jobDelivered || false}
                    onChange={(e) => setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        jobDelivered: e.target.checked
                      }
                    })}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Plan Expiry Reminders</Label>
                  <input
                    type="checkbox"
                    checked={settings.notificationPreferences?.planExpiry || false}
                    onChange={(e) => setSettings({
                      ...settings,
                      notificationPreferences: {
                        ...settings.notificationPreferences,
                        planExpiry: e.target.checked
                      }
                    })}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={loading} size="lg" className="min-h-[44px]">
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
