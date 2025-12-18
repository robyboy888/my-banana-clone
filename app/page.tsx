import { supabase } from "../src/lib/supabase"; 
import HomeClient from "./HomeClient";
import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle'; // 引入切换按钮

// 禁用缓存，确保每次访问都抓取最新数据
export const revalidate = 0; 

export default async function Page() {
    let initialData = [];
    try {
        const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            initialData = data;
        }
    } catch (err) {
        console.error("数据库抓取失败:", err);
    }

    return (
        // 增加一个外层容器，确保背景色在暗黑模式下能撑满全屏
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* 顶栏导航：这里我们直接把 ThemeToggle 放在这里，或者你可以移入你的 Header 组件 */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-black text-xl">B</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-slate-800 dark:text-white">
                            BANANA <span className="text-indigo-600">CLONE</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* 放置暗黑模式切换开关 */}
                        <ThemeToggle />
                        
                        {/* 如果有管理后台入口可以放这里 */}
                        <a 
                            href="/admin" 
                            className="hidden sm:block text-xs font-bold px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all"
                        >
                            管理后台
                        </a>
                    </div>
                </div>
            </header>

            <main>
                <HomeClient initialPrompts={initialData} />
            </main>

            {/* 页脚 */}
            <footer className="py-12 border-t border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-6 text-center text-slate-400 text-sm font-medium">
                    © 2024 Banana Clone · 精选 AI 提示词库
                </div>
            </footer>
        </div>
    );
}