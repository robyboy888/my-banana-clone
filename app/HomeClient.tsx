'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';

// 定义 Prompt 接口，确保 TypeScript 不报错
interface Prompt {
    id: number;
    title: string;
    content: string;
    tags?: string[] | string;
    original_image_url: string;
    optimized_image_url?: string;
}

const TAG_CATEGORIES = {
  "GENRE": ["Character", "Portrait", "Landscape", "Architecture", "Sci-Fi", "Cyberpunk", "Fantasy", "Animals", "Food", "Nature", "Still Life", "Fashion", "Abstract", "Cityscape"],
  "ARTISTIC": ["Realistic", "Anime", "3D Render", "Oil Painting", "Watercolor", "Sketch", "Vector", "Pixel Art", "Digital Art", "Comic", "Cartoon", "Gothic", "Steampunk", "Pop Art"],
  "MOOD": ["Cinematic", "Ethereal", "Dark", "Vibrant", "Minimalist", "Epic", "Mysterious"]
};

export default function HomeClient({ initialPrompts = [] }: { initialPrompts: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false); 
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const filteredPrompts = useMemo(() => {
        return (initialPrompts as Prompt[]).filter(prompt => {
            const matchesSearch = !searchQuery.trim() || 
                prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prompt.content?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const promptTags = Array.isArray(prompt.tags) 
                ? prompt.tags 
                : (typeof prompt.tags === 'string' ? prompt.tags.split(',').map(t => t.trim()) : []);
                
            const matchesTags = selectedTags.length === 0 || 
                selectedTags.every(tag => promptTags.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [searchQuery, selectedTags, initialPrompts]);

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-white dark:bg-[#0f1115] transition-colors duration-300">
            {/* --- 1. 核心交互层：搜索框与 Filter 按钮并排 (高度压缩版) --- */}
            <div className="relative -mt-10 px-6 z-40">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    {/* 搜索框：强力阴影，明暗模式适配背景 */}
                    <div className="flex-1 relative group bg-white dark:bg-[#1a1c20] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/5 overflow-hidden">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3fc1c0] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="搜索灵感，寻找创意..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-16 pr-6 bg-transparent border-none text-base outline-none text-slate-800 dark:text-slate-100"
                        />
                    </div>
                    
                    {/* Filter 按钮：风格参考你上传的样式 */}
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`h-16 px-8 rounded-[24px] flex items-center gap-3 font-bold text-sm transition-all border shadow-[0_15px_40px_rgba(0,0,0,0.1)] ${
                            isFilterOpen || selectedTags.length > 0
                            ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-[#3fc1c0]/20' 
                            : 'bg-white dark:bg-[#1a1c20] text-slate-600 dark:text-slate-300 border-slate-100 dark:border-white/5'
                        }`}
                    >
                        <SlidersHorizontal size={18} />
                        <span>Filter</span>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* --- 2. 伸缩标签面板：高度优化 --- */}
                {isFilterOpen && (
                    <div className="max-w-6xl mx-auto mt-4 bg-white dark:bg-[#1a1c20] rounded-[32px] p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-6">
                            {Object.entries(TAG_CATEGORIES).map(([catName, tags]) => (
                                <div key={catName} className="flex gap-6 items-start">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 pt-2.5 min-w-[80px]">
                                        {catName}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                                                    selectedTags.includes(tag)
                                                    ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white'
                                                    : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- 3. 作品展示区：5列布局，背景明暗适配 --- */}
            <main className="max-w-7xl mx-auto px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[#3fc1c0] rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Result: <span className="text-slate-900 dark:text-slate-200">{filteredPrompts.length}</span>
                        </span>
                    </div>
                    {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold text-[#3fc1c0] flex items-center gap-1 hover:underline">
                            <X size={12}/> CLEAR FILTERS
                        </button>
                    )}
                </div>

                {/* 核心修改：调整为 grid-cols-5 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredPrompts.map((prompt) => (
                        <PromptItem key={prompt.id} prompt={prompt} />
                    ))}
                </div>
                
                {filteredPrompts.length === 0 && (
                    <div className="py-40 text-center text-slate-400 dark:text-slate-600 italic tracking-widest uppercase text-xs">
                        No matches found.
                    </div>
                )}
            </main>
        </div>
    );
}