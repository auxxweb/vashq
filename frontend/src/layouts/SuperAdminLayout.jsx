import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { LayoutDashboard, Building2, Package, ArrowUpCircle, HelpCircle, Settings, LogOut, Menu, X, User } from 'lucide-react'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { cn } from '../lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { name: 'Car Washes', href: '/super-admin/businesses', icon: Building2 },
  { name: 'Plans', href: '/super-admin/subscription-plans', icon: Package },
  { name: 'Upgrade Requests', href: '/super-admin/upgrade-requests', icon: ArrowUpCircle },
  { name: 'Support', href: '/super-admin/support', icon: HelpCircle },
  { name: 'Settings', href: '/super-admin/settings', icon: Settings },
]

export default function SuperAdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
  }

  const NavSidebar = ({ onNavigate, slim = false, hideBrandTitle = false }) => (
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      {!slim && !hideBrandTitle && (
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <h1 className="text-xl font-bold text-primary tracking-tight">Vashq</h1>
        </div>
      )}
      <nav className={cn('flex-1', slim ? 'px-2 space-y-0.5' : 'mt-4 px-2 space-y-1')}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          const linkClass = slim
            ? cn(
                'flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-150 min-h-[44px] min-w-[44px]',
                isActive ? 'bg-primary text-primary-foreground shadow-soft' : 'text-[#333C4E] hover:bg-white/60 hover:shadow-soft'
              )
            : cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 min-h-[44px]',
                isActive ? 'bg-primary text-primary-foreground' : 'text-[#333C4E] hover:bg-white/60'
              )
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={linkClass}
              title={slim ? item.name : undefined}
            >
              <Icon className={cn('flex-shrink-0', slim ? 'h-5 w-5' : 'mr-3 h-5 w-5')} />
              {!slim && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex md:w-[60px] md:flex-col md:fixed md:inset-y-0 bg-[#EBEFF5] border-r border-border">
        <div className="flex items-center justify-center h-16 border-b border-border flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-soft">
            VQ
          </div>
        </div>
        <NavSidebar slim />
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-card border-r border-border shadow-soft-lg transform transition-transform duration-200 ease-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-border min-h-[44px]">
          <span className="text-lg font-bold text-primary tracking-tight">Vashq</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <NavSidebar onNavigate={() => setMobileMenuOpen(false)} hideBrandTitle />
      </div>

      <div className="flex flex-col flex-1 md:pl-[60px]">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6 min-h-[56px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 rounded-xl"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="md:hidden text-lg font-bold text-primary tracking-tight ml-1">Vashq</span>
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 min-h-[44px]">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden sm:block min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || user?.email || 'Super Admin'}</p>
                <p className="text-xs text-muted-foreground truncate">Admin</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-xl border-border text-foreground hover:bg-muted/80 min-h-[44px] px-4"
              aria-label="Sign out"
            >
              Sign out
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
