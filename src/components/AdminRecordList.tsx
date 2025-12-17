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
    // prompts 状态保留
    const [prompts] = useState(initialPrompts);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // 默认改为网格更直观
    const isGrid = viewMode === 'grid';

    return (
        /* 💥 修改点：增加最大宽度限制和自动居中，优化大屏留白 */
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
            
            {/* 顶部控制区域：返回、新增、视图切换 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-6">
                <div className="flex items-center space-x-4">
                    <Link 
                        href="/" 
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-200 transition shadow-sm border border-gray-200"
                    >
                        &larr; 返回前端
                    </Link>
                    <Link 
                        href="/admin/new" 
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition shadow-md flex items-center"
                    >
                        <span className="mr-1.5 text-lg">+</span> 新增 Prompt
                    </Link>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">View Mode</p>
                    {/* 视图切换按钮 */}
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${!isGrid ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            LIST
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`px-6 py-2 rounded-xl text-xs font-black transition-all duration-300 ${isGrid ? 'bg-white shadow-md text-indigo-600' : 'text-gray-400'}`}
                        >
                            GRID
                        </button>
                    </div>
                </div>
            </div>

            {/* 渲染区域 */}
            {prompts.length === 0 ? (
                <div className="text-center py-32 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-400 font-bold text-xl">数据库空空如也...</p>
                    <Link href="/admin/new" className="text-indigo-500 underline mt-2 inline-block font-bold">立即创建第一条记录</Link>
                </div>
            ) : (
                /* 💥 修改点：调整网格响应式断点，2xl 时显示 5 列，拉长卡片比例 */
                <div className={isGrid 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8' 
                    : 'bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden'
                }>
                    {prompts.map((prompt, index) => (
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
                    Total {prompts.length} Records Loaded
                </p>
            </div>
        </div>
    );
}