'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Search, Filter, Grid, List, Hash, ChevronDown, ChevronUp } from 'lucide-react';

// --- 1. Category Standards ---
const TAG_CATEGORIES = {
  "Genre & Subject (题材)": ["Character", "Portrait", "Landscape", "Architecture", "Sci-Fi", "Cyberpunk", "Fantasy", "Animals", "Food", "Nature"],
  "Artistic Styles (艺术风格)": ["Realistic", "Anime", "3D Render", "Oil Painting", "Watercolor", "Sketch", "Pixel Art", "Digital Art", "Steampunk", "Pop Art"],
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
    const [openCategories, setOpenCategories] = useState<string[]>(["Genre & Subject (题材)"]);

    // Initialize view mode from localStorage
    useEffect(() => {
        const savedView = localStorage.getItem('banana-view-mode') as 'grid' | 'list';
        if (savedView) setViewMode(savedView);
        setMounted(true);
    }, []);

    const saveViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        localStorage.setItem('banana-view-mode', mode);
    };

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // Filter Logic
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
            
            // Matches all selected tags (AND logic)
            const matchesTags = selectedTags.length === 0 || 
                selectedTags.every(tag => promptTags.includes(tag));

            return matchesSearch && matchesTags;
        });
    }, [searchQuery, selectedTags, initialPrompts]);

    if (!mounted) return <div className="min-h-screen bg-white dark:bg-slate-950" />;

    return (
        <div className="flex flex-col lg:flex-row gap-10 max-w-[1600px] mx-auto px-6 py-12">
            
            {/* --- Sidebar: Categories & Filters --- */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                        <Filter size={14} /> Filter
                    </h3>
                    {selectedTags.length > 0 && (
                        <button 
                            onClick={() => setSelectedTags([])} 
                            className="text-[10px] font-bold text-[#3fc1c0] hover:underline"
                        >
                            CLEAR ALL ({selectedTags.length})
                        </button>
                    )}
                </div>

                {/* Sidebar Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3fc1c0] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-10 bg-slate-100 dark:bg-slate-900 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3fc1c0]/20 transition-all text-slate-700 dark:text-slate-200"
                    />
                </div>

                {/* Collapsible Category List */}
                <div className="space-y-1 pt-4">
                    {Object.entries(TAG_CATEGORIES).map(([catName, tags]) => (
                        <div key={catName} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-2">
                            <button 
                                onClick={() => toggleCategory(catName)}
                                className="w-full flex items-center justify-between py-4 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-[#3fc1c0] transition-colors"
                            >
                                {catName}
                                {openCategories.includes(catName) ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                            </button>
                            
                            {openCategories.includes(catName) && (
                                <div className="flex flex-wrap gap-2 pb-4 animate-in fade-in slide-in-from-top-1">
                                    {tags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                                selectedTags.includes(tag)
                                                ? 'bg-[#3fc1c0] border-[#3fc1c0] text-white shadow-lg shadow-[#3fc1c0]/20'
                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-[#3fc1c0]'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* --- Main Content Area --- */}
            <main className="flex-1 space-y-8">
                {/* Top Info Bar */}
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Showing {filteredPrompts.length} Results
                    </div>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={() => saveViewMode('grid')} 
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-[#3fc1c0] shadow-sm' : 'text-slate-400'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button 
                            onClick={() => saveViewMode('list')} 
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-[#3fc1c0] shadow-sm' : 'text-slate-400'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Grid/List Rendering */}
                {filteredPrompts.length > 0 ? (
                    <div className={
                        viewMode === 'grid' 
                        ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6" 
                        : "flex flex-col gap-4 max-w-4xl"
                    }>
                        {filteredPrompts.map((prompt) => (
                            <PromptItem key={prompt.id} prompt={prompt} isAdmin={false} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 opacity-30 text-slate-500 dark:text-slate-400">
                        <Hash size={48} className="mb-4" />
                        <p className="font-bold tracking-widest uppercase text-xs">No prompts found matching your criteria</p>
                    </div>
                )}
            </main>
        </div>
    );
}