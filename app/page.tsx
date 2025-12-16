// app/page.tsx
// Server Component (默认)

// 禁用缓存，确保每次请求都从 Supabase 获取最新数据
export const revalidate = 0; 

import { supabase } from '@/lib/supabase'; // 确保您的 Supabase 客户端配置路径正确
import PromptList from '@/components/PromptList'; // 导入 Client Component

// 定义首次加载的数据量
const PAGE_SIZE = 50; 

/**
 * 异步函数：从 Supabase 获取初始 Prompt 数据
 * 在服务器端执行
 */
async function getPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('*') 
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE) 

  if (error) {
    // 在 Vercel 部署日志中打印错误
    console.error("Error fetching initial data:", error);
    return [];
  }
  
  if (data) {
      // 诊断日志 (仅在 Vercel 构建或运行时可见)
      console.log(`[DIAGNOSTIC] Initial prompts loaded: ${data.length} out of ${PAGE_SIZE}`);
  }
  
  return data || [];
}

/**
 * 主页面组件 (Server Component)
 * 负责获取数据并传递给 Client Component
 */
export default async function HomePage() {
  // 1. 获取初始 Prompt 数据
  const initialPrompts = await getPrompts();

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

      {/* 2. 核心：渲染 Client Component 并传递初始数据 */}
      {/* PromptList 包含瀑布流、展示逻辑和分页交互（按钮/API调用） */}
      <PromptList initialPrompts={initialPrompts} /> 

    </div>
  );
}