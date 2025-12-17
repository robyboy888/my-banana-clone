import { supabaseServiceRole } from '@/lib/supabaseService';
import React from 'react';
import Link from 'next/link';
import AdminSearchWrapper from './AdminSearchWrapper'; // 我们将搜索逻辑抽离

// 1. 服务端组件：负责从数据库抓取数据
export default async function AdminPage() {
  // 使用你现有的 supabaseServiceRole 获取数据
  const { data: prompts, error } = await supabaseServiceRole
    .from('prompts')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-bold">数据库连接失败</p>
        <code className="text-xs text-slate-400">{error.message}</code>
      </div>
    );
  }

  // 渲染页面框架，并将数据传给下层的搜索组件
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <AdminSearchWrapper initialPrompts={prompts || []} />
      </div>
    </div>
  );
}

// 2. 客户端组件：负责搜索过滤逻辑
// 为了防止混合报错，我们将其定义在同一个文件内并妥善处理交互
'use client'; 

function AdminSearchWrapper({ initialPrompts }: { initialPrompts: any[] }) {
  const [searchQuery, setSearchQuery] = React.useState('');

  // 过滤逻辑
  const filteredData = initialPrompts.filter((item) => {
    if (!item) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.content?.toLowerCase().includes(searchLower) ||
      item.id?.toString().includes(searchLower)
    );
  });

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">内容管理</h1>
          <p className="text-slate-500 text-sm">当前库内共 {initialPrompts.length} 条数据</p>
        </div>
        
        {/* 🔍 搜索框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索标题、内容或 ID..."
            className="w-80 px-5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#3fc1c0] outline-none shadow-sm transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-2.5 text-slate-400 hover:text-slate-600"
            >✕</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">标题</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-md truncate">
                  {item.title}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/admin/edit/${item.id}`}
                    className="inline-block bg-[#3fc1c0]/10 text-[#3fc1c0] px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-[#3fc1c0] hover:text-white transition-all"
                  >
                    编辑
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="p-20 text-center text-slate-400">
            {initialPrompts.length === 0 ? "数据库为空" : "未找到相关结果"}
          </div>
        )}
      </div>
    </>
  );
}