'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Prompt } from '@/types/prompt';
import { createBrowserClient } from '@supabase/ssr';

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
    
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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

    const uploadToSupabase = async (file: File, folder: string) => {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('prompt-assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true 
            });

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
        setUploadProgress('正在验证管理员权限...');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("管理员身份失效，请重新登录");

            // 1. 处理 X 链接清洗 (解决特殊字符报错)
            let cleanXLink = formData.source_x_account;
            if (cleanXLink && cleanXLink.includes('x.com')) {
                try {
                    const urlObj = new URL(cleanXLink);
                    cleanXLink = `${urlObj.origin}${urlObj.pathname}`;
                } catch (err) { /* 非 URL 字符串则忽略 */ }
            }

            // 2. 依次上传新选中的文件
            const finalUrls: { [key: string]: string } = {};
            const fileMapping = [
                { key: 'originalImage', dbField: 'original_image_url', folder: 'original' },
                { key: 'optimizedImage', dbField: 'optimized_image_url', folder: 'optimized' },
                { key: 'userPortrait', dbField: 'user_portrait_url', folder: 'portraits' },
                { key: 'userBackground', dbField: 'user_background_url', folder: 'backgrounds' }
            ];

            for (const item of fileMapping) {
                const file = fileChanges[item.key];
                if (file) {
                    setUploadProgress(`正在上传: ${item.folder}...`);
                    const url = await uploadToSupabase(file, item.folder);
                    finalUrls[item.dbField] = url;
                }
            }

            // 3. 构建提交给 API 的 JSON 数据
            setUploadProgress('正在同步数据库...');
            const submissionPayload = {
                ...formData,
                ...finalUrls,
                source_x_account: cleanXLink,
                // 确保保留没有被新文件替换的旧图片 URL
                original_image_url: finalUrls.original_image_url || (typeof formData.original_image_url === 'string' ? formData.original_image_url : ''),
                optimized_image_url: finalUrls.optimized_image_url || (typeof formData.optimized_image_url === 'string' ? formData.optimized_image_url : ''),
                user_portrait_url: finalUrls.user_portrait_url || (typeof formData.user_portrait_url === 'string' ? formData.user_portrait_url : ''),
                user_background_url: finalUrls.user_background_url || (typeof formData.user_background_url === 'string' ? formData.user_background_url : ''),
            };

            const apiPath = isEditMode ? `/api/admin/update` : '/api/admin/create';
            
            // 4. 发起 JSON 请求 (后端全能接口将正确识别 title)
            const response = await fetch(apiPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEditMode ? { id: initialPrompt?.id, ...submissionPayload } : submissionPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '保存失败');
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
                    className={`w-full py-2 px-4 rounded-lg text-xs font-bold transition ${isFile ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                    {isFile ? '✅ 已选新图' : currentUrl ? '🔄 更改图片' : '📁 选择图片'}
                </button>
                {currentUrl && <PreviewImage url={currentUrl} alt={label} />}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">{error}</div>}
            {uploadProgress && <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold animate-pulse text-center">{uploadProgress}</div>}

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3">基本信息</h3>
                <div className="space-y-4">
                    <input name="title" value={formData.title} onChange={handleInputChange} placeholder="标题" required className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                    <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="原始提示词" rows={4} required className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                    <textarea name="optimized_prompt" value={formData.optimized_prompt} onChange={handleInputChange} placeholder="优化后的提示词" rows={4} className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                    <input name="source_x_account" value={formData.source_x_account} onChange={handleInputChange} placeholder="作者 X 贴文地址 (例如: https://x.com/user/status/...)" className="w-full p-4 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-l-4 border-indigo-500 pl-3">资源上传</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderFilePicker('originalImage', 'original_image_url', '原始效果图')}
                    {renderFilePicker('optimizedImage', 'optimized_image_url', '优化效果图')}
                    {renderFilePicker('userPortrait', 'user_portrait_url', '参考肖像')}
                    {renderFilePicker('userBackground', 'user_background_url', '参考背景')}
                </div>
            </section>

            <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
                {isSubmitting ? '正在安全提交...' : isEditMode ? '保存修改' : '发布内容'}
            </button>
        </form>
    );
}