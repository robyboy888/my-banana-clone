'use client';

import { useState } from 'react';
import Link from 'next/link';

// 1. 定义 Prompt 接口（确保字段与数据库一致）
interface Prompt {
  id: number;
  title: string;
  content: string;
  original_image_url: string;
  // 根据需要添加其他字段
}

// 2. 为组件参数指定类型
export default function AdminList({ initialPrompts }: { initialPrompts: Prompt[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤逻辑
  const filteredData = initialPrompts.filter((item) => {
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
          
          {/* 🔍 搜索框 */}
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

        {/* 数据列表/表格 */}
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
              未找到匹配的结果
            </div>
          )}
        </div>
      </div>
    </div>
  );
}