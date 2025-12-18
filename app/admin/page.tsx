'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import AdminRecordList from '@/src/components/AdminRecordList';

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [prompts, setPrompts] = useState<any[]>([]); // 存储数据
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const initAdmin = async () => {
            try {
                // 1. 检查身份
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/admin/login');
                    return;
                }
                setUser(session.user);

                // 2. 获取初始数据 (解决 Type error)
                const { data, error } = await supabase
                    .from('prompts')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (!error) {
                    setPrompts(data || []);
                }
                
                setIsLoading(false);
            } catch (err) {
                console.error('初始化失败:', err);
                router.push('/admin/login');
            }
        };

        initAdmin();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">正在加载数据...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                <h1 className="text-xl font-bold">控制面板</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{user?.email}</span>
                    <button onClick={handleLogout} className="text-sm text-red-600 font-medium">退出</button>
                </div>
            </header>
            <main className="p-8">
                {/* 传入获取到的 prompts 数据，解决类型报错 */}
                <AdminRecordList initialPrompts={prompts} />
            </main>
        </div>
    );
}