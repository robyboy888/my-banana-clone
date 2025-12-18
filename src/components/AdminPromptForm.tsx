'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Prompt } from '@/types/prompt';
// 导入 Supabase 客户端，用于客户端直传
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端 (需确保环境变量已配置)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AdminPromptFormProps {
    initialPrompt?: Prompt;
    onSuccess: () => void;
}

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
        source_x_account: '',
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
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

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

    // --- 核心：客户端直传函数 ---
    const uploadToSupabase = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('prompt-assets')
            .upload(filePath, file);

        if (error) throw new Error(`上传失败: ${error.message}`);

        const { data: { publicUrl } } = supabase.storage
            .from('prompt-assets')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        setUploadProgress('正在准备上传图片...');

        try {
            const finalUrls: { [key: string]: string } = {};
            const fileMapping = [
                { key: 'originalImage', dbField: 'original_image_url', folder: 'original' },
                { key: 'optimizedImage', dbField: 'optimized_image_url', folder: 'optimized' },
                { key: 'userPortrait', dbField: 'user_portrait_url', folder: 'portraits' },
                { key: 'userBackground', dbField: 'user_background_url', folder: 'backgrounds' }
            ];

            // 1. 先进行图片直传 (绕过 Vercel 限制)
            for (const item of fileMapping) {
                const file = fileChanges[item.key];
                if (file) {
                    setUploadProgress(`正在直传大图: ${item.folder}...`);
                    const url = await uploadToSupabase(file, item.folder);
                    finalUrls[item.dbField] = url;
                }
            }

            // 2. 构造最终要发送的 JSON 数据 (不含 File 对象)
            setUploadProgress('正在同步数据库记录...');
            const dataToSubmit = {
                ...formData,
                ...finalUrls,
                // 确保移除任何可能残留的 File 占位符
                original_image_url: finalUrls.original_image_url || (typeof formData.original_image_url === 'string' ? formData.original_image_url : ''),
                optimized_image_url: finalUrls.optimized_image_url || (typeof formData.optimized_image_url === 'string' ? formData.optimized_image_url : ''),
                user_portrait_url: finalUrls.user_portrait_url || (typeof formData.user_portrait_url === 'string' ? formData.user_portrait_url : ''),
                user_background_url: finalUrls.user_background_url || (typeof formData.user_background_url === 'string' ? formData.user_background_url : ''),
            };

            const apiPath = isEditMode ? `/api/admin/update` : '/api/admin/create';
            
            // 3. 使用 JSON 格式发送请求，体积极小
            const response = await fetch(apiPath, {
                method: 'POST', // 统一使用 POST 以兼容之前的后端逻辑，或根据需要改为 PUT
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: initialPrompt?.id,
                    data: dataToSubmit // 后端通过 JSON.parse(data) 处理
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '数据库保存失败');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
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
                    {isFile ? '✅ 已选择(支持20MB+)' : currentUrl ? '🔄 更换图片' : '📁 上传大图'}
                </button>
                {currentUrl && <PreviewImage url={currentUrl} alt={label} />}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>}
            {uploadProgress && <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold animate-pulse">{uploadProgress}</div>}

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
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3">图片资源 (支持 20MB 直传)</h3>
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
                {isSubmitting ? '正在处理大文件...' : isEditMode ? '确认更新' : '立即发布'}
            </button>
        </form>
    );
}