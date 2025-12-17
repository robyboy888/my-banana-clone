'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CopyButton from './CopyButton';
import { useRouter } from 'next/navigation';

interface ListItemProps {
    prompt: any;
    index: number;
    isAdmin?: boolean;
}

const isExternalUrl = (url: string | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('supabase.co');
};

export default function ListItem({ prompt, index, isAdmin = false }: ListItemProps) {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const previewImageUrl = prompt.original_image_url;

    const handleDelete = async () => {
        if (!confirm('🚨 确定要永久删除这条提示词吗？')) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/delete?id=${prompt.id}`, { method: 'DELETE' });
            if (res.ok) { alert('删除成功'); router.refresh(); }
            else throw new Error('删除失败');
        } catch (error: any) { alert(error.message); } 
        finally { setIsDeleting(false); }
    };

    return (
        // max-w-[95%] 减少留白
        <div className="flex items-center space-x-8 border-b border-gray-100 py-6 max-w-[95%] mx-auto px-4 hover:bg-gray-50 transition-all relative">
            
            {/* 1. 行号 & 作者头像 */}
            <div className="flex items-center space-x-4 flex-shrink-0 w-28">
                <span className="text-xl font-black text-gray-200">{String(index).padStart(2, '0')}</span>
                {prompt.user_portrait_url && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                        <Image 
                            src={prompt.user_portrait_url} 
                            width={40} height={40} 
                            alt="author" 
                            className="object-cover"
                            unoptimized={isExternalUrl(prompt.user_portrait_url)}
                        />
                    </div>
                )}
            </div>

            {/* 2. 内容区 - 预览图左侧悬浮 */}
            <div 
                className="flex-1 min-w-0"
                onMouseEnter={() => previewImageUrl && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{prompt.title}</h3>
                    {prompt.source_x_account && (
                        <a 
                            href={`https://x.com/${prompt.source_x_account.replace('@', '')}`} 
                            target="_blank" 
                            className="text-gray-400 hover:text-blue-400 transition"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                    )}
                </div>
                <p className="line-clamp-1 text-gray-500 text-sm">{prompt.content}</p>

                {/* 悬浮图：显示在内容下方左侧 */}
                {isHovered && previewImageUrl && (
                    <div className="absolute left-32 top-16 z-50 p-2 bg-white border border-gray-200 rounded-2xl shadow-2xl w-72">
                        <div className="relative aspect-video overflow-hidden rounded-xl">
                            <Image 
                                src={previewImageUrl} 
                                fill 
                                alt="preview" 
                                className="object-cover" 
                                unoptimized={isExternalUrl(previewImageUrl)} 
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 3. 按钮组 */}
            <div className="flex items-center space-x-6 flex-shrink-0">
                <div className="flex flex-col space-y-2 w-36">
                    <CopyButton 
                        textToCopy={prompt.optimized_prompt || prompt.content} 
                        label="Copy Optimized" 
                        className="bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-xl text-[10px] font-bold transition shadow-sm"
                    />
                    <CopyButton 
                        textToCopy={prompt.content} 
                        label="Copy Original" 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-500 py-2 rounded-xl text-[10px] font-bold transition"
                    />
                </div>

                {isAdmin && (
                    <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
                        <Link 
                            href={`/admin/edit/${prompt.id}`} 
                            className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100 transition"
                        >
                            编辑
                        </Link>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition disabled:opacity-50"
                        >
                            {isDeleting ? '...' : '删除'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}