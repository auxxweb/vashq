import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { MetricCard } from '../../components/admin/MetricCard'
import { Building2, CreditCard, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/currencyUtils'

const CHART_COLORS = {
  bar: '#FF7A45',
  line: '#6F7E9F',
  grid: '#E8ECF4',
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [revenueTrend, setRevenueTrend] = useState([])
  const [onboardingTrend, setOnboardingTrend] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    api.get('/super-admin/settings').then((r) => {
      if (r.data?.success && r.data.settings?.defaultCurrency) setCurrency(r.data.settings.defaultCurrency)
    }).catch(() => {})
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/super-admin/dashboard')
      if (response.data.success) {
        setStats(response.data.stats)
        setRevenueTrend(response.data.revenueTrend || [])
        setOnboardingTrend(response.data.onboardingTrend || [])
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Car Washes"
          value={stats.totalBusinesses}
          subtitle="Active businesses"
          icon={Building2}
          iconBg="orange"
          valueClassName="text-primary"
        />
        <MetricCard
          title="Active Subscriptions"
          value={stats.activePlans}
          subtitle="Currently active"
          icon={CreditCard}
          iconBg="blue"
        />
        <MetricCard
          title="Expired Subscriptions"
          value={stats.expiredPlans}
          subtitle="Need renewal"
          icon={TrendingUp}
          iconBg="purple"
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue, currency)}
          subtitle="This month"
          icon={TrendingUp}
          iconBg="orange"
          valueClassName="text-primary"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="month" stroke={CHART_COLORS.grid} />
                <YAxis stroke={CHART_COLORS.grid} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8ECF4' }} />
                <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.bar} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Growth</CardTitle>
            <CardDescription>New businesses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={onboardingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="month" stroke={CHART_COLORS.grid} />
                <YAxis stroke={CHART_COLORS.grid} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8ECF4' }} />
                <Bar dataKey="count" fill={CHART_COLORS.bar} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
