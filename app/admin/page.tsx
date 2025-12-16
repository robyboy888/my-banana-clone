// /app/admin/page.tsx
import { supabaseServiceRole } from '@/lib/supabaseService';
import AdminRecordList from '@/components/AdminRecordList'; // 导入正确的列表组件
import { Prompt } from '@/types/prompt';

// 强制 Vercel 每次请求都运行该函数，防止静态缓存 (P3 修复)
export const dynamic = 'force-dynamic'; 

export default async function AdminPage() {
    
    // 1. 获取数据
    const { data: prompts, error } = await supabaseServiceRole
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch prompts:', error);
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">管理后台</h1>
                <p className="text-red-600">加载数据失败: {error.message}</p>
            </div>
        );
    }

    // 2. 渲染列表组件，传递数据
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">提示词管理</h1>
            {/* 传递 initialPrompts，AdminRecordList 组件内需要包含新增/视图切换逻辑 */}
            <AdminRecordList initialPrompts={prompts as Prompt[] || []} />
        </div>
    );
}