// components/ListItem.tsx (Client Component)

'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import CopyButton from './CopyButton'; // 确保路径正确

interface Prompt {
    // ... (Prompt 接口定义) ...
    id: number;
    title: string;
    content: string;
    optimized_image_url?: string; // 用于悬浮缩略图
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
            
            {/* 💥 悬浮缩略图 (如果有优化图) */}
            {isHovered && prompt.optimized_image_url && (
                <div className="absolute right-full top-0 mr-4 z-50 p-1 bg-white border border-gray-300 shadow-xl rounded-lg w-36 h-36">
                    <Image
                        src={prompt.optimized_image_url}
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