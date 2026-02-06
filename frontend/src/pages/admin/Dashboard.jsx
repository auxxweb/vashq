import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { MetricCard } from '../../components/admin/MetricCard'
import { Button } from '../../components/ui/button'
import { FileText, Car, Clock, DollarSign, Plus, Users, ListTodo, UserPlus, Wrench, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { formatCurrency } from '../../lib/currencyUtils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const CHART_COLORS = {
  bar: '#FF7A45',
  line: '#6F7E9F',
  grid: '#E8ECF4',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [jobsTrend, setJobsTrend] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    api.get('/admin/settings').then((r) => {
      if (r.data?.success && r.data.settings?.currency) setCurrency(r.data.settings.currency)
    }).catch(() => {})
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard')
      if (response.data.success) {
        setStats(response.data.stats)
        setJobsTrend(response.data.jobsTrend || [])
        setRevenueTrend(response.data.revenueTrend || [])
      } else {
        toast.error('Failed to fetch dashboard data')
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <Link to="/admin/jobs/new" className="min-h-[44px] flex items-center">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Plus className="h-5 w-5" />
            New Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Today's Jobs"
          value={stats.todayJobs}
          subtitle="Total jobs today"
          icon={FileText}
          iconBg="orange"
          valueClassName="text-primary"
        />
        <MetricCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Cars being serviced"
          icon={Car}
          iconBg="blue"
        />
        <MetricCard
          title="Avg Completion"
          value={`${stats.avgCompletionTime} min`}
          subtitle="Average time"
          icon={Clock}
          iconBg="purple"
        />
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue, currency)}
          subtitle="Revenue today"
          icon={DollarSign}
          iconBg="orange"
          valueClassName="text-primary"
        />
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue, currency)}
          subtitle="This month"
          icon={DollarSign}
          iconBg="blue"
        />
        <MetricCard
          title="Pending Deliveries"
          value={stats.pendingDeliveries}
          subtitle="Awaiting pickup"
          icon={Users}
          iconBg="red"
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/jobs/new">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Job
            </Button>
          </Link>
          <Link to="/admin/jobs">
            <Button variant="outline" size="sm" className="gap-2">
              <ListTodo className="h-4 w-4" />
              View All Jobs
            </Button>
          </Link>
          <Link to="/admin/customers">
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Customers
            </Button>
          </Link>
          <Link to="/admin/services">
            <Button variant="outline" size="sm" className="gap-2">
              <Wrench className="h-4 w-4" />
              Services
            </Button>
          </Link>
          <Link to="/admin/my-plan">
            <Button variant="outline" size="sm" className="gap-2">
              <CreditCard className="h-4 w-4" />
              My Plan
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jobs (last 7 days)</CardTitle>
            <CardDescription>Number of jobs per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={jobsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={CHART_COLORS.grid} />
                <YAxis allowDecimals={false} stroke={CHART_COLORS.grid} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8ECF4' }} />
                <Bar dataKey="jobs" fill={CHART_COLORS.bar} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue (last 7 days)</CardTitle>
            <CardDescription>Daily revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={CHART_COLORS.grid} />
                <YAxis tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} stroke={CHART_COLORS.grid} />
                <Tooltip formatter={(value) => [formatCurrency(value, currency), 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #E8ECF4' }} />
                <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.bar} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
