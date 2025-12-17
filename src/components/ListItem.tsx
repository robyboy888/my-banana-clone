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
        // 💥 修正：使用了 max-w-7xl 让列表更宽，mx-auto 居中
        <div className="flex items-center space-x-8 border-b border-gray-100 py-6 max-w-7xl mx-auto px-6 hover:bg-gray-50 transition-colors">
            
            {/* 行号 */}
            <div className="flex-shrink-0 w-10 text-xl font-black text-gray-300">
                {String(index).padStart(2, '0')}
            </div>

            {/* 内容区域 */}
            <div 
                className="flex-1 min-w-0 relative group"
                onMouseEnter={() => previewImageUrl && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <h3 className="text-lg font-bold text-gray-800 truncate mb-2 group-hover:text-blue-600 transition-colors">
                    {prompt.title}
                </h3>
                
                <div className="flex flex-col space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Original Prompt</p>
                    <p className="line-clamp-2 text-sm text-gray-600 leading-relaxed">
                        {prompt.content}
                    </p>
                </div>

                {/* 悬浮预览图修复 */}
                {isHovered && previewImageUrl && (
                    <div className="absolute top-0 z-50 p-3 bg-white border border-gray-200 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200"
                         style={{ left: '102%', width: '320px' }}>
                        <div className="relative w-full h-48 overflow-hidden rounded-lg bg-gray-50">
                            <Image 
                                src={previewImageUrl} 
                                alt="Preview" 
                                fill 
                                className="object-contain p-1" 
                                unoptimized={isExternalUrl(previewImageUrl)} 
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">预览图片仅供参考</p>
                    </div>
                )}
            </div>

            {/* 按钮组区域 */}
            {/* 💥 修正：增加按钮组的间距 ml-12，并让编辑按钮单独拉开距离 */}
            <div className="flex items-center space-x-12 flex-shrink-0">
                
                {/* 两个复制按钮 */}
                <div className="flex flex-col space-y-3 w-40">
                    <CopyButton 
                        textToCopy={prompt.optimized_prompt || prompt.content} 
                        label="复制优化提示词" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-xs font-bold transition shadow-sm"
                    />
                    <CopyButton 
                        textToCopy={prompt.content} 
                        label="复制原始提示词" 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-4 rounded-lg text-xs font-bold transition"
                    />
                </div>

                {/* 编辑按钮 - 路径指向 /admin/prompts/[id] */}
                <Link 
                    href={`/admin/prompts/${prompt.id}`}
                    className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 hover:scale-105 transition-all shadow-lg active:scale-95"
                >
                    编辑内容
                </Link>
            </div>
        </div>
    );
}