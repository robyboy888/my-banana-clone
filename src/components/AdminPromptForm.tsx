'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Prompt } from '@/types/prompt';

interface AdminPromptFormProps {
    initialPrompt?: Prompt; // 有它就是编辑，没它就是新增
    onSuccess: () => void;
}

// 预览组件
const PreviewImage: React.FC<{ url: string | File, alt: string }> = ({ url, alt }) => {
    const src = url instanceof File ? URL.createObjectURL(url) : url;
    const shouldBeUnoptimized = url instanceof File || (typeof url === 'string' && url.includes('supabase.co'));
    return (
        <div className="mt-2 relative w-full h-40 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <Image src={src} alt={alt} fill className="object-contain" unoptimized={shouldBeUnoptimized} />
        </div>
    );
};

export default function AdminPromptForm({ initialPrompt, onSuccess }: AdminPromptFormProps) {
    const isEditMode = !!initialPrompt;
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        optimized_prompt: '',
        source_x_account: '', // 增加 X 账号支持
        original_image_url: '',
        optimized_image_url: '',
        user_portrait_url: '',
        user_background_url: '',
    });

    const [fileChanges, setFileChanges] = useState<{ [key: string]: File | null }>({
        originalImage: null,
        optimizedImage: null,
        userPortrait: null,
        userBackground: null,
    });

    const fileRefs = {
        originalImage: useRef<HTMLInputElement>(null),
        optimizedImage: useRef<HTMLInputElement>(null),
        userPortrait: useRef<HTMLInputElement>(null),
        userBackground: useRef<HTMLInputElement>(null),
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 初始化数据
    useEffect(() => {
        if (initialPrompt) {
            setFormData({
                title: initialPrompt.title || '',
                content: initialPrompt.content || '',
                optimized_prompt: initialPrompt.optimized_prompt || '',
                source_x_account: (initialPrompt as any).source_x_account || '',
                original_image_url: initialPrompt.original_image_url || '',
                optimized_image_url: initialPrompt.optimized_image_url || '',
                user_portrait_url: initialPrompt.user_portrait_url || '',
                user_background_url: initialPrompt.user_background_url || '',
            });
        }
    }, [initialPrompt]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: string, urlKey: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileChanges(prev => ({ ...prev, [fileKey]: file }));
            setFormData(prev => ({ ...prev, [urlKey]: file as any }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const submissionData = new FormData();
            
            // 文本数据
            const dataToInsert = { ...formData };
            // 移除那些已经是 File 对象的预览占位符，防止 JSON 解析出错
            Object.keys(dataToInsert).forEach(key => {
                if (typeof (dataToInsert as any)[key] === 'object') {
                    (dataToInsert as any)[key] = isEditMode ? (initialPrompt as any)[key] : '';
                }
            });
            
            submissionData.append('data', JSON.stringify(dataToInsert));

            // 文件数据 - 确保这里的 Key 与后端 API 接收逻辑一致
            if (fileChanges.originalImage) submissionData.append('originalImage', fileChanges.originalImage);
            if (fileChanges.optimizedImage) submissionData.append('optimizedImage', fileChanges.optimizedImage);
            if (fileChanges.userPortrait) submissionData.append('userPortrait', fileChanges.userPortrait); // 对应后端 portraitImage
            if (fileChanges.userBackground) submissionData.append('userBackground', fileChanges.userBackground); // 对应后端 backgroundImage

            const apiPath = isEditMode ? `/api/admin/update?id=${initialPrompt.id}` : '/api/admin/create';
            const response = await fetch(apiPath, {
                method: isEditMode ? 'PUT' : 'POST', // 规范化：更新用 PUT，新增用 POST
                body: submissionData,
            });

            if (!response.ok) throw new Error('提交失败');
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFilePicker = (fieldKey: string, urlKey: string, label: string) => {
        const currentUrl = (formData as any)[urlKey];
        const isFile = currentUrl instanceof File;

        return (
            <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="block text-sm font-bold text-gray-700">{label}</label>
                <input 
                    type="file" 
                    ref={(fileRefs as any)[fieldKey]} 
                    onChange={(e) => handleFileChange(e, fieldKey, urlKey)} 
                    className="hidden" 
                    accept="image/*"
                />
                <button 
                    type="button"
                    onClick={() => (fileRefs as any)[fieldKey].current?.click()}
                    className={`w-full py-2 px-4 rounded-lg text-xs font-bold transition ${isFile ? 'bg-green-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                    {isFile ? '✅ 已选择新文件' : currentUrl ? '🔄 更换图片' : '📁 上传图片'}
                </button>
                {currentUrl && <PreviewImage url={currentUrl} alt={label} />}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>}

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3">核心内容</h3>
                <div className="space-y-4">
                    <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Prompt 标题" required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                    <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="原始提示词..." rows={4} required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                    <textarea name="optimized_prompt" value={formData.optimized_prompt} onChange={handleInputChange} placeholder="优化后的提示词 (可选)..." rows={4} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                    <input name="source_x_account" value={formData.source_x_account} onChange={handleInputChange} placeholder="作者 X 账号 (例如: @username)" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3">图片资源</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderFilePicker('originalImage', 'original_image_url', '原始效果图')}
                    {renderFilePicker('optimizedImage', 'optimized_image_url', '优化效果图')}
                    {renderFilePicker('userPortrait', 'user_portrait_url', '用户参考肖像')}
                    {renderFilePicker('userBackground', 'user_background_url', '用户参考背景')}
                </div>
            </section>

            <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50"
            >
                {isSubmitting ? '处理中...' : isEditMode ? '保存修改' : '立即发布'}
            </button>
        </form>
    );
}