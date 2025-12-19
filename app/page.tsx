import { supabase } from "../src/lib/supabase"; 
import HomeClient from "./HomeClient";
import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

// 禁用缓存，确保每次访问都抓取最新数据
export const revalidate = 0; 

export default async function Page() {
    let initialData = [];
    let allTags: string[] = [];

    try {
        const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            initialData = data;
            
            // --- 核心逻辑：从所有数据中提取不重复的标签 ---
            const tagsSet = new Set<string>();
            data.forEach(item => {
                if (item.tags) {
                    // 处理字符串格式或数组格式的标签
                    const tagsArray = Array.isArray(item.tags) 
                        ? item.tags 
                        : item.tags.split(',').map((t: string) => t.trim());
                    tagsArray.forEach((t: string) => {
                        if(t) tagsSet.add(t);
                    });
                }
            });
            allTags = Array.from(tagsSet).sort(); // 转换为排序后的数组
        }
    } catch (err) {
        console.error("数据库抓取失败:", err);
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* 1. 顶栏导航 */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#3fc1c0] rounded-xl flex items-center justify-center shadow-lg shadow-[#3fc1c0]/20">
                            <span className="text-white font-black text-xl">B</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-slate-800 dark:text-white">
                            BANANA <span className="text-[#3fc1c0]">CLONE</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <a 
                            href="/admin" 
                            className="hidden sm:block text-[10px] font-black tracking-widest uppercase px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all"
                        >
                            Dashboard
                        </a>
                    </div>
                </div>
            </header>

            {/* 2. 主内容区 */}
            <main className="py-10">
                {/* 将 initialPrompts 和 allTags 传递给客户端组件
                   客户端组件 HomeClient 将负责渲染多行搜索框和 9:16 网格 
                */}
                <HomeClient 
                    initialPrompts={initialData} 
                    allTags={allTags} 
                />
            </main>

            {/* 3. 页脚 */}
            <footer className="py-12 border-t border-slate-100 dark:border-slate-800">
                <div className="container mx-auto px-6 text-center text-slate-400 dark:text-slate-600 text-xs font-bold tracking-widest">
                    © 2024 BANANA CLONE · CURATED AI PROMPT GALLERY
                </div>
            </footer>
        </div>
    );
}