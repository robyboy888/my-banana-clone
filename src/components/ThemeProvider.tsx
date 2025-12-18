'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 必须在挂载后运行，否则服务端和客户端的主题可能不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-9 h-9" />; // 占位符，避免布局跳动
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:ring-2 ring-indigo-500 transition-all duration-300 group"
      aria-label="Toggle Dark Mode"
    >
      {/* 太阳图标：仅在暗黑模式显示，带旋转效果 */}
      <Sun 
        className="h-5 w-5 text-yellow-500 transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0" 
      />
      
      {/* 月亮图标：仅在明亮模式显示，带旋转效果 */}
      <Moon 
        className="absolute top-2 left-2 h-5 w-5 text-indigo-600 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90" 
      />

      {/* 悬浮提示（可选） */}
      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {theme === 'dark' ? '切换明亮' : '切换暗黑'}
      </span>
    </button>
  );
}