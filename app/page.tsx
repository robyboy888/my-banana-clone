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
        /* 这里的 bg-white dark:bg-[#0f1115] 必须与 HomeClient 保持一致，确保滚动时没有断层 */
        <div className="min-h-screen bg-white dark:bg-[#0f1115] transition-colors duration-500">
            
            {/* 1. 顶部导航栏 (采用沉浸式深色) */}
            <header className="sticky top-0 z-[60] w-full border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md">
                <div className="max-w-[1800px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#3fc1c0] rounded-xl flex items-center justify-center shadow-lg shadow-[#3fc1c0]/20">
                            <span className="text-white font-black text-lg">B</span>
                        </div>
                        <h1 className="text-lg font-black tracking-tighter text-white">
                            BANANA <span className="text-[#3fc1c0]">CLONE</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <a 
                            href="/admin" 
                            className="hidden sm:block text-[10px] font-black tracking-[0.2em] uppercase px-5 py-2.5 rounded-xl bg-white text-[#0f1115] hover:bg-[#3fc1c0] hover:text-white transition-all"
                        >
                            Dashboard
                        </a>
                    </div>
                </div>
            </header>

            {/* 2. 黑色沉浸式抬头 (Hero Section) 
                高度微调：为了让 HomeClient 的搜索框向上偏移后位置居中
            */}
            <section className="bg-[#0f1115] pt-24 pb-28 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-4 text-white">
                        Banana <span className="text-[#3fc1c0]">Clone</span>
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base font-bold tracking-[0.4em] uppercase opacity-70">
                        灵感瞬间，即刻捕捉
                    </p>
                </div>
            </section>

            {/* 3. 主内容区
                背景色适配暗色模式，去掉多余的 dark:bg-[#0a0a0a] 统一使用 [#0f1115]
            */}
            <main className="bg-white dark:bg-[#0f1115] relative">
                {/* HomeClient 内部带有 -mt-10 或 -mt-12 的负边距，
                    它会自动向上漂浮并压在上面的黑色 section 上。
                */}
                <HomeClient 
                    initialPrompts={initialData} 
                />
            </main>

            {/* 4. 页脚 */}
            <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0f1115]">
                <div className="container mx-auto px-6 text-center text-slate-400 dark:text-slate-600 text-[10px] font-black tracking-[0.3em] uppercase">
                    © 2025 BANANA CLONE · CURATED AI PROMPT GALLERY
                </div>
            </footer>
        </div>
    );
}