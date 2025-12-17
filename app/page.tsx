'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '@/components/PromptItem';
import { Prompt } from '@/types/prompt';

export default function HomePage({ initialPrompts = [] }: { initialPrompts?: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. 终极保险：确保无论发生什么，filteredPrompts 永远是一个数组
    const filteredPrompts = useMemo(() => {
        // 第一道防线：如果 initialPrompts 为空、undefined 或不是数组，直接给空数组
        const safeData = Array.isArray(initialPrompts) ? initialPrompts : [];
        
        if (!searchQuery.trim()) return safeData;
        
        const query = searchQuery.toLowerCase();
        return safeData.filter(prompt => {
            // 第二道防线：确保 prompt 对象本身及其属性存在
            const title = (prompt?.title || '').toLowerCase();
            const content = (prompt?.content || '').toLowerCase();
            const author = (prompt?.source_x_account || '').toLowerCase();
            return title.includes(query) || content.includes(query) || author.includes(query);
        });
    }, [searchQuery, initialPrompts]);

    // 在组件完全挂载前渲染一个占位符，避免服务端/客户端不一致
    if (!mounted) return <div className="min-h-screen bg-[#F8FAFC]" />;

    return (
        <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 selection:text-indigo-900">
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

                    <div className="relative w-full lg:w-[500px] group">
                        {/* 计数标签：增加安全访问 */}
                        <div className={`absolute -top-7 right-2 transition-all duration-300 ${searchQuery ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                Found {filteredPrompts?.length || 0} prompts
                            </span>
                        </div>

                        <div className={`relative transition-all duration-500 transform ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <svg className={`w-5 h-5 transition-colors ${isFocused ? 'text-indigo-500' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className={`w-full pl-14 pr-12 py-5 bg-white/80 backdrop-blur-xl border-2 transition-all rounded-[24px] outline-none ${isFocused ? 'border-indigo-500 shadow-xl' : 'border-slate-100'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 pb-32">
                {/* 列表渲染：增加安全判断 */}
                {filteredPrompts && filteredPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {filteredPrompts.map((prompt) => (
                            <div key={prompt.id}>
                                <PromptItem prompt={prompt} isAdmin={false} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center animate-in fade-in slide-in-from-bottom">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No prompts found</h3>
                        <p className="text-slate-500 mt-2">Try checking your database connection or search criteria.</p>
                        <button onClick={() => setSearchQuery('')} className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl">Clear Search</button>
                    </div>
                )}
            </div>
        </div>
    );
}