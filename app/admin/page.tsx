'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
// 注意：这里要指向 src/components 且名称与你截图一致
import AdminRecordList from '@/src/components/AdminRecordList';

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session) {
                    router.push('/admin/login');
                } else {
                    setUser(session.user);
                    setIsLoading(false);
                }
            } catch (err) {
                router.push('/admin/login');
            }
        };
        checkUser();
    }, [router, supabase.auth]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">验证中...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                <h1 className="text-xl font-bold">控制面板</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{user?.email}</span>
                    <button onClick={handleLogout} className="text-sm text-red-600">退出</button>
                </div>
            </header>
            <main className="p-8">
                <AdminRecordList />
            </main>
        </div>
    );
}