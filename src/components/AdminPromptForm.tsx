// components/AdminPromptForm.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Prompt } from '@/types/prompt'; // 💥 假设您创建了一个 Prompt 接口文件

// 定义表单数据类型，用于状态管理
interface FormState extends Prompt {
    isNew: boolean; // 标记是新增还是编辑
}

// 定义组件 Props
interface AdminPromptFormProps {
    initialPrompt?: Prompt; // 编辑模式下的初始数据
    onSuccess: () => void; // 成功后的回调
}

// 辅助函数：处理文件到 Base64 或 Blob URL，这里我们用 File 对象，并在上传时处理
const initialFormState: FormState = {
    isNew: true,
    id: 0,
    title: '',
    content: '',
    original_image_url: '',
    optimized_prompt: '',
    optimized_image_url: '',
    user_portrait_url: '',
    user_background_url: '',
    // ... 确保所有字段都在这里初始化
};


export default function AdminPromptForm({ initialPrompt, onSuccess }: AdminPromptFormProps) {
    
    // 初始化表单状态
    const [formData, setFormData] = useState<FormState>(initialPrompt ? { ...initialPrompt, isNew: false } : initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // 文件状态：用于存储用户上传的 File 对象
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        originalImage: null,
        optimizedImage: null,
        portraitImage: null,
        backgroundImage: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof files, urlFieldName: keyof FormState) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setFiles(prev => ({ ...prev, [fieldName]: file }));
            // 在前端显示预览
            const url = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, [urlFieldName]: url }));
        } else {
             setFiles(prev => ({ ...prev, [fieldName]: null }));
        }
    };
    
    // 提交处理函数
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        const endpoint = formData.isNew ? '/api/admin/create' : '/api/admin/update';
        
        // 1. 创建 FormData 对象，用于发送数据和文件
        const form = new FormData();
        
        // 2. 添加文本数据
        form.append('data', JSON.stringify(formData));

        // 3. 添加文件数据
        Object.keys(files).forEach(key => {
            const file = files[key as keyof typeof files];
            if (file) {
                form.append(key, file); // key: originalImage, optimizedImage, etc.
            }
        });

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                // ⚠️ 注意：当使用 FormData 包含文件时，浏览器会自动设置 Content-Type
                // headers: { 'Content-Type': 'multipart/form-data' },
                body: form,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '保存失败');
            }

            alert(formData.isNew ? '新增记录成功！' : '更新记录成功！');
            onSuccess();
            if (formData.isNew) {
                setFormData(initialFormState); // 新增成功后清空表单
            }

        } catch (err: any) {
            setError(err.message);
            console.error('Submit error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // 完整的表单 JSX 结构 (简洁版)
    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white shadow-xl rounded-lg space-y-6">
            <h2 className="text-3xl font-bold text-yellow-700">
                {formData.isNew ? '新增 Prompt 记录' : `编辑 Prompt: ${formData.title}`}
            </h2>
            
            {error && <div className="p-3 bg-red-100 text-red-700 rounded border border-red-300">错误: {error}</div>}

            {/* 1. 基础信息 */}
            <input name="title" value={formData.title} onChange={handleChange} placeholder="标题" className="w-full p-3 border rounded" required />
            <textarea name="content" value={formData.content} onChange={handleChange} placeholder="原始提示词 (Content)" rows={4} className="w-full p-3 border rounded" required />
            
            <hr />

            {/* 2. 优化提示词 */}
            <h3 className="text-xl font-semibold mt-4">优化信息</h3>
            <textarea name="optimized_prompt" value={formData.optimized_prompt} onChange={handleChange} placeholder="优化后的提示词" rows={4} className="w-full p-3 border rounded" />
            
            <div className="grid grid-cols-2 gap-4">
                {/* 原始图片上传/预览 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">原始图片 ({formData.original_image_url ? '已存在' : '必选'})</label>
                    <input type="file" onChange={(e) => handleFileChange(e, 'originalImage', 'original_image_url')} accept="image/*" className="w-full" required={!formData.original_image_url} />
                    {formData.original_image_url && <PreviewImage url={formData.original_image_url} alt="原始图片" />}
                </div>

                {/* 优化图片上传/预览 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">优化图片</label>
                    <input type="file" onChange={(e) => handleFileChange(e, 'optimizedImage', 'optimized_image_url')} accept="image/*" className="w-full" />
                    {formData.optimized_image_url && <PreviewImage url={formData.optimized_image_url} alt="优化图片" />}
                </div>
            </div>

            <hr />

            {/* 3. 用户参考图片上传 */}
            <h3 className="text-xl font-semibold mt-4">用户参考图片 (可选)</h3>
            <div className="grid grid-cols-2 gap-4">
                 {/* 肖像图片上传/预览 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">用户肖像</label>
                    <input type="file" onChange={(e) => handleFileChange(e, 'portraitImage', 'user_portrait_url')} accept="image/*" className="w-full" />
                    {formData.user_portrait_url && <PreviewImage url={formData.user_portrait_url} alt="用户肖像" />}
                </div>
                
                 {/* 背景图片上传/预览 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">用户背景</label>
                    <input type="file" onChange={(e) => handleFileChange(e, 'backgroundImage', 'user_background_url')} accept="image/*" className="w-full" />
                    {formData.user_background_url && <PreviewImage url={formData.user_background_url} alt="用户背景" />}
                </div>
            </div>

            <button type="submit" disabled={isLoading} className="mt-6 w-full p-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400">
                {isLoading ? '保存中...' : (formData.isNew ? '新增并上传' : '保存修改')}
            </button>
        </form>
    );
}

// 辅助组件：图片预览
const PreviewImage = ({ url, alt }: { url: string, alt: string }) => (
    <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden border border-gray-300">
        <Image src={url} alt={alt} fill style={{ objectFit: 'cover' }} />
    </div>
);