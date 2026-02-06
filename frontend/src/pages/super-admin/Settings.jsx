import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { toast } from 'sonner'

const defaultSettings = {
  platformName: 'Vashq',
  supportEmail: '',
  supportPhone: '',
  defaultCurrency: 'USD',
  defaultLanguage: 'en'
}

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await api.get('/super-admin/settings')
      if (response.data.success && response.data.settings) {
        setSettings({ ...defaultSettings, ...response.data.settings })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error(error.response?.data?.message || 'Failed to load settings')
    } finally {
      setFetching(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await api.put('/super-admin/settings', settings)
      if (response.data.success) {
        toast.success('Settings saved successfully')
        if (response.data.settings) {
          setSettings(prev => ({ ...prev, ...response.data.settings }))
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
        <Card className="animate-pulse">
          <CardHeader className="h-20 bg-muted rounded-lg" />
          <CardContent className="h-64 bg-muted/60 rounded-lg mt-2" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage platform settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure general platform settings. These apply across the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              placeholder="Vashq"
            />
          </div>
          <div>
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              placeholder="support@example.com"
            />
          </div>
          <div>
            <Label htmlFor="supportPhone">Support Phone</Label>
            <Input
              id="supportPhone"
              value={settings.supportPhone}
              onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
          <div>
            <Label htmlFor="defaultCurrency">Default Currency</Label>
            <Select
              value={settings.defaultCurrency || 'USD'}
              onValueChange={(value) => setSettings({ ...settings, defaultCurrency: value })}
            >
              <SelectTrigger id="defaultCurrency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">Applies to the entire platform. Car wash admins cannot change this.</p>
          </div>
          <div>
            <Label htmlFor="defaultLanguage">Default Language</Label>
            <Select
              value={settings.defaultLanguage}
              onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={loading} className="min-h-[44px]">
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
