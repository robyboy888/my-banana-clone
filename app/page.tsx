// app/page.tsx - 修正版本

export const revalidate = 0; 

import { supabase } from '@/lib/supabase'
// 移除不必要的 Image 和 CopyButton 导入，因为它们应该在 PromptList 中处理
import PromptList from '@/components/PromptList'; // 👈 确保导入

const PAGE_SIZE = 50; 
// ... (getPrompts 函数保持不变) ...

export default async function HomePage() {
  const initialPrompts = await getPrompts() // 👈 变量名改为 initialPrompts

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Prompt 优化与对比</h1>
      
      {/* 搜索组件占位符（保持不变） */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <input 
          type="text" 
          placeholder="搜索 Prompt..." 
          className="w-full p-3 rounded-lg border border-gray-300" 
        />
      </div>

      {/* 💥 核心修正：在这里渲染 Client Component，并传递数据 */}
      <PromptList initialPrompts={initialPrompts} /> 

      {/* 移除原先所有重复的网格和 Prompt 渲染逻辑 */}

    </div>
  )
}