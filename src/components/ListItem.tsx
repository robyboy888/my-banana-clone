'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import CopyButton from './CopyButton'; 

// 确保这里的 Prompt 接口包含所有需要的字段
interface Prompt {
    id: number;
    title: string;
    content: string; 
    
    // 原始图片 URL (用于悬浮显示)
    original_image_url: string; 

    // 优化提示词 (用于复制)
    optimized_prompt?: string; 
    
    // 尽管我们使用 original_image_url，但保持 optimized_image_url 以防未来切换
    optimized_image_url?: string; 
}

// 💥 修正组件 props 类型，添加 index
export default function ListItem({ prompt, index }: { prompt: Prompt, index: number }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition border border-gray-200 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 💥 行号字段 */}
            <div className="flex-shrink-0 text-xl font-mono text-gray-500 mr-4 w-10 text-right">
                {index}.
            </div>

            {/* 中间区域：Title 和 Content */}
            <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-lg text-yellow-700 truncate">{prompt.title}</h3>
                <p className="text-gray-600 text-sm truncate line-clamp-1">{prompt.content}</p>
            </div>

            {/* 右侧：复制按钮 */}
            <CopyButton
                textToCopy={prompt.optimized_prompt || prompt.content} 
                label="复制"
                className="flex-shrink-0 bg-green-500 text-white py-1 px-3 rounded-md text-sm hover:bg-green-600 transition"
            />
            
            {/* 悬浮缩略图 (如果鼠标悬浮且有原始图片 URL) */}
            {isHovered && prompt.original_image_url && (
                <div 
                    // 提升 z-index 确保图片在最顶层显示
                    className="absolute right-full top-0 mr-4 z-[999] p-1 bg-white border border-gray-300 shadow-xl rounded-lg w-36 h-36"
                >
                    <Image
                        // 使用 original_image_url
                        src={prompt.original_image_url}
                        alt={`${prompt.title} 缩略图`}
                        fill
                        sizes="10vw"
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                    />
                </div>
            )}
        </div>
    );
}