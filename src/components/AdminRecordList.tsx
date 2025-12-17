// /src/components/AdminRecordList.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Prompt } from '@/types/prompt';
import ListItem from './ListItem'; 
import PromptItem from './PromptItem'; 
import { useRouter } from 'next/navigation';

interface AdminRecordListProps {
    initialPrompts: Prompt[];
}

export default function AdminRecordList({ initialPrompts }: AdminRecordListProps) {
    // prompts 状态保留，用于在删除后即时更新 UI
    const [prompts, setPrompts] = useState(initialPrompts);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const isGrid = viewMode === 'grid';

    return (
        <div className="space-y-6">
            
            {/* 顶部控制区域 */}
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
                
                {/* 视图切换 */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${!isGrid ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}
                    >
                        列表
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${isGrid ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}
                    >
                        网格
                    </button>
                </div>
            </div>

            {/* 渲染区域 */}
            {prompts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
                    <p className="text-gray-400">数据库空空如也...</p>
                </div>
            ) : (
                <div className={isGrid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'divide-y divide-gray-100'}>
                    {prompts.map((prompt, index) => (
                        <div key={prompt.id} className={isGrid ? 'relative group' : ''}>
                            {isGrid ? (
                                // 网格模式：调用 PromptItem
                                <PromptItem 
                                    prompt={prompt} 
                                    // 如果 PromptItem 也需要管理功能，记得在 PromptItem 内部也加入 isAdmin 判断
                                />
                            ) : (
                                // 列表模式：调用合并后的 ListItem
                                // 💥 关键：传入 isAdmin={true}，它会自动显示编辑和删除按钮
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