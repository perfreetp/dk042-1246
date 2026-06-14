import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  CalendarClock,
  AlertCircle,
  Receipt,
  BarChart3,
  Settings,
  HeartPulse,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: '床位看板', icon: LayoutDashboard },
  { to: '/checkin', label: '入住登记', icon: UserPlus },
  { to: '/care-plan', label: '护理计划', icon: ClipboardList },
  { to: '/schedule', label: '排班表', icon: CalendarClock },
  { to: '/events', label: '事件记录', icon: AlertCircle },
  { to: '/billing', label: '费用核对', icon: Receipt },
  { to: '/statistics', label: '统计分析', icon: BarChart3 },
]

const bottomItems: NavItem[] = [
  { to: '/settings', label: '系统设置', icon: Settings },
]

export default function Sidebar() {
  const { currentUser } = useStore()

  const avatarBg = 'bg-gradient-to-br from-primary-400 to-primary-600'
  const avatarInitial = currentUser.name.charAt(0)

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col bg-white border-r border-slate-200 z-40">
      <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-500/25">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 leading-tight">颐养管家</h1>
          <p className="text-[11px] text-slate-500">智慧养老管理系统</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-100/50'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <item.icon className={cn('h-5 w-5 shrink-0')} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-slate-200 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50">
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-semibold',
              avatarBg
            )}
          >
            {avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
