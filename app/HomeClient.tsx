'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Prompt } from '../src/types/prompt'; 

// 在 HomeClient.tsx 顶部找到或添加这个接口定义
interface Prompt {
    id: number;
    title: string;
    content: string;
    original_image_url: string; 
    optimized_prompt?: string;
    optimized_image_url?: string;
    user_portrait_url?: string;
    source_x_account?: string;
// 修改这里：允许 tags 为 any 类型，因为 jsonb 在 TS 中比较特殊
    tags?: any;
}

export default function HomeClient({ initialPrompts = [] }: { initialPrompts: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('全部');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedView = localStorage.getItem('banana-view-mode') as 'grid' | 'list';
        if (savedView) setViewMode(savedView);
        setMounted(true);
    }, []);

    // 1. 自动从数据中提取所有唯一标签
    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        initialPrompts.forEach(prompt => {
            if (Array.isArray(prompt.tags)) {
                prompt.tags.forEach(tag => tagsSet.add(tag));
            }
        });
        return ['全部', ...Array.from(tagsSet)];
    }, [initialPrompts]);

    // 2. 组合过滤逻辑：搜索框 + 标签点击
    const filteredPrompts = useMemo(() => {
        return initialPrompts.filter(prompt => {
            const matchesSearch = !searchQuery.trim() || 
                prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prompt.content?.toLowerCase().includes(searchQuery.toLowerCase());
            
            // 标签过滤：处理可能存在的数组或字符串格式
            const promptTags = Array.isArray(prompt.tags) ? prompt.tags : [];
            const matchesTag = selectedTag === '全部' || promptTags.includes(selectedTag);

            return matchesSearch && matchesTag;
        });
    }, [searchQuery, selectedTag, initialPrompts]);

    if (!mounted) return <div className="min-h-screen bg-[#0B1215]" />;

    return (
        <div className="min-h-screen bg-[#0B1215] text-slate-200">
            {/* 顶部导航与搜索区 */}
            <div className="max-w-[1600px] mx-auto px-8 pt-12 pb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black italic tracking-tight">
                            Banana <span className="text-[#3fc1c0]">Clone</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">灵感瞬间，即刻捕捉</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="搜索标题或内容..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-[300px] lg:w-[400px] pl-10 pr-4 py-3 bg-[#1C2529] border border-slate-800 rounded-xl focus:ring-2 focus:ring-[#3fc1c0]/50 outline-none transition-all"
                            />
                            <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-600 group-focus-within:text-[#3fc1c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        
                        <div className="flex bg-[#05090B] p-1 rounded-xl border border-slate-800">
                            <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-[#3fc1c0] text-white shadow-lg shadow-[#3fc1c0]/20' : 'text-slate-500'}`}>GRID</button>
                            <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-[#3fc1c0] text-white' : 'text-slate-500'}`}>LIST</button>
                        </div>
                    </div>
                </div>

                {/* 3. 分类标签滚动条 */}
                <div className="flex items-center gap-2 mt-10 overflow-x-auto pb-2 scrollbar-hide">
                    <span className="text-slate-600 text-[10px] font-black uppercase mr-2 shrink-0">分类筛选:</span>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                                selectedTag === tag 
                                ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-md' 
                                : 'bg-[#1C2529] border-slate-800 text-slate-400 hover:border-[#3fc1c0]/50 hover:text-slate-200'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* 内容容器：浅灰色大圆角卡片托底 */}
            <div className="max-w-[1600px] mx-auto px-8 pb-32">
                <div className="bg-[#f2f4f6] rounded-[48px] p-10 min-h-[600px] shadow-inner">
                    {filteredPrompts.length > 0 ? (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8" : "flex flex-col gap-4 max-w-5xl mx-auto"}>
                            {filteredPrompts.map((prompt) => (
                                <PromptItem key={prompt.id} prompt={prompt} isAdmin={false} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="text-slate-300 text-6xl mb-4">🔍</div>
                            <div className="text-slate-400 font-bold">没有找到匹配的提示词</div>
                            <button onClick={() => {setSearchQuery(''); setSelectedTag('全部')}} className="mt-4 text-[#3fc1c0] text-sm underline">重置所有筛选</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}