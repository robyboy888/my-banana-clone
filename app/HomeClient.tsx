'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Search, Grid, List, Hash, ChevronRight } from 'lucide-react';

// 按照截图定义的分类
const TAG_CATEGORIES = {
  "Genre & Subject (题材)": ["Character", "Portrait", "Landscape", "Architecture", "Sci-Fi", "Cyberpunk", "Fantasy", "Animals", "Food", "Nature", "Still Life", "Fashion", "Abstract", "Cityscape"],
  "Artistic Styles (艺术风格)": ["Realistic", "Anime", "3D Render", "Oil Painting", "Watercolor", "Sketch", "Vector", "Pixel Art", "Digital Art", "Comic", "Cartoon", "Gothic", "Steampunk", "Pop Art"],
  "Mood & Tone (氛围)": ["Cinematic", "Ethereal", "Dark", "Vibrant", "Minimalist", "Epic", "Mysterious"]
};

interface Prompt {
    id: number;
    title: string;
    content: string;
    tags?: string[] | string;
    original_image_url: string;
    optimized_image_url?: string;
    optimized_prompt?: string;
}

export default function HomeClient({ initialPrompts = [] }: { initialPrompts: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedView = localStorage.getItem('banana-view-mode') as 'grid' | 'list';
        if (savedView) setViewMode(savedView);
        setMounted(true);
    }, []);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const filteredPrompts = useMemo(() => {
        return initialPrompts.filter(prompt => {
            const matchesSearch = !searchQuery.trim() || 
                prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prompt.content?.toLowerCase().includes(searchQuery.toLowerCase());
            
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

    if (!mounted) return null;

    return (
        <div className="w-full pb-20">
            {/* --- 1. 搜索框：半嵌入式布局 + 极重阴影 --- */}
            <div className="relative -mt-12 px-6 z-30">
                <div className="max-w-4xl mx-auto">
                    <div className="relative group bg-white dark:bg-[#1a1c20] rounded-[32px] p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] transition-all duration-500 hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.4)] border border-white/10">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3fc1c0] transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="搜索灵感，寻找创意..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-20 pl-20 pr-10 bg-transparent border-none text-xl outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* --- 2. 顶部分类筛选栏 --- */}
            <section className="mt-12 mb-16 space-y-8 max-w-[1600px] mx-auto px-8">
                {Object.entries(TAG_CATEGORIES).map(([catName, tags]) => (
                    <div key={catName} className="flex items-start gap-6 group">
                        <div className="flex items-center gap-2 pt-2 min-w-[140px]">
                            <div className="w-1 h-3 bg-[#3fc1c0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                {catName.split(' ')[0]}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-5 py-2.5 rounded-2xl text-[11px] font-bold transition-all border ${
                                        selectedTags.includes(tag)
                                        ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-[0_8px_16px_-4px_rgba(63,193,192,0.4)]'
                                        : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* --- 3. 结果显示区 --- */}
            <main className="max-w-[1600px] mx-auto px-8">
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Showing <span className="text-slate-900 dark:text-white mx-1">{filteredPrompts.length}</span> Results
                        </span>
                    </div>
                    
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl">
                        <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-[#3fc1c0] shadow-md' : 'text-slate-400'}`}>
                            <Grid size={20} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-[#3fc1c0] shadow-md' : 'text-slate-400'}`}>
                            <List size={20} />
                        </button>
                    </div>
                </div>

                {filteredPrompts.length > 0 ? (
                    <div className={
                        viewMode === 'grid' 
                        ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-8 gap-y-12" 
                        : "flex flex-col gap-6 max-w-5xl mx-auto"
                    }>
                        {filteredPrompts.map((prompt) => (
                            <PromptItem key={prompt.id} prompt={prompt} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-48 opacity-20">
                        <Hash size={64} className="mb-6" />
                        <p className="font-black uppercase tracking-[0.3em] text-sm text-center">No matches found in the archive</p>
                    </div>
                )}
            </main>
        </div>
    );
}