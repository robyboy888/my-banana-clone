'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 必须在挂载后运行，否则服务端渲染的主题可能与客户端不匹配导致报错
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 还没挂载时返回一个占位符，防止页面跳动
    return <div className="p-2 w-10 h-10" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:ring-2 ring-indigo-500/50 transition-all duration-300 group"
      aria-label="切换主题"
    >
      {/* 太阳图标 */}
      <Sun 
        className={`h-5 w-5 text-yellow-500 transition-all duration-500 transform ${
          theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90 opacity-0'
        }`} 
      />
      
      {/* 月亮图标 - 绝对定位重叠 */}
      <Moon 
        className={`absolute top-2.5 left-2.5 h-5 w-5 text-indigo-600 transition-all duration-500 transform ${
          theme === 'dark' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0'
        }`} 
      />

      {/* 悬浮气泡提示 */}
      <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
        {theme === 'dark' ? '切换为明亮模式' : '切换为暗黑模式'}
      </span>
    </button>
  );
}