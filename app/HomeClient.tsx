'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';

// ... (接口定义和 TAG_CATEGORIES 保持不变)

export default function HomeClient({ initialPrompts = [] }: { initialPrompts: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false); 
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // ... (filteredPrompts 逻辑保持不变)

    if (!mounted) return null;

    return (
        <div className="w-full">
            {/* --- 顶部黑色横条区域：左标题，右搜索 --- */}
            <div className="bg-[#0f1115] pt-12 pb-24 px-8 border-b border-white/5">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    
                    {/* 左侧：标题与副标题 */}
                    <div className="flex-shrink-0 text-left">
                        <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white mb-2">
                            Banana <span className="text-[#3fc1c0]">Clone</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase opacity-70">
                            灵感瞬间，即刻捕捉
                        </p>
                    </div>

                    {/* 右侧：并排的搜索框和 Filter */}
                    <div className="flex flex-nowrap items-center gap-3 w-full lg:max-w-2xl mb-1">
                        <div className="flex-grow relative bg-[#1a1c20] rounded-2xl border border-white/5 shadow-2xl">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="搜索灵感..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-14 pr-6 bg-transparent border-none text-sm outline-none text-white placeholder:text-slate-600"
                            />
                        </div>
                        
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex-shrink-0 h-14 px-6 rounded-2xl flex items-center gap-2 font-bold text-xs transition-all border ${
                                isFilterOpen || selectedTags.length > 0
                                ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white' 
                                : 'bg-[#1a1c20] text-slate-300 border-white/5 hover:bg-white/5'
                            }`}
                        >
                            <SlidersHorizontal size={16} />
                            <span>FILTER</span>
                            <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 标签抽屉 (绝对定位悬浮，不挤占下方图片位置) --- */}
            <div className="relative px-8 z-50">
                {isFilterOpen && (
                    <div className="max-w-6xl mx-auto -mt-16 bg-white dark:bg-[#1a1c20] rounded-[24px] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-black/10 dark:border-white/5 animate-in fade-in slide-in-from-top-4">
                        {/* ... (标签内容 Object.entries 循环部分保持不变) */}
                    </div>
                )}
            </div>

            {/* --- 内容区：保持 5 列布局 --- */}
            <main className="max-w-[1600px] mx-auto px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {filteredPrompts.length} PROMPTS FOUND
                    </span>
                    {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold text-[#3fc1c0] flex items-center gap-1">
                            <X size={12}/> RESET
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredPrompts.map((prompt) => (
                        <PromptItem key={prompt.id} prompt={prompt} />
                    ))}
                </div>
            </main>
        </div>
    );
}