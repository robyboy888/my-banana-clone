'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '@/components/PromptItem';
import { Prompt } from '@/types/prompt';

export default function HomePage({ initialPrompts = [] }: { initialPrompts?: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 1. 调试日志：如果页面空白，按 F12 看控制台输出什么
    useEffect(() => {
        setMounted(true);
        console.log("Initial Prompts Received:", initialPrompts);
    }, [initialPrompts]);

    // 2. 核心搜索逻辑：极其严格的防御性编程
    const filteredPrompts = useMemo(() => {
        // 确保 data 始终是一个数组
        const data = Array.isArray(initialPrompts) ? initialPrompts : [];
        
        if (!searchQuery.trim()) return data;
        
        const query = searchQuery.toLowerCase();
        return data.filter(prompt => {
            // 使用可选链和空值合并，确保哪怕数据库字段缺失也不崩溃
            const titleMatch = (prompt?.title ?? '').toLowerCase().includes(query);
            const contentMatch = (prompt?.content ?? '').toLowerCase().includes(query);
            const authorMatch = (prompt?.source_x_account ?? '').toLowerCase().includes(query);
            
            return titleMatch || contentMatch || authorMatch;
        });
    }, [searchQuery, initialPrompts]);

    // 防止 Hydration 错误，在挂载前不渲染重逻辑
    if (!mounted) return <div className="min-h-screen bg-[#F8FAFC]" />;

    return (
        <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 selection:text-indigo-900">
            
            {/* Header / Hero Section */}
            <div className="max-w-[1600px] mx-auto px-6 pt-16 pb-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-2 animate-in fade-in slide-in-from-left duration-700">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">
                            Banana <span className="text-indigo-600">Clone</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-md leading-relaxed">
                            Premium library of AI prompts for creative masters. 
                        </p>
                    </div>

                    {/* 搜索栏交互设计 */}
                    <div className="relative w-full lg:w-[500px] group">
                        {/* 动态计数标签 */}
                        <div className={`absolute -top-7 right-2 transition-all duration-300 ${searchQuery ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                Found {filteredPrompts.length} prompts
                            </span>
                        </div>

                        {/* 搜索框 */}
                        <div className={`relative transition-all duration-500 ease-out transform ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <svg 
                                    className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : 'text-slate-300'}`} 
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
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
                                className={`
                                    w-full pl-14 pr-12 py-5 
                                    bg-white/80 backdrop-blur-xl
                                    border-2 transition-all duration-300
                                    rounded-[24px] outline-none text-slate-700 font-medium
                                    ${isFocused 
                                        ? 'border-indigo-500 shadow-[0_20px_40px_rgba(79,70,229,0.12)] bg-white' 
                                        : 'border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.02)]'
                                    }
                                `}
                            />

                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-4 flex items-center"
                                >
                                    <div className="p-1 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 卡片展示区域 */}
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
                    /* 优雅的空状态 */
                    <div className="py-40 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom duration-700">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No matching prompts</h3>
                        <p className="text-slate-500 mt-2 max-w-xs">We couldn't find any results for your search. Try different keywords.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all active:scale-95"
                        >
                            Clear search
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