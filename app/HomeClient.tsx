'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Search, X, Filter, Grid, List, Hash } from 'lucide-react';

interface Prompt {
    id: number;
    title: string;
    content: string;
    tags?: string[] | string;
    original_image_url: string;
    optimized_image_url?: string;
    optimized_prompt?: string;
}

export default function HomeClient({ initialPrompts = [], allTags = [] }: { initialPrompts: Prompt[], allTags: string[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mounted, setMounted] = useState(false);

    // 1. 初始化视图模式（保留原代码逻辑）
    useEffect(() => {
        const savedView = localStorage.getItem('banana-view-mode') as 'grid' | 'list';
        if (savedView) setViewMode(savedView);
        setMounted(true);
    }, []);

    const saveViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('banana-view-mode', mode);
    };

    // 2. 核心组合过滤逻辑（升级为多选组合）
    const filteredPrompts = useMemo(() => {
        return initialPrompts.filter(prompt => {
            // 文本搜索
            const matchesSearch = !searchQuery.trim() || 
                prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prompt.content?.toLowerCase().includes(searchQuery.toLowerCase());
            
            // 标签组合过滤逻辑：必须包含所有选中的标签
            const promptTags = Array.isArray(prompt.tags) 
                ? prompt.tags 
                : typeof prompt.tags === 'string' 
                    ? prompt.tags.split(',').map(t => t.trim())
                    : [];
            
            const matchesTags = selectedTags.length === 0 || 
                selectedTags.every(tag => promptTags.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [searchQuery, selectedTags, initialPrompts]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // 防止 Hydration 闪烁
    if (!mounted) return <div className="min-h-screen bg-white dark:bg-slate-950" />;

    return (
        <div className="space-y-12">
            {/* --- 顶部控制区：搜索 + 多行标签 --- */}
            <div className="max-w-5xl mx-auto px-6 space-y-8">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    {/* 搜索框 */}
                    <div className="relative flex-1 group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3fc1c0] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="搜索灵感..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-12 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#3fc1c0]/20 text-slate-700 dark:text-slate-200 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 dark:bg-slate-800 rounded-full">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* 视图切换 (保留原代码功能) */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
                        <button onClick={() => saveViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-[#3fc1c0] shadow-sm' : 'text-slate-400'}`}>
                            <Grid size={20} />
                        </button>
                        <button onClick={() => saveViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-[#3fc1c0] shadow-sm' : 'text-slate-400'}`}>
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {/* 多行标签池：解决单行过长问题 */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <Filter size={12} />
                            组合筛选
                        </div>
                        {selectedTags.length > 0 && (
                            <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold text-[#3fc1c0] hover:underline">
                                重置筛选 ({selectedTags.length})
                            </button>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    selectedTags.includes(tag)
                                    ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-lg shadow-[#3fc1c0]/20 scale-105'
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-[#3fc1c0]'
                                }`}
                            >
                                <span className="opacity-40 mr-1 italic">#</span>{tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- 内容网格：9:16 比例 --- */}
            <div className="container mx-auto px-6 pb-24">
                {filteredPrompts.length > 0 ? (
                    <div className={
                        viewMode === 'grid' 
                        ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6" 
                        : "flex flex-col gap-4 max-w-4xl mx-auto"
                    }>
                        {filteredPrompts.map((prompt) => (
                            <PromptItem key={prompt.id} prompt={prompt} isAdmin={false} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50">
                        <Hash size={48} className="text-slate-300 mb-4" />
                        <p className="font-bold text-slate-400">未找到符合条件的提示词</p>
                    </div>
                )}
            </div>
        </div>
    );
}