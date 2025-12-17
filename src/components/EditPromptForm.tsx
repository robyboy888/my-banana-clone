// src/components/EditPromptForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 1. 定义 ImageUploadBox 的属性接口，解决 TypeScript 类型报错
interface ImageUploadBoxProps {
    label: string;
    id: string;
    preview: string | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditPromptForm({ initialData }: { initialData: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // 状态管理：基础文本
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        content: initialData.content || '',
        optimized_prompt: initialData.optimized_prompt || '',
    });

    // 状态管理：图片预览地址
    const [previews, setPreviews] = useState({
        original: initialData.original_image_url || null,
        optimized: initialData.optimized_image_url || null,
        portrait: initialData.user_portrait_url || null,
        background: initialData.user_background_url || null,
    });

    // 状态管理：待上传的文件对象
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        originalImage: null,
        optimizedImage: null,
        portraitImage: null,
        backgroundImage: null,
    });

    // 处理文件选择
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, previewKey: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, [previewKey]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const body = new FormData();
            
            // 构造传递给后端的 JSON 数据
            const dataToSubmit = {
                id: initialData.id,
                ...formData,
                original_image_url: initialData.original_image_url,
                optimized_image_url: initialData.optimized_image_url,
                user_portrait_url: initialData.user_portrait_url,
                user_background_url: initialData.user_background_url,
            };
            body.append('data', JSON.stringify(dataToSubmit));

            // 添加文件字段
            if (files.originalImage) body.append('originalImage', files.originalImage);
            if (files.optimizedImage) body.append('optimizedImage', files.optimizedImage);
            if (files.portraitImage) body.append('portraitImage', files.portraitImage);
            if (files.backgroundImage) body.append('backgroundImage', files.backgroundImage);

            const response = await fetch('/api/admin/update', {
                method: 'POST',
                body: body,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || '更新失败');

            alert('保存成功！');
            router.push('/admin');
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            {/* 基础信息 */}
            <section>
                <h2 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">基础信息</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">原始提示词 (Content)</label>
                        <textarea
                            rows={5}
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* 优化信息 */}
            <section>
                <h2 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">优化信息</h2>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">优化后的提示词</label>
                    <textarea
                        rows={5}
                        value={formData.optimized_prompt}
                        onChange={(e) => setFormData({ ...formData, optimized_prompt: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                    />
                </div>
            </section>

            {/* 图片资源 */}
            <section>
                <h2 className="text-2xl font-black text-slate-800 mb-6 border-b pb-4">图片资源</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <ImageUploadBox 
                        label="原始图片 (必选)" 
                        id="originalImage" 
                        preview={previews.original} 
                        onChange={(e) => handleFileChange(e, 'originalImage', 'original')} 
                    />
                    <ImageUploadBox 
                        label="优化图片 (可选)" 
                        id="optimizedImage" 
                        preview={previews.optimized} 
                        onChange={(e) => handleFileChange(e, 'optimizedImage', 'optimized')} 
                    />
                </div>

                <div className="pt-8 border-t border-dashed">
                    <p className="text-sm font-bold text-gray-500 mb-6">用户参考图片 (可选)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploadBox 
                            label="用户肖像" 
                            id="portraitImage" 
                            preview={previews.portrait} 
                            onChange={(e) => handleFileChange(e, 'portraitImage', 'portrait')} 
                        />
                        <ImageUploadBox 
                            label="用户背景" 
                            id="backgroundImage" 
                            preview={previews.background} 
                            onChange={(e) => handleFileChange(e, 'backgroundImage', 'background')} 
                        />
                    </div>
                </div>
            </section>

            {/* 按钮 */}
            <div className="pt-12">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl disabled:bg-slate-300"
                >
                    {loading ? '正在同步云端数据...' : '保存修改内容'}
                </button>
            </div>
        </form>
    );
}

// 提取出来的子组件，必须放在主组件外部或定义在主组件内部渲染逻辑之前
function ImageUploadBox({ label, id, preview, onChange }: ImageUploadBoxProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-600">{label}</label>
            <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-all bg-slate-50 aspect-video flex flex-col items-center justify-center">
                {preview ? (
                    <>
                        <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white font-bold text-sm">更换图片</span>
                        </div>
                    </>
                ) : (
                    <span className="text-slate-400 text-sm">尚未上传图片</span>
                )}
                <input 
                    type="file" 
                    id={id} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={onChange} 
                    accept="image/*"
                />
            </div>
            <label htmlFor={id} className="block w-full py-3 bg-blue-500 text-white text-center rounded-xl font-bold text-sm hover:bg-blue-600 transition cursor-pointer">
                选择文件
            </label>
        </div>
    );
}