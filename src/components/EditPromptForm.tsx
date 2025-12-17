// /src/components/EditPromptForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditPromptForm({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // 初始化表单状态
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        content: initialData.content || '',
        optimized_prompt: initialData.optimized_prompt || '',
        original_image_url: initialData.original_image_url || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 💥 路径指向你截图中的 /api/admin/update 接口
            const response = await fetch('/api/admin/update', {
                method: 'POST', // 或者按照你 API 定义的 PUT
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: initialData.id,
                    ...formData
                }),
            });

            if (!response.ok) throw new Error('保存失败');

            alert('保存成功！');
            router.push('/admin'); // 保存成功后返回列表
            router.refresh();      // 刷新数据
        } catch (error) {
            console.error(error);
            alert('操作失败，请检查网络或控制台日志');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题输入 */}
            <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">标题</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>

            {/* 原始提示词 */}
            <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-widest">原始提示词</label>
                <textarea
                    rows={4}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
            </div>

            {/* 优化提示词 */}
            <div>
                <label className="block text-sm font-black text-green-600 mb-2 uppercase tracking-widest">优化提示词</label>
                <textarea
                    rows={4}
                    value={formData.optimized_prompt}
                    onChange={(e) => setFormData({ ...formData, optimized_prompt: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-green-100 bg-green-50 focus:ring-2 focus:ring-green-500 outline-none transition text-green-800"
                    placeholder="可选..."
                />
            </div>

            {/* 提交按钮 */}
            <div className="pt-4 flex space-x-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:bg-gray-300"
                >
                    {loading ? '正在保存...' : '保存修改'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                    取消
                </button>
            </div>
        </form>
    );
}