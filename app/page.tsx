// app/page.tsx
export const revalidate = 0; 

import { supabase } from '@/lib/supabase'
import Image from 'next/image'; 

// Next.js 14 中，获取数据可以直接在 Server Component 中进行
async function getPrompts() {
  const { data, error } = await supabase
    .from('prompts')
    .select('*') // 确保选择所有字段，包括新增的 user_portrait_url 和 user_background_url
    .order('created_at', { ascending: false })
    .limit(50) 

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
      <h1 className="text-4xl font-bold mb-8">Prompt 优化与对比</h1>
      
      {/* 搜索组件占位符 */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <input 
          type="text" 
          placeholder="搜索 Prompt..." 
          className="w-full p-3 rounded-lg border border-gray-300" 
        />
      </div>

      {/* 瀑布流/网格展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {prompts.map((prompt) => (
          <div 
            key={prompt.id} 
            className="bg-white p-6 rounded-xl shadow-xl transition duration-300 border border-yellow-300 flex flex-col"
          >
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">{prompt.title}</h2>

            {/* 💥 新增区域：用户提供的参考图片 (肖像 + 背景) */}
            {(prompt.user_portrait_url || prompt.user_background_url) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-blue-700 mb-2 text-sm">用户参考输入：</h3>
                    <div className="flex space-x-2">
                        {/* 个人肖像 */}
                        {prompt.user_portrait_url && (
                            <div className="relative w-1/2 h-20 rounded-lg overflow-hidden border border-red-400">
                                <Image 
                                    src={prompt.user_portrait_url}
                                    alt="用户肖像"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                <span className="absolute top-0 left-0 bg-red-600 text-white text-xs px-1">肖像</span>
                            </div>
                        )}
                        {/* 背景风景 */}
                        {prompt.user_background_url && (
                            <div className="relative w-1/2 h-20 rounded-lg overflow-hidden border border-green-400">
                                <Image 
                                    src={prompt.user_background_url}
                                    alt="用户背景"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                <span className="absolute top-0 left-0 bg-green-600 text-white text-xs px-1">背景</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* 原始图片与优化图片对比区 */}
            <div className="flex space-x-2 mb-4">
              
              {/* 原始图片 */}
              {prompt.original_image_url && (
                <div className="relative w-1/2 h-36 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"> 
                  <Image
                    src={prompt.original_image_url}
                    alt={`${prompt.title} - 原始`}
                    fill
                    sizes="33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs px-1 rounded-tl-lg">原始图</span>
                </div>
              )}

              {/* 优化后图片 (如果存在) */}
              {prompt.optimized_image_url ? (
                <div className="relative w-1/2 h-36 rounded-lg overflow-hidden border-2 border-green-500"> 
                  <Image
                    src={prompt.optimized_image_url}
                    alt={`${prompt.title} - 优化`}
                    fill
                    sizes="33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <span className="absolute bottom-0 right-0 bg-green-600 text-white text-xs px-1 rounded-tl-lg">优化图</span>
                </div>
              ) : (
                // 优化图片占位符
                <div className="w-1/2 h-36 bg-gray-100 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400 text-xs text-gray-500">
                    等待优化图片
                </div>
              )}
            </div>
            
            {/* 提示词对比区 */}
            <div className="flex-grow">
                <h3 className="font-semibold text-gray-800 mt-2">原始提示词:</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-2 p-2 bg-yellow-50 rounded-md border">{prompt.content}</p>

                <h3 className="font-semibold text-gray-800 mt-2">优化后提示词:</h3>
                {prompt.optimized_prompt ? (
                    <p className="text-green-700 text-sm line-clamp-3 p-2 bg-green-50 rounded-md border border-green-200">{prompt.optimized_prompt}</p>
                ) : (
                    <p className="text-gray-500 text-sm italic p-2 bg-gray-50 rounded-md border">暂无优化提示词。</p>
                )}
            </div>

            {/* 复制按钮 */}
            <button className="mt-4 w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition">
              复制优化提示词
            </button>
          </div>
        ))}
        {prompts.length === 0 && <p className="text-gray-500">数据库中没有数据。</p>}
      </div>
    </div>
  )
}