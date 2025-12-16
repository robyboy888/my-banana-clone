'use client';

import React, { useState, useCallback, useMemo } from 'react';
// 确保您的 PromptItem, ListItem, CopyButton 路径正确
import PromptItem from './PromptItem'; 
import ListItem from './ListItem'; 
import CopyButton from './CopyButton'; 

// 定义数据类型 (必须与您的 Supabase 表结构匹配)
interface Prompt {
    id: number;
    title: string;
    content: string; // 原始提示词
    original_image_url: string; // 原始图
    
    // 以下是优化和用户上传字段
    optimized_prompt?: string;
    optimized_image_url?: string;
    user_portrait_url?: string;
    user_background_url?: string;
}

// 定义视图模式
type ViewMode = 'grid' | 'list'; 

// 两种模式下的分页大小
const GRID_PAGE_SIZE = 50; 
const LIST_PAGE_SIZE = 30; 

export default function PromptList({ initialPrompts }: { initialPrompts: Prompt[] }) {
    
    // 基础数据状态
    const [prompts, setPrompts] = useState(initialPrompts);
    const [isLoading, setIsLoading] = useState(false);

    // UI/视图状态
    const [viewMode, setViewMode] = useState<ViewMode>('grid'); 
    const [currentPage, setCurrentPage] = useState(1); 
    
    // 强制显示 "加载更多" 按钮，直到最后一页 API 返回数据不足为止
    // 只要初始数据不为空，就假定有更多数据
    const [hasMore, setHasMore] = useState(initialPrompts.length > 0); 

    /**
     * 客户端分页逻辑 (仅用于列表视图)
     * 计算当前页应该显示的数据子集
     */
    const visiblePrompts = useMemo(() => {
        if (viewMode === 'list') {
            // Client-side Pagination: 根据页码和 LIST_PAGE_SIZE 切割数组
            const start = (currentPage - 1) * LIST_PAGE_SIZE;
            const end = start + LIST_PAGE_SIZE;
            return prompts.slice(start, end);
        }
        // 网格模式使用全部已加载的数据
        return prompts; 
    }, [prompts, viewMode, currentPage]);

    /**
     * 计算总页数 (仅用于列表视图)
     */
    const totalPages = useMemo(() => {
        // 避免除以零
        if (prompts.length === 0) return 1;
        // 计算总页数
        return Math.ceil(prompts.length / LIST_PAGE_SIZE);
    }, [prompts.length]);

    /**
     * 加载更多数据的函数 (仅用于网格视图)
     * 调用 Next.js 的 API 路由
     */
    const loadMore = useCallback(async () => {
        setIsLoading(true);
        // 新的起始点即已加载的数据长度
        const newOffset = prompts.length; 

        try {
            const response = await fetch(`/api/prompts?offset=${newOffset}`);
            
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const data: Prompt[] = await response.json(); 
            
            // 诊断日志
            console.log(`[DIAGNOSTIC] Loading more prompts with offset: ${newOffset}`);
            console.log(`[DIAGNOSTIC] API returned ${data.length} new prompts.`);


            if (data && data.length > 0) {
                // 关键行：追加新数据
                setPrompts(prev => [...prev, ...data]);
            }
            
            // 如果返回的数据少于 PAGE_SIZE，说明没有更多了
            if (!data || data.length < GRID_PAGE_SIZE) {
                setHasMore(false); 
            }

        } catch (error) {
            console.error('Error loading more data:', error);
            alert('加载更多数据失败，请检查网络或联系管理员。');
        } finally {
            setIsLoading(false);
        }
    }, [prompts.length]); 


    // --- 渲染逻辑 ---
    
    // 如果初始数据为空，显示友好提示
    if (prompts.length === 0 && !isLoading) {
        return <p className="text-center mt-12 text-gray-500">数据库中没有数据。</p>;
    }
    
    return (
        <>
            {/* 视图切换按钮区域 */}
            <div className="flex justify-end space-x-2 mb-4">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    title="网格视图 (无限加载)"
                >
                    网格视图
                </button>
                <button
                    onClick={() => {
                        setViewMode('list');
                        setCurrentPage(1); // 切换视图时重置页码
                    }}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    title="列表视图 (翻页模式)"
                >
                    列表视图
                </button>
            </div>

            {/* --- 视图内容 --- */}
            
            {viewMode === 'grid' && (
                // 网格视图：使用 PromptItem (大卡片) 和无限加载
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* PromptItem 组件需要您从 page.tsx 移动过来并创建 */}
                        {prompts.map((prompt) => (
                            <PromptItem key={prompt.id} prompt={prompt} /> 
                        ))}
                    </div>
                    
                    {/* 底部加载更多按钮 (仅在网格视图中显示) */}
                    {hasMore && (
                        <div className="text-center mt-12">
                            <button
                                onClick={loadMore}
                                disabled={isLoading}
                                className="bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-yellow-600 transition disabled:bg-gray-400"
                            >
                                {isLoading ? '加载中...' : '加载更多 Prompt'}
                            </button>
                        </div>
                    )}
                    
                    {!hasMore && (
                        <p className="text-center mt-12 text-gray-500">已加载所有 {prompts.length} 条数据。</p>
                    )}
                </>
            )}

            {viewMode === 'list' && (
                // 列表视图：使用 ListItem (紧凑模式) 和客户端翻页
                <>
                    <div className="space-y-3">
                        {/* ListItem 组件需要您新建 */}
                        {visiblePrompts.map((prompt) => (
                            <ListItem key={prompt.id} prompt={prompt} /> 
                        ))}
                        {/* 列表为空时的提示 (如果加载了数据但当前页没数据) */}
                        {visiblePrompts.length === 0 && prompts.length > 0 && (
                            <p className="text-center text-gray-500">当前页没有数据，请尝试调整页码。</p>
                        )}
                    </div>

                    {/* 翻页控制区 (仅在列表视图中显示) */}
                    {prompts.length > LIST_PAGE_SIZE && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                            >
                                上一页
                            </button>
                            <span className="text-gray-700">第 {currentPage} 页 / 共 {totalPages} 页</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                            >
                                下一页
                            </button>
                        </div>
                    )}
                    
                    {/* 提示用户在列表模式下需要先加载数据 */}
                    {prompts.length < LIST_PAGE_SIZE && (
                         <p className="text-center mt-8 text-sm text-yellow-600">提示：在切换到列表视图前，请在网格视图中点击 '加载更多' 以获取更多数据，确保翻页正常工作。</p>
                    )}

                </>
            )}
        </>
    );
}