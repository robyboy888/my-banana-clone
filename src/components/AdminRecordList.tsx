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
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const isGrid = viewMode === 'grid';

    return (
        <div className="space-y-6">
            
            {/* 顶部控制区域：返回、新增、视图切换 */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="space-x-4">
                    <Link 
                        href="/" 
                        className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-sm"
                    >
                        &larr; 返回前端
                    </Link>
                    <Link 
                        href="/admin/new" 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
                    >
                        + 新增 Prompt
                    </Link>
                </div>
                
                {/* 视图切换按钮 */}
                <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isGrid ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        列表
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isGrid ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
                    >
                        网格
                    </button>
                </div>
            </div>

            {/* 渲染区域 */}
            {prompts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">数据库空空如也...</p>
                </div>
            ) : (
                <div className={isGrid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'divide-y divide-gray-100'}>
                    {prompts.map((prompt, index) => (
                        <div key={prompt.id} className={isGrid ? 'h-full' : ''}>
                            {isGrid ? (
                                // 💥 关键点：为网格模式也传入 isAdmin={true}
                                <PromptItem 
                                    prompt={prompt} 
                                    isAdmin={true} 
                                />
                            ) : (
                                // 列表模式
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
        </div>
    );
}