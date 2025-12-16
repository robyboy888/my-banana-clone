// components/ListItem.tsx

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import CopyButton from './CopyButton'; 

// 确保这里的 Prompt 接口包含 original_image_url
interface Prompt {
    id: number;
    title: string;
    content: string; 
    
    // 💥 关键修正 1: 确保原始图片 URL 存在且是必需的 (根据您 getPrompts 函数的实现，它通常是必需的)
    original_image_url: string; 

    optimized_prompt?: string; 
    optimized_image_url?: string; 
}

export default function ListItem({ prompt }: { prompt: Prompt }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition border border-gray-200 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 左侧：Title 和 Content */}
            <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-lg text-yellow-700 truncate">{prompt.title}</h3>
                <p className="text-gray-600 text-sm truncate line-clamp-1">{prompt.content}</p>
            </div>

            {/* 右侧：复制按钮 */}
            <CopyButton
                textToCopy={prompt.optimized_prompt || prompt.content} 
                label="复制"
                className="bg-green-500 text-white py-1 px-3 rounded-md text-sm hover:bg-green-600 transition"
            />
            
            {/* 悬浮缩略图 (如果鼠标悬浮且有原始图片 URL) */}
            {/* 💥 关键修正 2: 更改 URL 来源为 original_image_url */}
            {isHovered && prompt.original_image_url && (
                <div 
                    // 提升 z-index 确保图片在最顶层显示
                    className="absolute right-full top-0 mr-4 z-[999] p-1 bg-white border border-gray-300 shadow-xl rounded-lg w-36 h-36"
                >
                    <Image
                        // 💥 关键修正 3: 使用 original_image_url
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