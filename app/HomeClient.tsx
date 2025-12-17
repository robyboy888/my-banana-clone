'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Prompt } from '../src/types/prompt'; 

export default function HomeClient({ initialPrompts = [] }: { initialPrompts: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    if (!mounted) return <div className="min-h-screen bg-slate-50" />;

    return (
        /* 1. 微梯度感背景设计 */
        <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] selection:bg-indigo-100">
            
            {/* Header 与 搜索区域 */}
            <div className="max-w-[1600px] mx-auto px-6 pt-20 pb-16">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    
                    {/* 标题动画 */}
                    <div className="space-y-4 animate-in fade-in slide-in-from-top duration-1000">
                        <h1 className="text-6xl font-black text-slate-900 tracking-tighter italic">
                            Banana <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Clone</span>
                        </h1>
                        <p className="text-slate-500 font-semibold text-xl max-w-lg leading-relaxed border-l-4 border-indigo-500 pl-4">
                            Premium library of AI prompts for creative masters. 
                        </p>
                    </div>

                    {/* 2. 磨砂质感搜索框 */}
                    <div className="relative w-full lg:w-[550px] group">
                        <div className={`relative transition-all duration-700 ease-in-out transform ${isFocused ? 'scale-[1.03]' : 'scale-100'}`}>
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-indigo-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <input
                                type="text"
                                placeholder="Search the future..."
                                value={searchQuery}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-16 pr-12 py-6 bg-white/70 backdrop-blur-xl border-2 rounded-[32px] outline-none transition-all duration-500 ${
                                    isFocused 
                                    ? 'border-indigo-400 shadow-[0_20px_50px_rgba(79,70,229,0.15)] bg-white' 
                                    : 'border-white shadow-lg'
                                }`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. 动态悬浮卡片展示区 */}
            <div className="max-w-[1600px] mx-auto px-6 pb-32">
                {filteredPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
                        {filteredPrompts.map((prompt, index) => (
                            <div 
                                key={prompt.id} 
                                className="transition-all duration-500 hover:-translate-y-3 hover:rotate-1"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="bg-white rounded-[24px] shadow-sm hover:shadow-2xl transition-shadow duration-500 overflow-hidden border border-white">
                                    <PromptItem prompt={prompt} isAdmin={false} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center animate-pulse">
                        <div className="text-slate-300 text-8xl mb-4 font-black">?</div>
                        <h3 className="text-2xl font-bold text-slate-400">No prompts found</h3>
                        <button onClick={() => setSearchQuery('')} className="mt-6 text-indigo-600 font-black hover:underline tracking-widest uppercase text-sm">
                            &larr; Return to Library
                        </button>
                    </div>
                )}
            </div>

            <footer className="py-20 border-t border-slate-200 text-center bg-white/30 backdrop-blur-sm">
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.5em]">
                    Banana Clone &bull; Master Design Systems &bull; 2024
                </p>
            </footer>
        </div>
    );
}