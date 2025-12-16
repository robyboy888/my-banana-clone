// components/PromptList.tsx
'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
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

const PAGE_SIZE = 50; 

export default function PromptList({ initialPrompts }: { initialPrompts: Prompt[] }) {
    
    // ... (状态定义保持不变) ...
    const [prompts, setPrompts] = useState(initialPrompts);
    const [isLoading, setIsLoading] = useState(false);
    
    // 💥 关键最终修正：
    // 如果初始数据量大于 0 (说明查询成功)，则假定有更多数据。
    // 这将强制按钮显示出来，直到加载到真正最后一页时再隐藏。
    const [hasMore, setHasMore] = useState(initialPrompts.length > 0);

    /**
     * 加载更多数据的函数，调用 Next.js 的 API 路由
     */
    const loadMore = useCallback(async () => {
        setIsLoading(true);
        const newOffset = prompts.length; // 新的起始点即已加载的数据长度
		

        try {
            const response = await fetch(`/api/prompts?offset=${newOffset}`);
            
            // ... (错误处理) ...

            const data: Prompt[] = await response.json(); 
            
            // 💥 新增诊断日志
            console.log(`[DIAGNOSTIC] Loading more prompts with offset: ${newOffset}`);
            console.log(`[DIAGNOSTIC] API returned ${data.length} new prompts.`);


            if (data && data.length > 0) {
                // 关键行：追加新数据
                setPrompts(prev => [...prev, ...data]);
                
                // 💥 新增诊断日志
                console.log(`[DIAGNOSTIC] Total prompts after append: ${prompts.length + data.length}`);
            }
            // ...


        } catch (error) {
            console.error('Error loading more data:', error);
            alert('加载更多数据失败，请检查网络或联系管理员。');
        } finally {
            setIsLoading(false);
        }
    }, [prompts.length]); // 依赖于 prompts.length 来计算 offset

    return (
        <>
            {/* 瀑布流/网格展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {prompts.map((prompt) => (
                    <div 
                        key={prompt.id} 
                        className="bg-white p-6 rounded-xl shadow-xl transition duration-300 border border-yellow-300 flex flex-col"
                    >
                        <h2 className="text-2xl font-bold text-yellow-700 mb-4">{prompt.title}</h2>

                        {/* 用户参考图片 (肖像 + 背景) */}
                        {(prompt.user_portrait_url || prompt.user_background_url) && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <h3 className="font-bold text-blue-700 mb-2 text-sm">用户参考输入：</h3>
                                <div className="flex space-x-2">
                                    {/* 个人肖像 */}
                                    {prompt.user_portrait_url && (
                                        <div className="relative w-1/2 h-20 rounded-lg overflow-hidden border border-red-400">
                                            <Image 
                                                src={prompt.user_portrait_url}
                                                alt="用户肖像"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <span className="absolute top-0 left-0 bg-red-600 text-white text-xs px-1">肖像</span>
                                        </div>
                                    )}
                                    {/* 背景风景 */}
                                    {prompt.user_background_url && (
                                        <div className="relative w-1/2 h-20 rounded-lg overflow-hidden border border-green-400">
                                            <Image 
                                                src={prompt.user_background_url}
                                                alt="用户背景"
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <span className="absolute top-0 left-0 bg-green-600 text-white text-xs px-1">背景</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* 原始图片与优化图片对比区 */}
                        <div className="flex space-x-2 mb-4">
                            {/* 原始图片 */}
                            {prompt.original_image_url && (
                                <div className="relative w-1/2 h-36 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"> 
                                    <Image
                                        src={prompt.original_image_url}
                                        alt={`${prompt.title} - 原始`}
                                        fill
                                        sizes="33vw"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs px-1 rounded-tl-lg">原始图</span>
                                </div>
                            )}

                            {/* 优化后图片 (如果存在) */}
                            {prompt.optimized_image_url ? (
                                <div className="relative w-1/2 h-36 rounded-lg overflow-hidden border-2 border-green-500"> 
                                    <Image
                                        src={prompt.optimized_image_url}
                                        alt={`${prompt.title} - 优化`}
                                        fill
                                        sizes="33vw"
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <span className="absolute bottom-0 right-0 bg-green-600 text-white text-xs px-1 rounded-tl-lg">优化图</span>
                                </div>
                            ) : (
                                // 优化图片占位符
                                <div className="w-1/2 h-36 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400 text-xs text-gray-500">
                                    等待优化图片
                                </div>
                            )}
                        </div>
                        
                        {/* 提示词对比区 */}
                        <div className="flex-grow">
                            <h3 className="font-semibold text-gray-800 mt-2">原始提示词:</h3>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-2 p-2 bg-yellow-50 rounded-md border">{prompt.content}</p>

                            <h3 className="font-semibold text-gray-800 mt-2">优化后提示词:</h3>
                            {prompt.optimized_prompt ? (
                                <p className="text-green-700 text-sm line-clamp-3 p-2 bg-green-50 rounded-md border border-green-200">{prompt.optimized_prompt}</p>
                            ) : (
                                <p className="text-gray-500 text-sm italic p-2 bg-gray-50 rounded-md border">暂无优化提示词。</p>
                            )}
                        </div>

                        {/* 复制按钮区 */}
                        <div className="mt-4 flex space-x-2">
                            {/* 复制优化提示词 */}
                            <CopyButton
                                textToCopy={prompt.optimized_prompt || prompt.content} 
                                label="复制优化提示词"
                                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                            />
                            
                            {/* 复制原始提示词 */}
                            <CopyButton
                                textToCopy={prompt.content} 
                                label="复制原始提示词"
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                            />
                        </div>
                    </div>
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
            {!hasMore && prompts.length > 0 && (
                 <p className="text-center mt-12 text-gray-500">已加载所有 {prompts.length} 条数据。</p>
            )}
            {prompts.length === 0 && !isLoading && (
                 <p className="text-center mt-12 text-gray-500">数据库中没有数据。</p>
            )}
        </>
    );
}