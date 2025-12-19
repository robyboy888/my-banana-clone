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
            
            const promptTags = Array.isArray(prompt.tags) 
                ? prompt.tags 
                : (prompt.tags?.split(',').map(t => t.trim()) || []);
                
            const matchesTags = selectedTags.length === 0 || 
                selectedTags.every(tag => promptTags.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [searchQuery, selectedTags, initialPrompts]);

    if (!mounted) return null;

    return (
        <div className="w-full min-h-screen bg-white dark:bg-[#0f1115] transition-colors duration-500">
            {/* 1. 顶部 Hero 区域：左标题，右搜索 */}
            <div className="bg-[#0f1115] pt-12 pb-20 px-8 border-b border-white/5">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    
                    {/* 左侧：标题组 */}
                    <div className="flex-shrink-0 text-left">
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-2">
                            Banana <span className="text-[#3fc1c0]">Clone</span>
                        </h1>
                        <p className="text-slate-500 text-xs md:text-sm font-bold tracking-[0.4em] uppercase opacity-80">
                            灵感瞬间，即刻捕捉
                        </p>
                    </div>

                    {/* 右侧：搜索与 Filter 并行 */}
                    <div className="flex flex-nowrap items-center gap-3 w-full lg:max-w-2xl mb-1">
                        <div className="flex-grow relative bg-white/5 dark:bg-[#1a1c20] rounded-[22px] border border-white/10 shadow-2xl transition-all focus-within:border-[#3fc1c0]/50">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="搜索灵感..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-16 pl-16 pr-6 bg-transparent border-none text-base outline-none text-white placeholder:text-slate-600"
                            />
                        </div>
                        
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex-shrink-0 h-16 px-8 rounded-[22px] flex items-center gap-3 font-bold text-sm transition-all border ${
                                isFilterOpen || selectedTags.length > 0
                                ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-lg shadow-[#3fc1c0]/20' 
                                : 'bg-white/5 dark:bg-[#1a1c20] text-slate-300 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            <SlidersHorizontal size={18} />
                            <span className="hidden sm:inline">Filter</span>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. 标签抽屉层 (漂浮效果) */}
            <div className="relative px-8 z-50">
                {isFilterOpen && (
                    <div className="max-w-6xl mx-auto -mt-10 bg-white/95 dark:bg-[#1a1c20]/95 backdrop-blur-xl rounded-[28px] p-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-4 transition-all">
                        <div className="space-y-6">
                            {Object.entries(TAG_CATEGORIES).map(([catName, tags]) => (
                                <div key={catName} className="flex gap-6 items-start">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 pt-2.5 min-w-[80px]">
                                        {catName}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                                                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                                                    selectedTags.includes(tag)
                                                    ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white'
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

            {/* 3. 作品展示区：锁定 5 列网格布局 */}
            <main className="max-w-[1600px] mx-auto px-8 py-16">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[#3fc1c0] rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                            Total <span className="text-slate-900 dark:text-slate-200">{filteredPrompts.length}</span> Prompts
                        </span>
                    </div>
                    {selectedTags.length > 0 && (
                        <button 
                            onClick={() => setSelectedTags([])} 
                            className="text-[10px] font-bold text-[#3fc1c0] flex items-center gap-1 hover:underline"
                        >
                            <X size={12}/> CLEAR ALL
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {filteredPrompts.map((prompt) => (
                        <PromptItem key={prompt.id} prompt={prompt} />
                    ))}
                </div>
                
                {/* 搜索无结果 */}
                {filteredPrompts.length === 0 && (
                    <div className="py-40 text-center">
                        <p className="text-slate-300 dark:text-slate-700 italic text-xs tracking-[0.3em] uppercase">
                            No archive matches found.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}