// app/page.tsx
export const revalidate = 0; 

import { supabase } from '@/lib/supabase'
import Image from 'next/image'; 
// 💥 新增：引入客户端复制按钮组件
// 假设 CopyButton.tsx 在 src/components 目录下
import CopyButton from '@/components/CopyButton';

// ... [getPrompts 函数和 HomePage 组件的开始部分保持不变] ...

export default async function HomePage() {
  const prompts = await getPrompts()

  return (
    // ... [布局代码保持不变] ...
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {prompts.map((prompt) => (
          <div 
            key={prompt.id} 
            className="bg-white p-6 rounded-xl shadow-xl transition duration-300 border border-yellow-300 flex flex-col"
          >
            {/* ... [图片和提示词对比区保持不变] ... */}
            
            <div className="flex-grow">
                {/* ... [提示词显示区保持不变] ... */}
                <h3 className="font-semibold text-gray-800 mt-2">原始提示词:</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-2 p-2 bg-yellow-50 rounded-md border">{prompt.content}</p>

                <h3 className="font-semibold text-gray-800 mt-2">优化后提示词:</h3>
                {prompt.optimized_prompt ? (
                    <p className="text-green-700 text-sm line-clamp-3 p-2 bg-green-50 rounded-md border border-green-200">{prompt.optimized_prompt}</p>
                ) : (
                    <p className="text-gray-500 text-sm italic p-2 bg-gray-50 rounded-md border">暂无优化提示词。</p>
                )}
            </div>

            {/* 💥 复制按钮区：使用 CopyButton 组件 💥 */}
            <div className="mt-4 flex space-x-2">
                {/* 1. 复制优化提示词 */}
                <CopyButton
                    textToCopy={prompt.optimized_prompt || prompt.content} // 如果优化词为空，复制原始词
                    label="复制优化提示词"
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
                />
                
                {/* 2. 复制原始提示词 */}
                <CopyButton
                    textToCopy={prompt.content} // 复制原始提示词
                    label="复制原始提示词"
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
                />
            </div>
            {/* ---------------------------------- */}
          </div>
        ))}
        {prompts.length === 0 && <p className="text-gray-500">数据库中没有数据。</p>}
      </div>
    </div>
  )
}