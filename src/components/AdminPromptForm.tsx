// components/AdminPromptForm.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Prompt } from '@/types/prompt'; // 确保这个类型文件已存在

// 定义用于表单状态的接口
interface FormState extends Omit<Prompt, 'id'> {
    // 移除 id，因为新增时没有 id
    // original_image_url 等字段在 Prompt 接口中已定义
}

// 定义组件 Props
interface AdminPromptFormProps {
    // 传入 initialPrompt 时为编辑模式，否则为新增模式
    initialPrompt?: Prompt;
    onSuccess: () => void;
}

// ----------------------------------------------------
// 辅助组件：图片预览
// ----------------------------------------------------
const PreviewImage: React.FC<{ url: string | File, alt: string }> = ({ url, alt }) => {
    // 如果是 File 对象，创建本地 URL 用于预览
    const src = url instanceof File ? URL.createObjectURL(url) : url;
    
    return (
        <div className="mt-2 relative w-full h-32 border border-gray-300 rounded-lg overflow-hidden">
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain"
                unoptimized={typeof url === 'string' && url.includes('supabase.co')}
            />
        </div>
    );
};

// ----------------------------------------------------
// 主组件：AdminPromptForm
// ----------------------------------------------------
export default function AdminPromptForm({ initialPrompt, onSuccess }: AdminPromptFormProps) {
    
    // 默认表单初始状态
    const defaultFormState: FormState = useMemo(() => ({
        title: '',
        content: '',
        optimized_prompt: '',
        original_image_url: '',
        optimized_image_url: '',
        user_portrait_url: '',
        user_background_url: '',
    }), []);

    const [formData, setFormData] = useState<FormState>(defaultFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // 💥 用于存储待上传的 File 对象
    const [fileChanges, setFileChanges] = useState<{ [key: string]: File | null }>({});

    // 💥 定义 Ref 引用所有文件输入框
    const fileRefs = {
        originalImage: useRef<HTMLInputElement>(null),
        optimizedImage: useRef<HTMLInputElement>(null),
        userPortrait: useRef<HTMLInputElement>(null),
        userBackground: useRef<HTMLInputElement>(null),
    };
    
    // 检查是否为编辑模式
    const isEditMode = !!initialPrompt;
    
    // ----------------------------------------------------
    // useEffect：初始化表单数据
    // ----------------------------------------------------
    useEffect(() => {
        if (initialPrompt) {
            // 编辑模式：使用初始数据填充表单
            setFormData({
                title: initialPrompt.title || '',
                content: initialPrompt.content || '',
                optimized_prompt: initialPrompt.optimized_prompt || '',
                original_image_url: initialPrompt.original_image_url || '',
                optimized_image_url: initialPrompt.optimized_image_url || '',
                user_portrait_url: initialPrompt.user_portrait_url || '',
                user_background_url: initialPrompt.user_background_url || '',
            });
        }
    }, [initialPrompt]);
    
    // ----------------------------------------------------
    // Handlers：处理输入和文件变化
    // ----------------------------------------------------
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement>, 
        fileKey: 'originalImage' | 'optimizedImage' | 'userPortrait' | 'userBackground',
        urlKey: keyof FormState // 对应 URL 字段，如 'original_image_url'
    ) => {
        const file = e.target.files?.[0];
        
        if (file) {
            // 存储 File 对象，用于提交时上传
            setFileChanges(prev => ({ ...prev, [fileKey]: file }));
            
            // 更新 formData，将 File 对象作为本地 URL 替代，用于预览
            setFormData(prev => ({ ...prev, [urlKey]: file as any }));
            
        } else {
            // 如果取消选择文件，清除 File 对象和 URL（如果它是 File 对象）
            setFileChanges(prev => ({ ...prev, [fileKey]: null }));
            
            // 恢复为初始 URL 或清空
            const initialUrl = isEditMode ? initialPrompt?.[urlKey] || '' : '';
            setFormData(prev => ({ ...prev, [urlKey]: initialUrl as any }));
        }
    }, [isEditMode, initialPrompt]);


    // ----------------------------------------------------
    // 提交逻辑
    // ----------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        
        // 1. 构造 FormData，用于 API 传输文件和文本数据
        const submissionData = new FormData();
        
        // 添加 ID (仅编辑模式)
        if (isEditMode && initialPrompt?.id) {
            submissionData.append('id', String(initialPrompt.id));
        }

        // 添加文本数据
        Object.entries(formData).forEach(([key, value]) => {
            // 只发送 string 类型的值，跳过 File 对象
            if (typeof value === 'string') {
                submissionData.append(key, value);
            }
        });

        // 添加文件数据
        Object.entries(fileChanges).forEach(([key, file]) => {
            if (file) {
                // key: 'originalImage', 'optimizedImage', etc.
                submissionData.append(key, file); 
            }
        });

        // 2. 选择 API 路由
        const apiPath = isEditMode ? '/api/admin/update' : '/api/admin/create';

        try {
            const response = await fetch(apiPath, {
                method: 'POST',
                body: submissionData, // 自动设置正确的 Content-Type
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '操作失败，请检查服务器日志。');
            }

            // 成功后，调用传入的 onSuccess 回调
            onSuccess();

        } catch (err: any) {
            setError(err.message || '未知错误发生，请重试。');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // ----------------------------------------------------
    // 辅助函数：渲染文件选择器 (封装了按钮逻辑)
    // ----------------------------------------------------
    const renderFilePicker = (
        fieldKey: 'originalImage' | 'optimizedImage' | 'userPortrait' | 'userBackground',
        urlKey: keyof FormState,
        label: string,
        isRequired: boolean = false
    ) => {
        const currentFile = fileChanges[fieldKey];
        const currentUrl = formData[urlKey];
        
        // 确定当前状态是文件对象还是 URL 字符串
        const isFile = currentUrl instanceof File;
        const urlString = isFile ? undefined : (currentUrl as string);
        
        // 确定按钮上的提示文本
        const buttonText = isFile 
            ? `已选择: ${currentFile?.name}` 
            : urlString 
                ? `图片已存在 (点击更换)` 
                : `选择文件 (点击上传)`;

        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium">
                    {label} {isRequired ? '(必选)' : '(可选)'}
                </label>
                
                {/* 1. 隐藏原始的 input 框，并绑定 ref */}
                <input 
                    type="file" 
                    ref={fileRefs[fieldKey]} 
                    onChange={(e) => handleFileChange(e, fieldKey, urlKey)} 
                    accept="image/*" 
                    className="hidden" // 💥 隐藏
                    required={isRequired && !urlString && !isFile && !isEditMode}
                />
                
                {/* 2. 自定义按钮，点击时触发隐藏 input 的 click 事件 */}
                <button 
                    type="button" 
                    onClick={() => fileRefs[fieldKey].current?.click()}
                    className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                    disabled={isSubmitting}
                >
                    {buttonText}
                </button>
                
                {/* 3. 预览区域 */}
                {(urlString || isFile) && (
                    <PreviewImage url={currentUrl} alt={`${label}预览`} />
                )}
            </div>
        );
    };

    // ----------------------------------------------------
    // 渲染表单
    // ----------------------------------------------------
    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-xl rounded-xl">
            {/* 错误提示 */}
            {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            
            {/* 1. 基础信息 */}
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">基础信息</h3>
            
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">标题</label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">原始提示词 (Content)</label>
                <textarea
                    id="content"
                    name="content"
                    rows={4}
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* 2. 优化信息 */}
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 pt-4">优化信息</h3>
            
            <div>
                <label htmlFor="optimized_prompt" className="block text-sm font-medium text-gray-700">优化后的提示词</label>
                <textarea
                    id="optimized_prompt"
                    name="optimized_prompt"
                    rows={4}
                    value={formData.optimized_prompt || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            
            {/* 3. 图片上传区域 - 使用新的按钮渲染函数 */}
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 pt-4">图片资源</h3>
            
            <div className="grid grid-cols-2 gap-6">
                {/* 原始图片 (必选) */}
                {renderFilePicker('originalImage', 'original_image_url', '原始图片', true)}
                
                {/* 优化图片 (可选) */}
                {renderFilePicker('optimizedImage', 'optimized_image_url', '优化图片')}
            </div>

            <h4 className="text-lg font-medium text-gray-600 border-b pb-2 pt-4">用户参考图片 (可选)</h4>

            <div className="grid grid-cols-2 gap-6">
                {/* 用户肖像 (可选) */}
                {renderFilePicker('userPortrait', 'user_portrait_url', '用户肖像')}

                {/* 用户背景 (可选) */}
                {renderFilePicker('userBackground', 'user_background_url', '用户背景')}
            </div>

            {/* 4. 提交按钮 */}
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition"
            >
                {isSubmitting 
                    ? (isEditMode ? '正在更新...' : '正在新增...') 
                    : (isEditMode ? '更新记录' : '新增记录')
                }
            </button>
        </form>
    );
}