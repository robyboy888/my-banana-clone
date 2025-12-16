// /app/admin/page.tsx
import { supabaseServiceRole } from '@/lib/supabaseService';
import AdminRecordList from '@/components/AdminRecordList'; 
import { Prompt } from '@/types/prompt';

// ----------------------------------------------------
// 💥 修复 P3：强制动态渲染，防止 Vercel 缓存
// ----------------------------------------------------
export const dynamic = 'force-dynamic'; 

export default async function AdminPage() {
    
    // 1. 获取数据
    const { data: prompts, error } = await supabaseServiceRole
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

    // 2. 错误处理
    if (error) {
        console.error('Failed to fetch prompts (AdminPage):', error);
        // 如果数据获取失败，我们提供一个明确的错误信息
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">管理后台</h1>
                <p className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    数据加载失败，错误信息: {error.message || '未知数据库错误'}
                </p>
            </div>
        );
    }

    // 3. 渲染列表组件
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">提示词管理</h1>
            <AdminRecordList initialPrompts={prompts as Prompt[] || []} />
        </div>
    );
}