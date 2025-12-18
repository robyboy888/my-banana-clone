'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import AdminPromptList from '@/components/AdminPromptList';

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // 初始化适用于客户端的 Supabase SSR 客户端
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkUser = async () => {
            try {
                // 获取当前会话
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error || !session) {
                    // 无会话则跳转登录
                    router.push('/admin/login');
                } else {
                    setUser(session.user);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('认证检查失败:', err);
                router.push('/admin/login');
            }
        };

        checkUser();
    }, [router, supabase.auth]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">验证管理员身份中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部管理栏 */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-900">控制面板</h1>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">
                            ADMIN
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden md:inline">
                            {user?.email}
                        </span>
                        <button 
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-700 transition"
                        >
                            退出
                        </button>
                    </div>
                </div>
            </header>

            {/* 主内容区 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AdminPromptList />
            </main>
        </div>
    );
}