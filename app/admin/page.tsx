import { createClient } from '@/lib/supabaseServer'; // 确保路径对应你的服务端 Supabase 客户端
import { useState } from 'react';
import AdminClientList from './AdminClientList'; // 我们稍后创建这个文件

// 注意：这个文件头部不要加 'use client'
export default async function AdminPage() {
  const supabase = createClient();
  
  // 从数据库获取真实数据
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">加载失败: {error.message}</div>;
  }

  // 将数据传给客户端组件进行搜索和展示
  return <AdminClientList initialPrompts={prompts || []} />;
}

// --- 为了方便你直接复制，我把客户端组件逻辑直接写在下面作为内部组件 ---
// --- 实际开发建议将其抽离到同目录下的 AdminClientList.tsx ---

'use client'; // 在文件底部切换到客户端模式是不行的，所以我们必须确保逻辑正确

import React from 'react';
import Link from 'next/link';

function AdminClientList({ initialPrompts = [] }: { initialPrompts: any[] }) {
  const [searchQuery, setSearchQuery] = React.useState('');

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
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">内容管理</h1>
            <p className="text-slate-500 text-sm">共 {filteredData.length} 条数据</p>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="搜索标题、内容或 ID..."
              className="w-80 px-5 py-2.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#3fc1c0] outline-none shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3 text-slate-400 hover:text-slate-600"
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
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.title}</td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/edit/${item.id}`}
                      className="text-[#3fc1c0] hover:text-[#34a3a2] font-bold text-sm"
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
              {initialPrompts.length === 0 ? "数据库无数据或连接失败" : "未找到匹配的结果"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}