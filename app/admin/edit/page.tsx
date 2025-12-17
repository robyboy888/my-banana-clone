// /app/admin/edit/page.tsx
import { createClient } from '@/utils/supabase/server'; // 请根据你项目实际的 Supabase 初始化路径修改
import { redirect } from 'next/navigation';
import EditPromptForm from '@/components/EditPromptForm'; 

export default async function EditPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id;

  // 1. 如果 URL 中没有 id，直接跳回管理列表页
  if (!id) {
    redirect('/admin'); 
  }

  const supabase = createClient();

  // 2. 从数据库获取该条 Prompt 的完整数据
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  // 3. 如果报错或数据不存在，显示错误信息
  if (error || !prompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <h1 className="text-4xl mb-4">🔍</h1>
          <h2 className="text-2xl font-black text-gray-800">未找到数据</h2>
          <p className="text-gray-500 mt-2">无法找到 ID 为 {id} 的提示词内容，可能已被删除。</p>
          <a href="/admin" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">
            返回列表
          </a>
        </div>
      </div>
    );
  }

  // 4. 正常获取到数据后，渲染页面容器并加载表单
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">编辑提示词</h1>
            <p className="text-gray-500 mt-1">正在修改记录 ID: <span className="font-mono text-blue-600">{id}</span></p>
          </div>
          <a href="/admin" className="text-sm font-bold text-gray-400 hover:text-gray-600">
            ← 取消并返回
          </a>
        </div>

        {/* 将数据传递给客户端表单组件 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
           <EditPromptForm initialData={prompt} />
        </div>
      </div>
    </div>
  );
}