import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Bell, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

const pathToName: Record<string, string> = {
  '/': '首页',
  '/dashboard': '床位看板',
  '/checkin': '入住登记',
  '/care-plan': '护理计划',
  '/schedule': '排班表',
  '/events': '事件记录',
  '/billing': '费用核对',
  '/statistics': '统计分析',
  '/settings': '系统设置',
}

function getBreadcrumb(pathname: string): { label: string; path: string }[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; path: string }[] = [
    { label: '首页', path: '/' },
  ]

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = pathToName[currentPath] || segment
    breadcrumbs.push({ label, path: currentPath })
  }

  if (breadcrumbs.length === 1 && pathname !== '/') {
    const label = pathToName[pathname] || pathname
    breadcrumbs.push({ label, path: pathname })
  }

  return breadcrumbs
}

export default function Navbar() {
  const location = useLocation()
  const { currentUser } = useStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const breadcrumbs = getBreadcrumb(location.pathname)
  const avatarBg = 'bg-gradient-to-br from-primary-400 to-primary-600'
  const avatarInitial = currentUser.name.charAt(0)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <nav className="flex items-center gap-1.5 text-sm overflow-x-auto scrollbar-hidden">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center shrink-0">
                {index > 0 && (
                  <span className="mx-1.5 text-slate-400">/</span>
                )}
                <span
                  className={cn(
                    'px-2 py-1 rounded-md transition-colors',
                    index === breadcrumbs.length - 1
                      ? 'text-slate-900 font-medium bg-slate-100'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索..."
              className="h-9 w-48 lg:w-64 pl-9 pr-3 rounded-lg bg-slate-100 border border-transparent text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>

          <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-semibold',
                  avatarBg
                )}
              >
                {avatarInitial}
              </div>
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium text-slate-800 leading-tight truncate max-w-[120px]">
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[120px]">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className={cn('h-4 w-4 text-slate-400 shrink-0 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 py-2 overflow-hidden animate-[fadeInUp_0.15s_ease-out]">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">{currentUser.role}</p>
                </div>
                <div className="py-1">
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    个人资料
                  </button>
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Settings className="h-4 w-4 text-slate-400" />
                    系统设置
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
