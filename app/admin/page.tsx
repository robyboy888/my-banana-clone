import { supabaseServiceRole } from '@/lib/supabaseService';
import AdminRecordList from '@/components/AdminRecordList';

export default async function AdminPage() {
  // 1. 在服务端使用 Service Role 密钥直接获取数据
  const { data, error } = await supabaseServiceRole
    .from('prompts')
    .select('*')
    .order('id', { ascending: false });

  // 2. 数据库连接错误处理
  if (error) {
    return (
      <div className="p-10 text-center min-h-screen bg-slate-50">
        <div className="bg-white p-6 rounded-2xl shadow-sm inline-block border border-red-100">
          <h1 className="text-red-500 font-bold mb-2">数据库连接失败</h1>
          <p className="text-xs text-slate-400 font-mono">{error.message}</p>
        </div>
      </div>
    );
  }

  // 3. 将数据作为 Props 传给客户端组件，由其负责搜索和显示
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <AdminRecordList initialPrompts={data || []} />
      </div>
    </div>
  );
}