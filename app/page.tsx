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
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {/* 1. 顶部导航栏 (保持简洁透明) */}
            <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#3fc1c0] rounded-xl flex items-center justify-center shadow-lg shadow-[#3fc1c0]/20">
                            <span className="text-white font-black text-xl">B</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-white">
                            BANANA <span className="text-[#3fc1c0]">CLONE</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <a 
                            href="/admin" 
                            className="hidden sm:block text-[10px] font-black tracking-widest uppercase px-6 py-3 rounded-2xl bg-white text-slate-900 hover:scale-105 active:scale-95 transition-all"
                        >
                            Dashboard
                        </a>
                    </div>
                </div>
            </header>

            {/* 2. 黑色沉浸式抬头 (Hero Section) - 保留你最满意的样式 */}
            <section className="bg-[#0f1115] pt-32 pb-20 px-6 text-center border-b border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 text-white">
                        Banana <span className="text-[#3fc1c0]">Clone</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium tracking-widest opacity-80 uppercase">
                        灵感瞬间，即刻捕捉
                    </p>
                </div>
            </section>

            {/* 3. 主内容区 (筛选器与卡片展示) */}
            <main className="bg-white dark:bg-[#0a0a0a]">
                {/* 将 initialPrompts 传递给客户端组件
                    HomeClient 内部现在自理 TAG_CATEGORIES，不再需要传入 allTags
                */}
                <HomeClient 
                    initialPrompts={initialData} 
                />
            </main>

            {/* 4. 页脚 */}
            <footer className="py-12 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0f1115]">
                <div className="container mx-auto px-6 text-center text-slate-400 dark:text-slate-600 text-xs font-bold tracking-widest">
                    © 2024 BANANA CLONE · CURATED AI PROMPT GALLERY
                </div>
            </footer>
        </div>
    );
}