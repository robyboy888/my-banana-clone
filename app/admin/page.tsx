'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import AdminRecordList from '@/src/components/AdminRecordList';
import { Loader2 } from 'lucide-react'; // 引入加载图标

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
                .order('updated_at', { ascending: false }); 
            
            setPrompts(data || []);
            setIsLoading(false);
        };
        init();
    }, [router, supabase]);

    // 加载态 UI 升级：适配暗黑模式并居中
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 dark:text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
                <p className="text-sm font-medium">正在初始化管理后台...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 顶部的欢迎卡片/统计栏，可以根据需要增加 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                        提示词库管理
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        当前登录: <span className="font-mono text-indigo-600 dark:text-indigo-400">{user?.email}</span>
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => router.push('/admin/add')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                        + 新增数据
                    </button>
                </div>
            </div>

            {/* 核心列表组件 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <AdminRecordList initialPrompts={prompts} />
            </div>
        </div>
    );
}