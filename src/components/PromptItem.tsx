// components/PromptItem.tsx (Client Component)

'use client';
import Image from 'next/image';
import CopyButton from './CopyButton'; // 确保路径正确
import React from 'react';

interface Prompt {
    // ... (Prompt 接口定义, 应该与 PromptList 中的定义一致) ...
    id: number;
    title: string;
    content: string;
    // ...
}

export default function PromptItem({ prompt }: { prompt: Prompt }) {
    // 💥 将原 page.tsx 中所有渲染单个 prompt 的 JSX 粘贴到这里
    return (
        <div 
            key={prompt.id} 
            className="bg-white p-6 rounded-xl shadow-xl transition duration-300 border border-yellow-300 flex flex-col"
        >
            {/* 💥 粘贴原始 page.tsx 中所有的 <h2 className="text-2xl... 和对比区、复制按钮等 JSX 逻辑 */}
            {/* ... 大约 150 行代码 ... */}
        </div>
    );
}