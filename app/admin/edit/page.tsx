// app/admin/edit/page.tsx
import { notFound } from 'next/navigation';
import ClientEditFormWrapper from '@/components/ClientEditFormWrapper'; // 💥 假设这是您表单组件的路径

// 强制动态渲染，防止 Vercel 在部署时缓存路由
export const dynamic = 'force-dynamic';

// 接口定义：使用 searchParams 来接收 URL 查询参数
interface EditPageProps {
    searchParams: {
        id?: string; // 我们期望的 URL 格式是 /admin/edit?id=123
    };
}

export default async function EditPromptPage({ searchParams }: EditPageProps) {
    
    // 1. 从查询参数中获取 ID
    const promptId = searchParams.id;
    
    // 2. 检查 ID 的有效性
    // 确保 ID 存在且是数字
    if (!promptId || isNaN(parseInt(promptId))) {
        // 如果 ID 无效，抛出 notFound，Next.js 会渲染 404 页面
        notFound();
    }
    
    // 3. (可选但推荐) 确保 ID 是一个字符串
    const promptIdString = String(promptId);

    // 4. ClientEditFormWrapper 负责获取数据和渲染表单
    // 我们将 ID 传递给客户端组件
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">编辑提示词</h1>
            {/* 将从 URL 获取的 ID 传递给客户端组件 */}
            <ClientEditFormWrapper promptId={promptIdString} />
        </div>
    );
}

/**
 * 💥 前端链接修改提示:
 * * 您的列表页或任何跳转到编辑页面的地方，链接必须从
 * * ❌ 错误: <Link href={`/admin/${id}`}></Link>
 * * 更改为：
 * * ✅ 正确: <Link href={`/admin/edit?id=${id}`}></Link>
 */