'use client';
import { useState } from 'react';

export default function AdminList({ initialPrompts }) {
  const [searchQuery, setSearchQuery] = useState('');

  // 过滤逻辑：匹配标题、内容或 ID
  const filteredData = initialPrompts.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.content?.toLowerCase().includes(searchLower) ||
      item.id?.includes(searchLower)
    );
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">内容管理 ({filteredData.length})</h1>
        
        {/* 🔍 搜索框组件 */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索提示词、内容或ID..."
            className="w-80 px-4 py-2 border rounded-full text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >✕</button>
          )}
        </div>
      </div>

      {/* 表格中使用 filteredData 进行渲染 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
           {/* ... 之前的 thead ... */}
           <tbody>
             {filteredData.map((item) => (
               <tr key={item.id}>
                 {/* ... 渲染行 ... */}
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
}