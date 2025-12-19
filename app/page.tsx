import { supabase } from "../src/lib/supabase"; 
import HomeClient from "./HomeClient";
import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const revalidate = 0; 

export default async function Page() {
    let initialData = [];
    try {
        const { data, error } = await supabase.from('prompts').select('*').order('created_at', { ascending: false });
        if (!error && data) initialData = data;
    } catch (err) { console.error("数据抓取失败:", err); }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f1115]">
            {/* 顶部导航 */}
            <header className="sticky top-0 z-[60] w-full border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md">
                <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3fc1c0] rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-sm">B</span>
                        </div>
                        <h1 className="text-sm font-black tracking-tighter text-white uppercase">Banana Clone</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <a href="/admin" className="text-[10px] font-black px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white hover:text-black transition-all">ADMIN</a>
                    </div>
                </div>
            </header>

            {/* 核心改动：把标题和搜索框合并到 HomeClient 中处理，或者在这里给出一个并排容器 */}
            <main className="bg-white dark:bg-[#0f1115]">
                <HomeClient initialPrompts={initialData} />
            </main>

            <footer className="py-20 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0f1115] text-center">
                <p className="text-slate-400 dark:text-slate-600 text-[10px] font-black tracking-[0.3em] uppercase">© 2025 BANANA CLONE</p>
            </footer>
        </div>
    );
}