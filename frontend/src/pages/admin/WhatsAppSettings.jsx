import { useState, useEffect } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { MessageCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { preventEnterSubmit } from '../../lib/formUtils'

const DEFAULT_TEMPLATES = {
  received: 'Hello {{name}}, your vehicle {{vehicleNumber}} has been received. Token: {{token}}',
  inProgress: 'Your car {{vehicleNumber}} is now in progress.',
  washing: 'Your car {{vehicleNumber}} is currently being washed.',
  drying: 'Your car {{vehicleNumber}} is being dried.',
  completed: '✅ Your car wash for {{vehicleNumber}} is completed.',
  delivered: '🚗 Thank you! Your vehicle {{vehicleNumber}} has been delivered.'
}

const TEMPLATE_LABELS = {
  received: 'Received',
  inProgress: 'In Progress',
  washing: 'Washing',
  drying: 'Drying',
  completed: 'Completed',
  delivered: 'Delivered'
}

const PLACEHOLDERS = '{{name}}, {{vehicleNumber}}, {{token}}'

export default function WhatsAppSettings() {
  const [loading, setLoading] = useState(true)
  const [savingNumber, setSavingNumber] = useState(false)
  const [savingTemplates, setSavingTemplates] = useState(false)
  const [savingReviewLink, setSavingReviewLink] = useState(false)
  const [shopWhatsappNumber, setShopWhatsappNumber] = useState('')
  const [googleReviewLink, setGoogleReviewLink] = useState('')
  const [templates, setTemplates] = useState({ ...DEFAULT_TEMPLATES })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings')
      if (res.data.success && res.data.settings) {
        const s = res.data.settings
        setShopWhatsappNumber(s.shopWhatsappNumber || '')
        setGoogleReviewLink(s.googleReviewLink || '')
        setTemplates({
          ...DEFAULT_TEMPLATES,
          ...(s.whatsappTemplates || {})
        })
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNumber = async (e) => {
    e?.preventDefault()
    const num = (shopWhatsappNumber || '').trim()
    if (!num) {
      toast.error('Shop WhatsApp number is required')
      return
    }
    setSavingNumber(true)
    try {
      await api.put('/admin/settings', { shopWhatsappNumber: num })
      toast.success('Shop WhatsApp number saved')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save')
    } finally {
      setSavingNumber(false)
    }
  }

  const handleSaveTemplates = async (e) => {
    e?.preventDefault()
    setSavingTemplates(true)
    try {
      await api.put('/admin/settings', { whatsappTemplates: templates })
      toast.success('Templates saved')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save templates')
    } finally {
      setSavingTemplates(false)
    }
  }

  const handleResetTemplates = () => {
    setTemplates({ ...DEFAULT_TEMPLATES })
    toast.success('Templates reset to default. Click Save Templates to apply.')
  }

  const handleSaveReviewLink = async (e) => {
    e?.preventDefault()
    setSavingReviewLink(true)
    try {
      await api.put('/admin/settings', { googleReviewLink: (googleReviewLink || '').trim() })
      toast.success('Google Review link saved')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save link')
    } finally {
      setSavingReviewLink(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageCircle className="h-8 w-8 text-[#25D366]" />
          WhatsApp Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure click-to-WhatsApp alerts for job status. No API or automation — you send messages manually from your number.
        </p>
      </div>

      {/* 1. Shop WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Shop WhatsApp Number</CardTitle>
          <CardDescription>
            Your shop WhatsApp number (with country code, e.g. 1234567890). Used for wa.me click-to-chat to the customer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSaveNumber} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div>
              <Label htmlFor="shopWhatsappNumber">WhatsApp Number *</Label>
              <Input
                id="shopWhatsappNumber"
                type="tel"
                placeholder="e.g. 1234567890"
                value={shopWhatsappNumber}
                onChange={(e) => setShopWhatsappNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={savingNumber}>
              {savingNumber ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. WhatsApp Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Message Templates</CardTitle>
          <CardDescription>
            Editable messages for each job status. Use placeholders: {PLACEHOLDERS}. You can copy the pre-filled message and send from WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Allowed placeholders: <code className="bg-muted px-1 rounded">{PLACEHOLDERS}</code>
          </p>
          {(Object.keys(TEMPLATE_LABELS)).map((key) => (
            <div key={key}>
              <Label htmlFor={`template-${key}`}>{TEMPLATE_LABELS[key]}</Label>
              <Textarea
                id={`template-${key}`}
                value={templates[key] ?? ''}
                onChange={(e) => setTemplates((prev) => ({ ...prev, [key]: e.target.value }))}
                rows={3}
                className="mt-1 font-mono text-sm"
                placeholder={DEFAULT_TEMPLATES[key]}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveTemplates} disabled={savingTemplates}>
              {savingTemplates ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Templates
            </Button>
            <Button type="button" variant="outline" onClick={handleResetTemplates}>
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Google Review Link */}
      <Card>
        <CardHeader>
          <CardTitle>Google Review Link</CardTitle>
          <CardDescription>
            URL for customers to leave a Google review. Shown in the &quot;Ask for Google Review&quot; WhatsApp message after delivery.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSaveReviewLink} onKeyDown={preventEnterSubmit} className="space-y-4">
            <div>
              <Label htmlFor="googleReviewLink">Google Review URL</Label>
              <Input
                id="googleReviewLink"
                type="url"
                placeholder="https://g.page/your-business/review"
                value={googleReviewLink}
                onChange={(e) => setGoogleReviewLink(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button type="submit" disabled={savingReviewLink}>
              {savingReviewLink ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
