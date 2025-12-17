import { supabaseServiceRole } from '@/lib/supabaseService';
import AdminRecordList from '@/components/AdminRecordList';

// 1. 定义服务端组件（注意：没有 'use client'）
// 这解决了 "Module not found: Can't resolve '@/lib/supabaseServer'" 的路径问题
export default async function AdminPage() {
  
  // 2. 直接在服务端获取数据，这是最快、最安全的方式
  // 使用你现有的 supabaseServiceRole 配置文件
  const { data, error } = await supabaseServiceRole
    .from('prompts')
    .select('*')
    .order('id', { ascending: false });

  // 3. 错误兜底处理
  if (error) {
    return (
      <div className="p-10 text-center min-h-screen bg-slate-50">
        <div className="bg-white p-6 rounded-2xl shadow-sm inline-block border border-red-100">
          <h1 className="text-red-500 font-bold mb-2">数据库连接失败</h1>
          <p className="text-xs text-slate-400 font-mono">{error.message}</p>
          <p className="mt-4 text-sm text-slate-500">请检查 Vercel 环境变量 SUPABASE_SERVICE_ROLE_KEY 是否配置</p>
        </div>
      </div>
    );
  }

  // 4. 将数据传递给客户端组件 AdminRecordList
  // AdminRecordList 负责 UI 渲染和前端搜索过滤
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <AdminRecordList initialPrompts={data || []} />
      </div>
    </div>
  );
}