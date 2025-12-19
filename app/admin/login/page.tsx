'use client';

import { useState } from 'react';
import { supabase } from '@/src/lib/supabase'; // 统一使用这个
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 登录成功，强制刷新并跳转
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Admin Login</h1>
          <p className="text-sm text-slate-400 font-medium">请输入管理员凭据以继续</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="邮箱地址"
              className="w-full pl-11 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              placeholder="安全密码"
              className="w-full pl-11 pr-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-xs text-red-500 font-bold text-center italic">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '进入控制面板'}
          </button>
        </form>
      </div>
    </div>
  );
}