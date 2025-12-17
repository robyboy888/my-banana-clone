// /app/admin/edit/page.tsx
import { supabase } from '@/lib/supabase';
import EditPromptForm from '@/components/EditPromptForm'; 

// 在 Next.js 15 中，searchParams 是一个 Promise
export default async function EditPage(props: {
  searchParams: Promise<{ id?: string }>; 
}) {
  // 1. 必须 await searchParams 才能拿到真正的参数对象
  const searchParams = await props.searchParams;
  const id = searchParams.id;

  // 2. 调试诊断：如果没有 ID，显示提示而不是直接跳走
  if (!id) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">参数解析失败</h1>
        <p className="text-gray-500">URL 栏有 id，但服务端组件未正确读取到值。</p>
        <a href="/admin" className="text-blue-600 underline">返回列表</a>
      </div>
    );
  }

  // 3. 从数据库获取数据
  // 注意：如果 id 在数据库是数字类型，Supabase 客户端会自动处理字符串到数字的转换
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  // 4. 诊断：如果数据库返回错误
  if (error || !prompt) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold text-orange-500">数据库查询无结果</h1>
        <p className="text-gray-500">查询 ID: <span className="font-mono font-bold text-black">{id}</span></p>
        {error && <p className="text-red-400 mt-2 text-sm">错误信息: {error.message}</p>}
        <div className="mt-6 flex justify-center gap-4">
            <a href="/admin" className="text-blue-600 font-bold border border-blue-600 px-4 py-2 rounded">返回管理后台</a>
            <button onClick={() => window.location.reload()} className="bg-gray-100 px-4 py-2 rounded">重试页面</button>
        </div>
      </div>
    );
  }

  // 5. 成功获取数据后渲染
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">编辑内容</h1>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            Record ID: {id}
          </span>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
           <EditPromptForm initialData={prompt} />
        </div>
      </div>
    </div>
  );
}