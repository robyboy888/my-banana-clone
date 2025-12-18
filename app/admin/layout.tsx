'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Home, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: '管理面板', href: '/admin', icon: LayoutDashboard },
    { name: '新增提示词', href: '/admin/add', icon: PlusCircle },
    { name: '返回首页', href: '/', icon: Home },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* 1. 左侧固定侧边栏 */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-slate-800 dark:text-white tracking-tight">ADMIN PANEL</span>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="w-3 h-3" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* 2. 右侧主内容区 */}
      <div className="flex-grow flex flex-col">
        {/* 顶部状态栏 */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              {pathname === '/admin' ? 'Dashboard' : 'Management'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black dark:text-white">Admin User</p>
                <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容注入点 */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}