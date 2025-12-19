'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Search, ChevronDown, SlidersHorizontal, Hash, X } from 'lucide-react';

const TAG_CATEGORIES = {
  "Genre": ["Character", "Portrait", "Landscape", "Architecture", "Sci-Fi", "Cyberpunk", "Fantasy", "Animals", "Food", "Nature", "Still Life", "Fashion", "Abstract", "Cityscape"],
  "Styles": ["Realistic", "Anime", "3D Render", "Oil Painting", "Watercolor", "Sketch", "Vector", "Pixel Art", "Digital Art", "Comic", "Cartoon", "Gothic", "Steampunk", "Pop Art"],
  "Mood": ["Cinematic", "Ethereal", "Dark", "Vibrant", "Minimalist", "Epic", "Mysterious"]
};

export default function HomeClient({ initialPrompts = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // 控制标签栏收缩
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const filteredPrompts = useMemo(() => {
        return initialPrompts.filter(prompt => {
            const matchesSearch = !searchQuery.trim() || prompt.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const promptTags = Array.isArray(prompt.tags) ? prompt.tags : (prompt.tags?.split(',') || []);
            const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => promptTags.includes(tag));
            return matchesSearch && matchesTags;
        });
    }, [searchQuery, selectedTags, initialPrompts]);

    if (!mounted) return null;

    return (
        <div className="w-full">
            {/* --- 1. 核心交互层：搜索框与筛选按钮同行 (按照你的草图) --- */}
            <div className="relative -mt-10 px-6 z-40">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    {/* 搜索框：占据 80% 宽度 */}
                    <div className="flex-1 relative group bg-white dark:bg-[#1a1c20] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3fc1c0]" size={20} />
                        <input
                            type="text"
                            placeholder="搜索灵感..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-16 pr-6 bg-transparent border-none text-base outline-none text-slate-800 dark:text-white"
                        />
                    </div>
                    
                    {/* 筛选按钮：收纳所有标签 */}
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`h-16 px-8 rounded-[24px] flex items-center gap-3 font-bold text-sm transition-all border ${
                            isFilterOpen || selectedTags.length > 0
                            ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-lg' 
                            : 'bg-white dark:bg-[#1a1c20] text-slate-600 dark:text-slate-300 border-white/10 shadow-xl'
                        }`}
                    >
                        <SlidersHorizontal size={18} />
                        <span>Filter</span>
                        {selectedTags.length > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{selectedTags.length}</span>
                        )}
                        <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* --- 2. 伸缩式标签栏：只有点击 Filter 才会下拉 --- */}
                {isFilterOpen && (
                    <div className="max-w-5xl mx-auto mt-4 bg-white dark:bg-[#1a1c20] rounded-[24px] p-8 shadow-2xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2">
                        <div className="space-y-6">
                            {Object.entries(TAG_CATEGORIES).map(([catName, tags]) => (
                                <div key={catName} className="flex gap-4 items-start">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2 min-w-[60px]">
                                        {catName}
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                                    selectedTags.includes(tag)
                                                    ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white'
                                                    : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:border-[#3fc1c0]'
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

            {/* --- 3. 作品展示区：间距更紧凑，突出图 --- */}
            <main className="max-w-[1800px] mx-auto px-8 py-10">
                <div className="flex items-center justify-between mb-8 opacity-50 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Showing {filteredPrompts.length} Results
                    </span>
                    {selectedTags.length > 0 && (
                        <button onClick={() => setSelectedTags([])} className="text-[10px] font-bold text-[#3fc1c0] flex items-center gap-1">
                            <X size={12}/> CLEAR FILTERS
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                    {filteredPrompts.map((prompt) => (
                        <PromptItem key={prompt.id} prompt={prompt} />
                    ))}
                </div>
            </main>
        </div>
    );
}