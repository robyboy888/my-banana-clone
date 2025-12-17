// /src/components/ListItem.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CopyButton from './CopyButton';

interface ListItemProps {
    prompt: any;
    index: number;
}

const isExternalUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('supabase.co');
};

export default function ListItem({ prompt, index }: ListItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const previewImageUrl = prompt.original_image_url;

    return (
        // 💥 样式：超宽布局 max-w-7xl，增加内边距 py-8
        <div className="flex items-center space-x-12 border-b border-gray-100 py-8 max-w-7xl mx-auto px-8 hover:bg-gray-50 transition-all">
            
            {/* 行号 */}
            <div className="flex-shrink-0 w-12 text-2xl font-black text-gray-200">
                {String(index).padStart(2, '0')}
            </div>

            {/* 内容区 */}
            <div 
                className="flex-1 min-w-0 relative"
                onMouseEnter={() => previewImageUrl && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <h3 className="text-xl font-bold text-gray-800 truncate mb-3">{prompt.title}</h3>
                
                <div className="flex flex-col space-y-2">
                    <p className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Original Prompt</p>
                    {/* 文本省略显示 */}
                    <p className="line-clamp-2 h-10 text-gray-600 leading-relaxed text-sm">
                        {prompt.content}
                    </p>
                </div>

                {/* 悬浮预览图定位 */}
                {isHovered && previewImageUrl && (
                    <div className="absolute top-0 z-50 p-3 bg-white border border-gray-200 rounded-2xl shadow-2xl"
                         style={{ left: '100%', marginLeft: '50px', width: '350px' }}>
                        <div className="relative w-full h-52 overflow-hidden rounded-xl bg-gray-50">
                            <Image 
                                src={previewImageUrl} 
                                alt="Preview" 
                                fill 
                                className="object-contain" 
                                unoptimized={isExternalUrl(previewImageUrl)} 
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 按钮组 */}
            <div className="flex items-center space-x-12 flex-shrink-0">
                
                {/* 复制按钮组：垂直间隔加大 */}
                <div className="flex flex-col space-y-4 w-44">
                    <CopyButton 
                        textToCopy={prompt.optimized_prompt || prompt.content} 
                        label="复制优化提示词" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-lg text-xs font-bold shadow-md transition"
                    />
                    <CopyButton 
                        textToCopy={prompt.content} 
                        label="复制原始提示词" 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-500 py-2.5 rounded-lg text-xs font-bold transition"
                    />
                </div>

                {/* 💥 核心修复：根据你的截图目录，路径必须是 /admin/edit 并携带查询参数 id */}
                <Link 
                    href={`/admin/edit?id=${prompt.id}`}
                    className="flex items-center justify-center px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95"
                >
                    编辑内容
                </Link>
            </div>
        </div>
    );
}