// app/page.tsx
// 这行代码会告诉 Vercel，每次请求时都重新获取数据，
// 从而禁用默认的静态缓存。
export const revalidate = 0; 

import { supabase } from '@/lib/supabase'
// 💥 新增：引入 Next.js 的 Image 组件
import Image from 'next/image'; 

// Next.js 14 中，获取数据可以直接在 Server Component 中进行
async function getPrompts() {
  // 从 'prompts' 表中选择所有数据，并按创建时间倒序排列
  const { data, error } = await supabase
    .from('prompts')
    .select('*') // 选择所有字段，包括 image_url
    .order('created_at', { ascending: false })
    .limit(50) // 只取前 50 条

  if (error) {
    console.error("Error fetching data:", error)
    return []
  }
  return data
}

export default async function HomePage() {
  const prompts = await getPrompts()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Banana Prompts Clone</h1>
      
      {/* 搜索组件占位符 */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <input 
          type="text" 
          placeholder="搜索 Prompt..." 
          className="w-full p-3 rounded-lg border border-gray-300" 
        />
      </div>

      {/* 瀑布流/网格展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <div 
            key={prompt.id} // 💥 修改：使用 prompt.id 作为 key，因为它通常是唯一的
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-200"
          >
            {/* 💥 核心：图片显示逻辑 💥 */}
            {prompt.image_url && (
              <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden"> 
                <Image
                  src={prompt.image_url}
                  alt={prompt.title || "Prompt Image"}
                  fill // 填充父容器
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // 响应式尺寸优化
                  style={{ objectFit: 'cover' }} // 确保图片覆盖整个区域，可能裁剪边缘
                  priority={false} // 不需要所有图片都优先加载，只有首屏关键图才设为true
                />
              </div>
            )}

            <h2 className="text-xl font-semibold text-yellow-600 mb-2">{prompt.title}</h2>
            <p className="text-gray-700 text-sm line-clamp-4">{prompt.content}</p>
            {/* 这里的复制按钮需要客户端组件实现，我们暂时简化 */}
            <button className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition">
              一键复制
            </button>
          </div>
        ))}
        {prompts.length === 0 && <p className="text-gray-500">数据库中没有数据。</p>}
      </div>
    </div>
  )
}