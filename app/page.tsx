import { supabase } from "../src/lib/supabase"; 
import HomeClient from "./HomeClient";
import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

// 禁用缓存，确保每次访问都抓取最新数据
export const revalidate = 0; 

export default async function Page() {
    let initialData = [];

    try {
        // 从 Supabase 获取数据
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
        <div className="min-h-screen bg-white dark:bg-[#0f1115] transition-colors duration-500">
            
            {/* 1. 顶部导航栏 (采用深灰色 bg-[#1a1c20] 与下方极黑区分) */}
            <header className="sticky top-0 z-[60] w-full border-b border-white/5 bg-[#1a1c20]/95 backdrop-blur-md">
                <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">
                    {/* 左侧 Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3fc1c0] rounded-lg flex items-center justify-center shadow-lg shadow-[#3fc1c0]/20">
                            <span className="text-white font-black text-sm">B</span>
                        </div>
                        <h1 className="text-sm font-black tracking-tighter text-white uppercase flex items-center gap-1">
                            BANANA <span className="text-[#3fc1c0]">CLONE</span>
                        </h1>
                    </div>
                    
                    {/* 右侧 功能区 */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <a 
                            href="/admin" 
                            className="text-[10px] font-black tracking-widest uppercase px-5 py-2 rounded-full bg-white text-[#0f1115] hover:bg-[#3fc1c0] hover:text-white transition-all shadow-sm"
                        >
                            DASHBOARD
                        </a>
                    </div>
                </div>
            </header>

            {/* 2. 主内容交互区
                标题 "Banana Clone" 和 "搜索框" 已经合并在 HomeClient 内部。
                HomeClient 的顶部背景色为 [#0f1115] (更深的黑色)，
                这样就与上面的 header [#1a1c20] 形成了截图中的两层色差。
            */}
            <main className="relative">
                <HomeClient 
                    initialPrompts={initialData} 
                />
            </main>

            {/* 3. 页脚 */}
            <footer className="py-16 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0f1115]">
                <div className="container mx-auto px-6 text-center text-slate-400 dark:text-slate-600 text-[10px] font-black tracking-[0.3em] uppercase">
                    © 2025 BANANA CLONE · CURATED AI PROMPT GALLERY
                </div>
            </footer>
        </div>
    );
}