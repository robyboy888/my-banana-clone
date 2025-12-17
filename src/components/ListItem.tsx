// /src/components/ListItem.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CopyButton from './CopyButton';
import { useRouter } from 'next/navigation';

interface ListItemProps {
    prompt: any;
    index: number;
    isAdmin?: boolean; // 新增：控制是否显示管理工具
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

    // 删除逻辑
    const handleDelete = async () => {
        if (!confirm('🚨 确定要永久删除这条提示词吗？此操作不可撤销。')) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/delete?id=${prompt.id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('删除成功');
                router.refresh(); // 刷新页面同步数据
            } else {
                const err = await res.json();
                throw new Error(err.error || '删除请求失败');
            }
        } catch (error: any) {
            alert('错误: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center space-x-12 border-b border-gray-100 py-8 max-w-7xl mx-auto px-8 hover:bg-gray-50 transition-all">
            
            {/* 1. 行号 */}
            <div className="flex-shrink-0 w-12 text-2xl font-black text-gray-200">
                {String(index).padStart(2, '0')}
            </div>

            {/* 2. 内容区 (带预览图逻辑) */}
            <div 
                className="flex-1 min-w-0 relative"
                onMouseEnter={() => previewImageUrl && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <h3 className="text-xl font-bold text-gray-800 truncate mb-3">{prompt.title}</h3>
                
                <div className="flex flex-col space-y-2">
                    <p className="font-bold text-gray-400 text-[10px] uppercase tracking-widest">Original Prompt</p>
                    <p className="line-clamp-2 h-10 text-gray-600 leading-relaxed text-sm">
                        {prompt.content}
                    </p>
                </div>

                {/* 悬浮预览图 */}
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

            {/* 3. 按钮组 */}
            <div className="flex items-center space-x-8 flex-shrink-0">
                
                {/* 复制按钮组 (始终显示) */}
                <div className="flex flex-col space-y-3 w-40">
                    <CopyButton 
                        textToCopy={prompt.optimized_prompt || prompt.content} 
                        label="复制优化提示词" 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg text-[11px] font-bold shadow-sm transition"
                    />
                    <CopyButton 
                        textToCopy={prompt.content} 
                        label="复制原始提示词" 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-500 py-2 rounded-lg text-[11px] font-bold transition"
                    />
                </div>

                {/* 管理员专属工具 (仅在 isAdmin=true 时显示) */}
                {isAdmin && (
                    <div className="flex items-center space-x-4 border-l pl-8 border-gray-100">
                        <Link 
                            href={`/admin/edit/${item.id}`} 
							className="text-indigo-600 hover:text-indigo-900"
                        >
                            编辑
                        </Link>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition disabled:opacity-50"
                        >
                            {isDeleting ? '...' : '删除'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}