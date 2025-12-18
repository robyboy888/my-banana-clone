'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 使用你刚才在 Supabase 后台创建的邮箱和密码
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('登录失败: ' + error.message);
            setLoading(false);
        } else {
            // 登录成功，跳转到管理主页
            router.push('/admin');
            router.refresh(); // 强制刷新以更新服务器端的 Cookie 状态
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4">
            <div className="bg-white p-10 rounded-[32px] shadow-2xl w-full max-w-[480px]">
                <h1 className="text-[32px] font-bold text-center text-[#1e293b] mb-10">管理员登录</h1>
                
                <form onSubmit={handleLogin} className="space-y-8">
                    <div>
                        <label className="block text-lg font-semibold text-[#475569] mb-3">邮箱</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-white border border-[#cbd5e1] rounded-2xl focus:ring-4 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none transition-all text-lg"
                            placeholder="输入管理员邮箱"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-lg font-semibold text-[#475569] mb-3">密码</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-white border border-[#cbd5e1] rounded-2xl focus:ring-4 focus:ring-[#6366f1]/20 focus:border-[#6366f1] outline-none transition-all text-lg"
                            placeholder="输入密码"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#6366f1] text-white py-5 rounded-2xl text-xl font-bold hover:bg-[#4f46e5] active:scale-[0.98] transition-all shadow-lg shadow-[#6366f1]/25 disabled:opacity-50"
                    >
                        {loading ? '正在登录...' : '登录'}
                    </button>
                </form>
            </div>
        </div>
    );
}