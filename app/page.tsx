// 1. 服务端部分：负责从 Supabase 抓取数据
import { getPrompts } from "../src/lib/supabaseService"; 
import React from 'react';

export default async function Page() {
    let initialData = [];
    try {
        // 调用你 src/lib/supabaseService.ts 里的获取数据函数
        const data = await getPrompts();
        initialData = data || [];
    } catch (error) {
        console.error("Supabase 数据读取失败:", error);
    }

    // 将数据传给下面的客户端组件
    return <HomePage initialPrompts={initialData} />;
}

// -------------------------------------------------------------------------
// 2. 客户端部分：处理搜索交互
// -------------------------------------------------------------------------
'use client';

import { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; // 适配你的 src/components 路径
import { Prompt } from '../src/types/prompt'; // 适配你的 src/types 路径

function HomePage({ initialPrompts = [] }: { initialPrompts: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 搜索过滤逻辑
    const filteredPrompts = useMemo(() => {
        const data = Array.isArray(initialPrompts) ? initialPrompts : [];
        if (!searchQuery.trim()) return data;
        
        const query = searchQuery.toLowerCase();
        return data.filter(prompt => {
            const titleMatch = (prompt?.title ?? '').toLowerCase().includes(query);
            const contentMatch = (prompt?.content ?? '').toLowerCase().includes(query);
            const authorMatch = (prompt?.source_x_account ?? '').toLowerCase().includes(query);
            return titleMatch || contentMatch || authorMatch;
        });
    }, [searchQuery, initialPrompts]);

    if (!mounted) return <div className="min-h-screen bg-[#F8FAFC]" />;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header 与 搜索框 */}
            <div className="max-w-[1600px] mx-auto px-6 pt-16 pb-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-slate-900 italic tracking-tight">
                            Banana <span className="text-indigo-600">Clone</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg">
                            Premium library of AI prompts for creative masters. 
                        </p>
                    </div>

                    <div className="relative w-full lg:w-[500px]">
                        <div className={`absolute -top-7 right-2 transition-all ${searchQuery ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                Found {filteredPrompts.length} prompts
                            </span>
                        </div>

                        <div className={`relative transition-all duration-500 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <input
                                type="text"
                                placeholder="Search prompts..."
                                value={searchQuery}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-14 pr-12 py-5 bg-white border-2 rounded-[24px] outline-none transition-all ${
                                    isFocused ? 'border-indigo-500 shadow-xl' : 'border-slate-100'
                                }`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 卡片展示区 */}
            <div className="max-w-[1600px] mx-auto px-6 pb-32">
                {filteredPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {filteredPrompts.map((prompt) => (
                            <div key={prompt.id}>
                                <PromptItem prompt={prompt} isAdmin={false} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center">
                        <h3 className="text-xl font-bold text-slate-400">No prompts found</h3>
                        <button onClick={() => setSearchQuery('')} className="mt-4 text-indigo-600 font-bold underline">
                            Reset Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}