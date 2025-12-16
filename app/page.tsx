// /app/page.tsx
import { supabaseServiceRole } from '@/lib/supabaseService';
import PromptList from '@/components/PromptList'; 
import { Prompt } from '@/types/prompt'; // 确保 Prompt 类型已导入

// ----------------------------------------------------
// 💥 关键修复：强制动态渲染，禁用 Next.js 缓存
// ----------------------------------------------------
// 这将确保每次访问页面时，都会重新获取最新数据，而不是使用构建时的静态缓存。
export const dynamic = 'force-dynamic'; 


export default async function HomePage() {
    
    // 1. 获取数据 (使用与 Admin 页相同的服务权限客户端，保证权限最高)
    // 注意：如果您的前端列表需要低权限（anon key），请替换为对应的客户端。
    // 但为保证数据加载成功，我们暂用 serviceRole。
    const { data: prompts, error } = await supabaseServiceRole
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

    // 2. 错误处理
    if (error) {
        console.error('Failed to fetch prompts (HomePage):', error);
        // 如果数据获取失败，显示明确的错误信息
        return (
            <div className="p-6 text-center">
                <h1 className="text-3xl font-bold mb-6 text-red-600">数据加载失败</h1>
                <p className="text-lg text-red-500">
                    抱歉，加载提示词列表失败。请检查网络或联系管理员。
                </p>
                <p className="text-sm text-red-400 mt-2">错误详情: {error.message || '未知数据库错误'}</p>
            </div>
        );
    }

    // 3. 渲染列表组件
    return (
        <div className="p-6">
            {/* PromptList 组件应该处理网格/列表视图切换 */}
            <PromptList initialPrompts={prompts as Prompt[] || []} />
        </div>
    );
}