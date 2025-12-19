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
        <div className="w-full min-h-screen bg-slate-50 dark:bg-[#0f1115] transition-colors duration-500">
            {/* --- 1. 核心交互行：强制同一排 --- */}
            <div className="relative -mt-10 px-6 z-50">
                <div className="max-w-6xl mx-auto flex items-stretch gap-3 h-16">
                    {/* 搜索框：占据最大空间 */}
                    <div className="flex-[4] relative flex items-center bg-white dark:bg-[#1a1c20] rounded-[20px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden">
                        <Search className="absolute left-6 text-slate-400 group-focus-within:text-[#3fc1c0]" size={20} />
                        <input
                            type="text"
                            placeholder="搜索灵感，寻找创意..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full pl-16 pr-6 bg-transparent border-none text-base outline-none text-slate-800 dark:text-slate-100"
                        />
                    </div>
                    
                    {/* Filter 按钮：固定宽度，确保不掉行 */}
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex-[1] min-w-[140px] rounded-[20px] flex items-center justify-center gap-3 font-bold text-sm transition-all border shadow-[0_20px_40px_rgba(0,0,0,0.15)] ${
                            isFilterOpen || selectedTags.length > 0
                            ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white' 
                            : 'bg-white dark:bg-[#1a1c20] text-slate-600 dark:text-slate-300 border-white/10'
                        }`}
                    >
                        <SlidersHorizontal size={18} />
                        <span>Filter</span>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* --- 2. 标签抽屉 (展开时不影响下方图片的纵向起始点) --- */}
                {isFilterOpen && (
                    <div className="max-w-6xl mx-auto mt-4 bg-white/95 dark:bg-[#1a1c20]/95 backdrop-blur-xl rounded-[28px] p-8 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-6">
                            {Object.entries(TAG_CATEGORIES).map(([catName, tags]) => (
                                <div key={catName} className="flex gap-6 items-start">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pt-2.5 min-w-[70px] text-right">
                                        {catName}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
                                                }}
                                                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${
                                                    selectedTags.includes(tag)
                                                    ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-md'
                                                    : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:border-[#3fc1c0]'
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

            {/* --- 3. 作品展示区 (背景跟随明暗变化) --- */}
            <main className="max-w-7xl mx-auto px-8 py-12">
                <div className="flex items-center justify-between mb-8 opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {filteredPrompts.length} Prompts Total
                    </span>
                    {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold text-[#3fc1c0] flex items-center gap-1">
                            <X size={12}/> RESET
                        </button>
                    )}
                </div>

                {/* 5列网格：确保卡片足够大，减少文字干扰 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredPrompts.map((prompt) => (
                        <PromptItem key={prompt.id} prompt={prompt} />
                    ))}
                </div>
            </div>
        </div>
    );
}