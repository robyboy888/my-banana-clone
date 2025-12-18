'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Prompt } from '@/types/prompt';
import ListItem from './ListItem'; 
import PromptItem from './PromptItem'; 
import { Search, Grid, List, Plus, ArrowLeft, X, Database } from 'lucide-react';

interface AdminRecordListProps {
    initialPrompts: Prompt[];
}

export default function AdminRecordList({ initialPrompts }: AdminRecordListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const isGrid = viewMode === 'grid';

    // 搜索过滤逻辑
    const filteredPrompts = initialPrompts.filter((item) => {
        if (!item) return false;
        const searchLower = searchQuery.toLowerCase();
        return (
            item.title?.toLowerCase().includes(searchLower) ||
            item.content?.toLowerCase().includes(searchLower) ||
            item.id?.toString().includes(searchLower)
        );
    });

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* 顶部控制区域 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* 左侧：操作按钮 */}
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/" 
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            预览前端
                        </Link>
                        <Link 
                            href="/admin/new" 
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            新增 PROMPT
                        </Link>
                    </div>

                    {/* 中间：搜索框 */}
                    <div className="relative flex-grow max-w-md">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="搜索标题、内容或 ID..."
                            className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* 右侧：视图切换 */}
                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${!isGrid ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                            >
                                <List className="w-3.5 h-3.5" />
                                LIST
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${isGrid ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
                            >
                                <Grid className="w-3.5 h-3.5" />
                                GRID
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 渲染区域 */}
            {filteredPrompts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Database className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-lg">
                        {initialPrompts.length === 0 ? "数据库尚未发现任何提示词" : "找不到相关的匹配记录"}
                    </p>
                    {initialPrompts.length === 0 && (
                        <Link href="/admin/new" className="text-indigo-600 dark:text-indigo-400 underline mt-4 font-bold hover:text-indigo-700">
                            点击开始创建第一条记录
                        </Link>
                    )}
                </div>
            ) : (
                <div className={isGrid 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8' 
                    : 'bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50'
                }>
                    {filteredPrompts.map((prompt, index) => (
                        <div key={prompt.id} className={isGrid ? 'h-full' : ''}>
                            {isGrid ? (
                                <PromptItem 
                                    prompt={prompt} 
                                    isAdmin={true} 
                                />
                            ) : (
                                <ListItem 
                                    prompt={prompt} 
                                    index={index + 1} 
                                    isAdmin={true} 
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* 底部统计 */}
            <div className="pt-10 pb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        {searchQuery ? `${filteredPrompts.length} Results Matched` : `${initialPrompts.length} Total Records`}
                    </p>
                </div>
            </div>
        </div>
    );
}