// /app/admin/edit/page.tsx
import { supabase } from '@/lib/supabase'; // 确保路径对应 src/lib/supabase.ts
import { redirect } from 'next/navigation';
import EditPromptForm from '@/components/EditPromptForm'; 

export default async function EditPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const id = searchParams.id;

  if (!id) {
    redirect('/admin'); 
  }

  // 使用你提供的导出的 supabase 实例
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !prompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-xl font-bold text-gray-800">未找到该记录</h2>
          <p className="text-gray-500 mt-2">ID: {id}</p>
          <a href="/admin" className="inline-block mt-4 text-blue-600 font-bold">返回列表</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">编辑内容</h1>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
           <EditPromptForm initialData={prompt} />
        </div>
      </div>
    </div>
  );
}