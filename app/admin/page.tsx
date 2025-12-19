'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// 统一引用 lib 下的单例，确保 Session 在中间件和页面间同步
import { supabase } from '@/src/lib/supabase'; 
import AdminRecordList from '@/src/components/AdminRecordList';
import { Loader2, Plus, LayoutDashboard, ShieldCheck } from 'lucide-react'; 

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [prompts, setPrompts] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            // 1. 获取用户信息
            // 注意：middleware 已经处理了跳转逻辑，这里主要用于 UI 展示 (如显示邮箱)
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                // 如果中间件因某种原因漏掉，这里作为二次保险
                router.push('/admin/login');
                return;
            }
            setUser(user);

            // 2. 获取数据记录
            const { data, error } = await supabase
                .from('prompts')
                .select('*')
                .order('updated_at', { ascending: false }); 
            
            if (!error) {
                setPrompts(data || []);
            }
            
            setIsLoading(false);
        };
        init();
    }, [router]);

    // 加载态：采用全屏居中的精致动画
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 dark:text-slate-400">
                <div className="relative mb-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    <ShieldCheck className="w-4 h-4 text-indigo-400 absolute top-0 right-0 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                    Authenticating Session...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* 顶部的标题区域 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
                            Admin <span className="text-indigo-600">Workspace</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Signed in as: <span className="text-slate-600 dark:text-slate-200">{user?.email}</span>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.push('/admin/new')}
                        className="group flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        ADD NEW PROMPT
                    </button>
                </div>
            </div>

            {/* 列表容器：利用阴影和边框增加层级感 */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all duration-500">
                <AdminRecordList initialPrompts={prompts} />
            </div>
        </div>
    );
}