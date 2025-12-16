// /src/components/AdminRecordList.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Prompt } from '@/types/prompt';
import ListItem from './ListItem'; 
import PromptItem from './PromptItem'; 
import { useRouter } from 'next/navigation';

// ----------------------------------------------------
// 修复类型错误 (最新的构建失败已通过 /app/admin/page.tsx 解决)
// ----------------------------------------------------
interface AdminRecordListProps {
    initialPrompts: Prompt[];
}

export default function AdminRecordList({ initialPrompts }: AdminRecordListProps) {
    // 使用 state 来管理数据，便于删除后更新列表
    const [prompts, setPrompts] = useState(initialPrompts);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const router = useRouter();

    // ----------------------------------------------------
    // 异步删除逻辑
    // ----------------------------------------------------
    const handleDelete = async (promptId: number) => {
        if (!confirm('确定要删除这条记录吗？')) {
            return;
        }

        try {
            // 假设删除 API 路由是 /api/admin/delete/[promptId]
            const response = await fetch(`/api/admin/delete/${promptId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '删除失败，请检查服务器日志。');
            }

            // 客户端状态更新：从列表中移除已删除项
            setPrompts(prev => prev.filter(p => p.id !== promptId));
            alert('记录删除成功！');

        } catch (error: any) {
            console.error('Deletion error:', error);
            alert(`删除操作失败: ${error.message}`);
        }
    };
    
    // ----------------------------------------------------
    // 渲染
    // ----------------------------------------------------
    
    const isGrid = viewMode === 'grid';
    
    return (
        <div className="space-y-6">
            
            {/* 顶部控制区域：返回、新增、视图切换 */}
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div className="space-x-4">
                    <Link 
                        href="/" 
                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                        &larr; 返回前端列表
                    </Link>
                    <Link 
                        href="/admin/new" 
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        + 新增记录
                    </Link>
                </div>
                
                {/* 视图切换按钮 */}
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${!isGrid ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        列表视图
                    </button>
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${isGrid ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                        网格视图
                    </button>
                </div>
            </div>

            {/* 列表/网格渲染区域 */}
            {prompts.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">暂无记录。</p>
            ) : (
                <div className={`
                    ${isGrid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
                `}>
                    {/* 💥 修复 index 缺失的类型错误：在 map 中获取 index */}
                    {prompts.map((prompt, index) => (
                        <div 
                            key={prompt.id} 
                            // 在列表模式下添加边框和布局
                            className={isGrid ? 'shadow-lg rounded-xl overflow-hidden flex flex-col' : 'border p-4 rounded-lg flex justify-between items-start'}
                        >
                            
                            {/* 1. 渲染 PromptItem 或 ListItem (只传递 prompt 和 index) */}
                            {isGrid ? (
                                // 假设 PromptItem 只需要 prompt
                                <PromptItem 
                                    prompt={prompt} 
                                />
                            ) : (
                                // 💥 关键修正：传递 index 属性，修复最新的类型错误
                                <ListItem 
                                    prompt={prompt} 
                                    index={index} 
                                />
                            )}
                            
                            {/* 2. 操作按钮：直接渲染，避免 props 冲突 */}
                            <div className="flex space-x-2 p-2 mt-auto w-full justify-end">
                                {/* 💥 P1 修复：编辑链接 (解决 404) */}
                                <Link 
                                    href={`/admin/edit?id=${prompt.id}`} 
                                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                                >
                                    编辑
                                </Link>
                                
                                <button
                                    onClick={() => handleDelete(prompt.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}