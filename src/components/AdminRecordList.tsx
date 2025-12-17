'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Prompt } from '@/types/prompt';
import ListItem from './ListItem'; 
import PromptItem from './PromptItem'; 

interface AdminRecordListProps {
    initialPrompts: Prompt[];
}

export default function AdminRecordList({ initialPrompts }: AdminRecordListProps) {
    // 1. 状态管理
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const isGrid = viewMode === 'grid';

    // 2. 搜索过滤逻辑 (核心新增)
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
            
            {/* 顶部控制区域：搜索、返回、新增、视图切换 */}
            <div className="flex flex-col gap-6 mb-8 border-b pb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href="/" 
                            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-200 transition shadow-sm border border-gray-200"
                        >
                            &larr; 返回前端
                        </Link>
                        <Link 
                            href="/admin/new" 
                            className="px-5 py-2.5 bg-[#3fc1c0] text-white rounded-2xl text-sm font-bold hover:bg-[#34a3a2] transition shadow-md flex items-center"
                        >
                            <span className="mr-1.5 text-lg">+</span> 新增 Prompt
                        </Link>
                    </div>

                    {/* 🔍 搜索框 (合并新增) */}
                    <div className="relative w-full sm:w-80">
                        <input
                            type="text"
                            placeholder="搜索标题、内容或 ID..."
                            className="w-full px-5 py-2.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#3fc1c0] outline-none shadow-sm transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-2.5 text-gray-400 hover:text-gray-600"
                            >✕</button>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">View Mode</p>
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${!isGrid ? 'bg-white shadow-md text-[#3fc1c0]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                LIST
                            </button>
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${isGrid ? 'bg-white shadow-md text-[#3fc1c0]' : 'text-gray-400'}`}
                            >
                                GRID
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 渲染区域 */}
            {filteredPrompts.length === 0 ? (
                <div className="text-center py-32 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-400 font-bold text-xl">
                        {initialPrompts.length === 0 ? "数据库空空如也..." : "未找到匹配结果..."}
                    </p>
                    {initialPrompts.length === 0 && (
                        <Link href="/admin/new" className="text-[#3fc1c0] underline mt-2 inline-block font-bold">立即创建第一条记录</Link>
                    )}
                </div>
            ) : (
                <div className={isGrid 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8' 
                    : 'bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50'
                }>
                    {filteredPrompts.map((prompt, index) => (
                        <div key={prompt.id} className={isGrid ? 'h-full transition-transform hover:-translate-y-1' : ''}>
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
            <div className="pt-10 pb-20 text-center">
                <p className="text-gray-300 text-sm font-bold uppercase tracking-widest">
                    {searchQuery ? `Found ${filteredPrompts.length} Matches` : `Total ${initialPrompts.length} Records Loaded`}
                </p>
            </div>
        </div>
    );
}