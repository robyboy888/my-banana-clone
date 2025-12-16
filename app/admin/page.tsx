// app/admin/page.tsx
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { supabaseServiceRole } from '@/lib/supabaseService'; // 用于获取数据
import AdminRecordList from '@/components/AdminRecordList'; // 新组件：列表显示

// 定义 Prompt 数据的最小结构，用于列表显示
interface PromptListItem {
    id: number;
    title: string;
    original_image_url: string;
    created_at: string;
}

// 💥 /admin 页面现在是 Server Component，负责获取列表数据
export default async function AdminListPage() {
    
    // 1. 从 Supabase 获取所有 Prompt 记录
    const { data: prompts, error } = await supabaseServiceRole
        .from('prompts') // 假设您的表名是 'prompts'
        .select('id, title, original_image_url, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching prompts:', error);
        return (
            <div className="container mx-auto p-8 max-w-6xl">
                <h1 className="text-4xl font-extrabold text-red-600">数据加载错误</h1>
                <p className="mt-4 text-red-500">无法从数据库获取记录，请检查 Supabase 配置和 Service Role Key。</p>
            </div>
        );
    }

    const promptList = (prompts || []) as PromptListItem[];

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-extrabold text-gray-800">Prompt 记录管理</h1>
                <div className="space-x-4">
                    <Link 
                        href="/" 
                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                        &larr; 返回前端列表
                    </Link>
                    {/* 💥 新增按钮：跳转到新增表单路由 */}
                    <Link 
                        href="/admin/new" 
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        + 新增记录
                    </Link>
                </div>
            </div>

            {/* 列表组件，接收数据 */}
            <AdminRecordList prompts={promptList} />
        </div>
    );
}