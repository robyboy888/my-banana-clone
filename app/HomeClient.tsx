'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Prompt } from '../src/types/prompt'; 

export default function HomeClient({ initialPrompts = [] }: { initialPrompts: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedView = localStorage.getItem('banana-view-mode') as 'grid' | 'list';
        if (savedView) setViewMode(savedView);
        setMounted(true);
    }, []);

    const toggleView = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('banana-view-mode', mode);
    };

    const filteredPrompts = useMemo(() => {
        const data = Array.isArray(initialPrompts) ? initialPrompts : [];
        if (!searchQuery.trim()) return data;
        const query = searchQuery.toLowerCase();
        return data.filter(prompt => (
            (prompt?.title ?? '').toLowerCase().includes(query) || 
            (prompt?.content ?? '').toLowerCase().includes(query)
        ));
    }, [searchQuery, initialPrompts]);

    if (!mounted) return <div className="min-h-screen bg-[#1a2327]" />;

    return (
        /* 背景参考 Admin：深墨绿色渐变 */
        <div className="min-h-screen bg-[#11191d] text-slate-200">
            
            <div className="max-w-[1600px] mx-auto px-8 pt-12 pb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    {/* 标题：Admin 同款青色 */}
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black italic tracking-tight">
                            Banana <span className="text-[#3fc1c0]">Clone</span>
                        </h1>
                        <p className="text-slate-400 font-medium tracking-wide">为创作大大定制的 AI 提词词库</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* 搜索框：深灰色调 */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-[300px] lg:w-[400px] pl-10 pr-4 py-3 bg-[#2a353a] border-none rounded-lg focus:ring-2 focus:ring-[#3fc1c0] outline-none text-slate-200"
                            />
                            <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* 视图切换：参考 Admin 样式 */}
                        <div className="flex bg-[#0a1013] p-1 rounded-lg">
                            <button onClick={() => toggleView('list')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-[#2a353a] text-white' : 'text-slate-500'}`}>LIST</button>
                            <button onClick={() => toggleView('grid')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-[#3fc1c0] text-white shadow-lg shadow-[#3fc1c0]/20' : 'text-slate-500'}`}>GRID</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 内容区：卡片保持白色，背景换成浅灰色的容器感 */}
            <div className="max-w-[1600px] mx-auto px-8 pb-32">
                <div className="bg-[#f2f4f6] rounded-[40px] p-10 min-h-[600px]">
                    {filteredPrompts.length > 0 ? (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8" : "flex flex-col gap-4"}>
                            {filteredPrompts.map((prompt) => (
                                <PromptItem key={prompt.id} prompt={prompt} isAdmin={false} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center text-slate-400 font-bold">暂无匹配内容</div>
                    )}
                </div>
            </div>
        </div>
    );
}