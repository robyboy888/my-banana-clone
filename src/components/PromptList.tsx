'use client';

import React, { useState, useCallback, useMemo } from 'react';
import PromptItem from './PromptItem'; 
import ListItem from './ListItem'; 
import CopyButton from './CopyButton'; 

// 定义数据类型 (保持与之前一致)
interface Prompt {
    id: number;
    title: string;
    content: string; 
    original_image_url: string; 
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
// 假设您的总数据量在 600 条左右
const MAX_DATA_TO_FETCH = 600; 

export default function PromptList({ initialPrompts }: { initialPrompts: Prompt[] }) {
    
    // 基础数据状态
    const [prompts, setPrompts] = useState(initialPrompts);
    const [isLoading, setIsLoading] = useState(false);

    // UI/视图状态
    const [viewMode, setViewMode] = useState<ViewMode>('grid'); 
    const [currentPage, setCurrentPage] = useState(1); 
    
    // 💥 新增状态：用于跳转页面的输入框
    const [jumpPageInput, setJumpPageInput] = useState(''); 

    // 强制显示 "加载更多" 按钮，直到最后一页 API 返回数据不足为止
    const [hasMore, setHasMore] = useState(initialPrompts.length > 0 && initialPrompts.length === GRID_PAGE_SIZE); 
    
    // 跟踪列表视图是否已加载全部数据
    const [fullDataLoaded, setFullDataLoaded] = useState(initialPrompts.length >= MAX_DATA_TO_FETCH); 


    /**
     * 客户端分页逻辑 (仅用于列表视图)
     */
    const visiblePrompts = useMemo(() => {
        if (viewMode === 'list') {
            const start = (currentPage - 1) * LIST_PAGE_SIZE;
            const end = start + LIST_PAGE_SIZE;
            return prompts.slice(start, end);
        }
        return prompts; 
    }, [prompts, viewMode, currentPage]);

    /**
     * 计算总页数 (用于列表视图)
     */
    const totalPages = useMemo(() => {
        if (prompts.length === 0) return 1;
        return Math.ceil(prompts.length / LIST_PAGE_SIZE);
    }, [prompts.length]);
    
    
    /**
     * 💥 新增 Handler：处理跳转页面的输入变化
     */
    const handleJumpPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // 确保输入值是数字或空
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setJumpPageInput(value);
        }
    };

    /**
     * 💥 新增 Handler：处理跳转页面的按钮点击或回车
     */
    const handleJumpPage = () => {
        const pageNumber = parseInt(jumpPageInput, 10);
        const maxPages = totalPages;

        if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > maxPages) {
            alert(`请输入一个有效的页码（1到 ${maxPages} 之间）。`);
            return;
        }

        setCurrentPage(pageNumber);
        setJumpPageInput(''); // 跳转成功后清空输入框
    };
    
    
    /**
     * 函数：用于列表视图，一次性加载全部数据（最多 600 条）
     */
    const fetchFullDataset = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/prompts?offset=0&limit=${MAX_DATA_TO_FETCH}`); 
            
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const data: Prompt[] = await response.json(); 
            
            if (data && data.length > 0) {
                setPrompts(data); 
                setFullDataLoaded(true); 
                setHasMore(false); 
            } else {
                 setHasMore(false); 
            }

        } catch (error) {
            console.error('Error loading full dataset:', error);
            alert('加载全部数据失败。');
        } finally {
            setIsLoading(false);
        }
    }, []); 

    
    /**
     * 函数：用于网格视图的无限滚动
     */
    const loadMore = useCallback(async () => {
        setIsLoading(true);
        const newOffset = prompts.length; 

        try {
            const response = await fetch(`/api/prompts?offset=${newOffset}`);
            
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const data: Prompt[] = await response.json(); 
            
            if (data && data.length > 0) {
                setPrompts(prev => [...prev, ...data]);
            }
            
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

    
    /**
     * 函数：处理视图切换逻辑
     */
    const handleViewModeSwitch = (mode: ViewMode) => {
        setViewMode(mode);
        setCurrentPage(1); // 切换视图时重置页码

        // 如果切换到列表视图，并且尚未加载全部数据，则触发全量加载
        if (mode === 'list' && !fullDataLoaded) {
            fetchFullDataset();
        }
    };


    // --- 渲染逻辑 ---
    
    if (prompts.length === 0 && !isLoading) {
        return <p className="text-center mt-12 text-gray-500">数据库中没有数据。</p>;
    }
    
    return (
        <>
            {/* 视图切换按钮区域 */}
            <div className="flex justify-end space-x-2 mb-4">
                <button
                    onClick={() => handleViewModeSwitch('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    title="网格视图 (无限加载)"
                >
                    网格视图
                </button>
                <button
                    onClick={() => handleViewModeSwitch('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    title="列表视图 (翻页模式)"
                >
                    列表视图
                </button>
            </div>

            {/* 加载指示器 */}
            {isLoading && (
                 <div className="text-center p-4 text-yellow-600 font-semibold">
                    {viewMode === 'list' ? '正在加载全部数据...' : '加载中...'}
                 </div>
            )}


            {/* --- 视图内容 --- */}
            
            {viewMode === 'grid' && (
                // 网格视图
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {prompts.map((prompt) => (
                            <PromptItem key={prompt.id} prompt={prompt} /> 
                        ))}
                    </div>
                    
                    {/* 底部加载更多按钮 */}
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
                // 列表视图
                <>
                    <div className="space-y-3">
                        {visiblePrompts.map((prompt, i) => {
                            // 计算全局行号
                            const baseIndex = (currentPage - 1) * LIST_PAGE_SIZE;
                            const globalIndex = baseIndex + i + 1;

                            return (
                                <ListItem 
                                    key={prompt.id} 
                                    prompt={prompt} 
                                    index={globalIndex}
                                /> 
                            );
                        })}
                        
                        {visiblePrompts.length === 0 && prompts.length > 0 && (
                            <p className="text-center text-gray-500">当前页没有数据，请尝试调整页码。</p>
                        )}
                        
                        {visiblePrompts.length === 0 && !fullDataLoaded && !isLoading && (
                            <p className="text-center text-gray-500">请稍候，正在加载全部数据...</p>
                        )}
                    </div>

                    {/* 翻页控制区 */}
                    {prompts.length > LIST_PAGE_SIZE && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                            
                            {/* 上一页 */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                            >
                                上一页
                            </button>
                            
                            {/* 页码信息 */}
                            <span className="text-gray-700">第 {currentPage} 页 / 共 {totalPages} 页</span>
                            
                            {/* 下一页 */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
                            >
                                下一页
                            </button>

                            {/* 💥 跳转页码输入框和按钮 */}
                            <div className="flex space-x-2 ml-6 items-center">
                                <input
                                    type="number"
                                    value={jumpPageInput}
                                    onChange={handleJumpPageChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleJumpPage();
                                    }}
                                    min="1"
                                    max={totalPages}
                                    placeholder="页码"
                                    className="w-16 p-2 border border-gray-300 rounded text-center"
                                />
                                <button
                                    onClick={handleJumpPage}
                                    disabled={!jumpPageInput || isLoading}
                                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
                                >
                                    跳转
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}