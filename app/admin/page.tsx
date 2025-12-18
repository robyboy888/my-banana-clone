'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import AdminRecordList from '@/src/components/AdminRecordList';

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [prompts, setPrompts] = useState<any[]>([]);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin/login');
                return;
            }
            setUser(session.user);

            // 获取初始数据传给子组件
			const { data } = await supabase
				.from('prompts')
				.select('*')
				.order('updated_at', { ascending: false }); // 最近修改的排第一
            
            setPrompts(data || []);
            setIsLoading(false);
        };
        init();
    }, [router, supabase]);

    if (isLoading) return <div className="p-20 text-center">正在加载管理员后台...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                <h1 className="text-xl font-bold">管理后台</h1>
                <div className="flex items-center gap-4 text-sm">
                    <span>{user?.email}</span>
                    <button onClick={() => supabase.auth.signOut().then(() => router.push('/admin/login'))} className="text-red-500">退出</button>
                </div>
            </header>
            <main className="p-8">
                <AdminRecordList initialPrompts={prompts} />
            </main>
        </div>
    );
}