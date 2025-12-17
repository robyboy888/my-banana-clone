import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'prompt-assets';

/**
 * 核心辅助函数：处理文件上传
 * 修复点：强制格式化文件名，避免中文、特殊字符导致的 Invalid Key 错误
 */
async function uploadFile(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 获取文件后缀名 (例如: .jpg)
    const fileExtension = file.name.split('.').pop() || 'jpg';
    
    // 生成安全的文件路径：文件夹/时间戳-随机数.后缀
    // 不再使用 file.name，彻底杜绝中文路径报错
    const safeFileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    const filePath = `${folder}/${safeFileName}`;

    const { error } = await supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        console.error(`Supabase 上传失败详情:`, error);
        throw new Error(`上传至 ${folder} 失败: ${error.message}`);
    }

    const { data: publicUrlData } = supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        // 1. 解析基础 JSON 数据
        const dataJson = formData.get('data') as string;
        if (!dataJson) throw new Error("缺少 'data' 表单字段");
        const recordData = JSON.parse(dataJson);
        
        if (!recordData.title) throw new Error("标题不能为空");

        // 2. 映射前端 File Key 到数据库字段名
        const uploadedUrls: { [key: string]: string } = {};
        const fileMapping = [
            { key: 'originalImage', dbField: 'original_image_url', folder: 'original' },
            { key: 'optimizedImage', dbField: 'optimized_image_url', folder: 'optimized' },
            { key: 'userPortrait', dbField: 'user_portrait_url', folder: 'portraits' },
            { key: 'userBackground', dbField: 'user_background_url', folder: 'backgrounds' }
        ];

        for (const item of fileMapping) {
            const file = formData.get(item.key) as File | null;
            // 只有当文件存在且大小大于 0 时才上传
            if (file && file instanceof File && file.size > 0) {
                const publicUrl = await uploadFile(file, item.folder);
                uploadedUrls[item.dbField] = publicUrl;
            }
        }

        // 3. 构造插入对象
        const finalData = {
            ...recordData,      // 包含 title, content, optimized_prompt, source_x_account
            ...uploadedUrls,    // 包含新上传的图片 URL
            created_at: new Date().toISOString()
        };

        // 4. 写入数据库
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .insert([finalData])
            .select();

        if (dbError) throw dbError;

        return NextResponse.json({ message: '创建成功', data }, { status: 201 });

    } catch (e: any) {
        console.error('新增 API 错误:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}