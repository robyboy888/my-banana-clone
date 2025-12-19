'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';

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

    const filteredPrompts = useMemo(() => {
        return (initialPrompts as Prompt[]).filter(prompt => {
            const matchesSearch = !searchQuery.trim() || 
                prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prompt.content?.toLowerCase().includes(searchQuery.toLowerCase());
            const promptTags = Array.isArray(prompt.tags) ? prompt.tags : (prompt.tags?.split(',').map(t => t.trim()) || []);
            const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => promptTags.includes(tag));
            return matchesSearch && matchesTags;
        });
    }, [searchQuery, selectedTags, initialPrompts]);

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-white dark:bg-[#0f1115] transition-colors duration-500">
            {/* --- 1. 核心搜索行 (严格对齐你的草图和截图) --- */}
            <div className="relative -mt-10 px-6 z-50">
                <div className="max-w-6xl mx-auto flex flex-nowrap items-center gap-3">
                    {/* 搜索框：占据最大宽度 */}
                    <div className="flex-grow relative bg-white dark:bg-[#1a1c20] rounded-[22px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-white/5">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="搜索灵感，寻找创意..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 bg-transparent border-none text-sm outline-none text-slate-800 dark:text-slate-100"
                        />
                    </div>
                    
                    {/* Filter 按钮：固定宽度防止掉行 */}
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex-shrink-0 h-14 px-6 rounded-[22px] flex items-center gap-2 font-bold text-sm transition-all border shadow-[0_15px_30px_rgba(0,0,0,0.1)] ${
                            isFilterOpen || selectedTags.length > 0
                            ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white' 
                            : 'bg-white dark:bg-[#1a1c20] text-slate-600 dark:text-slate-300 border-slate-100 dark:border-white/5'
                        }`}
                    >
                        <SlidersHorizontal size={16} />
                        <span>Filter</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* --- 2. 标签面板：采用截图 5869ac 的扁平化风格 --- */}
                {isFilterOpen && (
                    <div className="max-w-6xl mx-auto mt-4 bg-white/95 dark:bg-[#1a1c20]/95 backdrop-blur-xl rounded-[28px] p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-6">
                            {Object.entries(TAG_CATEGORIES).map(([catName, tags]) => (
                                <div key={catName} className="flex gap-6 items-start">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-500 pt-2.5 min-w-[80px]">
                                        {catName}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
                                                }}
                                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                                                    selectedTags.includes(tag)
                                                    ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-md'
                                                    : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100'
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

            {/* --- 3. 内容展示区：固定 5 列布局 --- */}
            <main className="max-w-[1400px] mx-auto px-8 py-12">
                <div className="flex items-center justify-between mb-8 opacity-40">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {filteredPrompts.length} Results
                    </span>
                    {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold text-[#3fc1c0] flex items-center gap-1">
                            <X size={12}/> CLEAR
                        </button>
                    )}
                </div>

                {/* 5列布局控制：锁定 xl 为 5 列 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredPrompts.map((prompt) => (
                        <PromptItem key={prompt.id} prompt={prompt} />
                    ))}
                </div>
                
                {filteredPrompts.length === 0 && (
                    <div className="py-40 text-center text-slate-300 dark:text-slate-700 italic text-xs tracking-[0.3em] uppercase">
                        No archive matches
                    </div>
                )}
            </main>
        </div>
    );
}