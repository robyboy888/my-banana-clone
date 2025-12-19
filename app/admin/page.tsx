'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// ⚠️ 注意这里：统一引用我们修改后的那个 lib 文件
import { supabase } from '@/src/lib/supabase'; 
import AdminRecordList from '@/src/components/AdminRecordList';
import { Loader2, Plus, LayoutDashboard } from 'lucide-react'; 

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [prompts, setPrompts] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            // 使用统一的 supabase 实例获取 Session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                console.log("未检测到有效会话，跳转登录...");
                router.push('/admin/login');
                return;
            }

            setUser(session.user);

            // 获取初始数据
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
    }, [router]); // 移除了对 supabase 的依赖，因为它是外部引入的单例

    // 加载态 UI 升级：适配暗黑模式
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 dark:text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
                <p className="text-sm font-black uppercase tracking-widest animate-pulse">正在同步数据...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 顶部的标题区域 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                            Prompt Assets
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            当前管理员: <span className="text-indigo-600 dark:text-indigo-400">{user?.email}</span>
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => router.push('/admin/new')}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        NEW PROMPT
                    </button>
                </div>
            </div>

            {/* 核心列表组件容器 */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                <AdminRecordList initialPrompts={prompts} />
            </div>
        </div>
    );
}