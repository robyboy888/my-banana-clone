'use client';

import React, { useState, useMemo, useEffect } from 'react';
import PromptItem from '../src/components/PromptItem'; 
import { Prompt } from '../src/types/prompt'; 

export default function HomeClient({ initialPrompts = [] }: { initialPrompts: Prompt[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredPrompts = useMemo(() => {
        const data = Array.isArray(initialPrompts) ? initialPrompts : [];
        if (!searchQuery.trim()) return data;
        
        const query = searchQuery.toLowerCase();
        return data.filter(prompt => {
            const titleMatch = (prompt?.title ?? '').toLowerCase().includes(query);
            const contentMatch = (prompt?.content ?? '').toLowerCase().includes(query);
            const authorMatch = (prompt?.source_x_account ?? '').toLowerCase().includes(query);
            return titleMatch || contentMatch || authorMatch;
        });
    }, [searchQuery, initialPrompts]);

    if (!mounted) return <div className="min-h-screen bg-[#F8FAFC]" />;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1600px] mx-auto px-6 pt-16 pb-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-slate-900 italic">
                            Banana <span className="text-indigo-600">Clone</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg">
                            Premium library of AI prompts for creative masters. 
                        </p>
                    </div>

                    <div className="relative w-full lg:w-[500px]">
                        <input
                            type="text"
                            placeholder="Search prompts..."
                            value={searchQuery}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-6 pr-12 py-5 bg-white border-2 rounded-[24px] outline-none transition-all ${
                                isFocused ? 'border-indigo-500 shadow-xl' : 'border-slate-100'
                            }`}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 pb-32">
                {filteredPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {filteredPrompts.map((prompt) => (
                            <div key={prompt.id}>
                                <PromptItem prompt={prompt} isAdmin={false} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center text-slate-400 font-bold">
                        No prompts found
                    </div>
                )}
            </div>
        </div>
    );
}