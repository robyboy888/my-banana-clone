// components/AdminRecordList.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

interface PromptListItem {
    id: number;
    title: string;
    original_image_url: string;
    created_at: string;
}

interface AdminRecordListProps {
    prompts: PromptListItem[];
}

export default function AdminRecordList({ prompts }: AdminRecordListProps) {
    
    // TODO: 未来可以在这里实现删除逻辑

    if (prompts.length === 0) {
        return <p className="text-center text-gray-500 mt-10">目前没有记录。</p>;
    }

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
                {prompts.map((prompt) => (
                    <li key={prompt.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                        
                        {/* 记录信息 */}
                        <div className="flex items-center space-x-4">
                            {/* 缩略图 */}
                            {prompt.original_image_url && (
                                <Image 
                                    src={prompt.original_image_url} 
                                    alt={prompt.title} 
                                    width={64} 
                                    height={64} 
                                    className="object-cover rounded-md flex-shrink-0"
                                    unoptimized // 避免 Vercel 优化器找不到远程图片
                                />
                            )}
                            
                            {/* 标题和时间 */}
                            <div>
                                <p className="text-lg font-medium text-gray-900">{prompt.title}</p>
                                <p className="text-sm text-gray-500">ID: {prompt.id}</p>
                                <p className="text-sm text-gray-500">创建于: {new Date(prompt.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* 💥 编辑按钮 (取代复制按钮) */}
                        <Link 
                            href={`/admin/${prompt.id}`} // 动态路由到编辑页面
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                            编辑 &rarr;
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}