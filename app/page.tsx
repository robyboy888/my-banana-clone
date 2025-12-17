// 1. 【服务端逻辑】直接在这里连接 Supabase，确保数据能被抓取到
import { supabase } from "../src/lib/supabase"; 
import React from 'react';

export default async function Page() {
    let initialData = [];
    try {
        // 直接从你的 supabase.ts 实例读取数据
        // 注意：这里假设你的表名叫 'prompts'，这是你项目的核心数据表
        const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            initialData = data;
        } else {
            console.error("Supabase Error:", error?.message);
        }
    } catch (err) {
        console.error("Fetch failed:", err);
    }

    // 将抓取到的数据传给下面的客户端组件
    return <HomePageClient initialPrompts={initialData} />;
}

// -------------------------------------------------------------------------
// 2. 【客户端逻辑】负责搜索框的各种酷炫交互
// -------------------------------------------------------------------------
'use client';

import { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Prompt } from '../src/types/prompt'; 

function HomePageClient({ initialPrompts = [] }: { initialPrompts: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 解决 Next.js 客户端/服务端不一致的 Hydration 错误
    useEffect(() => {
        setMounted(true);
    }, []);

    // 搜索过滤逻辑：如果没有输入，则显示全部 initialPrompts
    const filteredPrompts = useMemo(() => {
        const data = Array.isArray(initialPrompts) ? initialPrompts : [];
        if (!searchQuery.trim()) return data;
        
        const query = searchQuery.toLowerCase();
        return data.filter(prompt => {
            const title = (prompt?.title ?? '').toLowerCase();
            const content = (prompt?.content ?? '').toLowerCase();
            const author = (prompt?.source_x_account ?? '').toLowerCase();
            return title.includes(query) || content.includes(query) || author.includes(query);
        });
    }, [searchQuery, initialPrompts]);

    if (!mounted) return <div className="min-h-screen bg-[#F8FAFC]" />;

    return (
        <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header & 搜索区域 */}
            <div className="max-w-[1600px] mx-auto px-6 pt-16 pb-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">
                            Banana <span className="text-indigo-600">Clone</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-md">
                            Premium library of AI prompts for creative masters. 
                        </p>
                    </div>

                    {/* 搜索框组件 */}
                    <div className="relative w-full lg:w-[500px] group">
                        <div className={`absolute -top-7 right-2 transition-all duration-300 ${searchQuery ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                Found {filteredPrompts.length} prompts
                            </span>
                        </div>

                        <div className={`relative transition-all duration-500 transform ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <input
                                type="text"
                                placeholder="Search by title, content or author..."
                                value={searchQuery}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-14 pr-12 py-5 bg-white border-2 rounded-[24px] outline-none transition-all duration-300 ${
                                    isFocused ? 'border-indigo-500 shadow-xl' : 'border-slate-100 shadow-sm'
                                }`}
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 列表渲染 */}
            <div className="max-w-[1600px] mx-auto px-6 pb-32">
                {filteredPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {filteredPrompts.map((prompt) => (
                            <div key={prompt.id} className="animate-in fade-in zoom-in duration-500">
                                <PromptItem prompt={prompt} isAdmin={false} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center animate-in fade-in">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No prompts found</h3>
                        <p className="text-slate-500 mt-2">Check your connection or try different keywords.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all"
                        >
                            Reset Search
                        </button>
                    </div>
                )}
            </div>

            <footer className="py-12 border-t border-slate-100 text-center">
                <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
                    Banana Clone &bull; Master Design Systems
                </p>
            </footer>
        </div>
    );
}