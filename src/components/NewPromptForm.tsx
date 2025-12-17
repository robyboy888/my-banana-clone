'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadBox from './ImageUploadBox'; // 建议把 ImageUploadBox 提取成独立组件

export default function NewPromptForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        optimized_prompt: '',
        source_x_account: '',
        admin_notes: '',
    });

    const [previews, setPreviews] = useState({
        original: null,
        optimized: null,
        portrait: null,
        background: null,
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        originalImage: null,
        optimizedImage: null,
        portraitImage: null,
        backgroundImage: null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, previewKey: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: file }));
            setPreviews(prev => ({ ...prev, (previewKey as any): URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const body = new FormData();
            body.append('data', JSON.stringify(formData));

            if (files.originalImage) body.append('originalImage', files.originalImage);
            if (files.optimizedImage) body.append('optimizedImage', files.optimizedImage);
            if (files.portraitImage) body.append('portraitImage', files.portraitImage);
            if (files.backgroundImage) body.append('backgroundImage', files.backgroundImage);

            const response = await fetch('/api/admin/create', { // 注意这里是 create 接口
                method: 'POST',
                body: body,
            });

            if (!response.ok) throw new Error('创建失败');

            alert('创建成功！');
            router.push('/admin');
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 这里复用 EditPromptForm 的布局代码，仅将初始值设为空 */}
            {/* 包含标题、内容、X账号、备注、图片上传等输入框 */}
            <button type="submit" disabled={loading} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold">
                {loading ? '正在发布...' : '立即发布'}
            </button>
        </form>
    );
}