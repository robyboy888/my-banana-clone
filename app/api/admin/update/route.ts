// app/api/admin/update/route.ts
import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService'; 
import { URL } from 'url';

// Supabase Storage 桶名
const BUCKET_NAME = 'prompt-images';

/**
 * 辅助函数：处理文件上传到 Supabase Storage
 * @param file - File 对象
 * @param folder - 上传到 Storage 中的文件夹名
 * @returns 公开访问的图片 URL
 */
async function uploadFile(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 生成唯一文件名
    const filePath = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    const { error } = await supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        throw new Error(`文件上传失败: ${error.message}`);
    }

    // 获取公开 URL
    const { data: publicUrlData } = supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

/**
 * 辅助函数：如果更新了图片，尝试删除旧文件
 * @param oldUrl - 旧的公开访问 URL
 */
async function deleteOldFile(oldUrl: string | undefined | null) {
    if (!oldUrl || oldUrl.includes('blob:')) {
        return; // 没有旧 URL 或它是前端预览 URL
    }
    
    // 尝试解析 URL 路径
    try {
        const parsedUrl = new URL(oldUrl);
        const pathSegments = parsedUrl.pathname.split('/');
        
        // Supabase URL 格式通常是 /storage/v1/object/public/BUCKET_NAME/folder/filename
        // 我们需要删除从 BUCKET_NAME 往后的部分
        const bucketIndex = pathSegments.findIndex(segment => segment === BUCKET_NAME);
        if (bucketIndex === -1) return; // 找不到桶名，跳过

        // 获取 Storage 中的文件路径 (例如: folder/filename.jpg)
        const filePath = pathSegments.slice(bucketIndex + 1).join('/');

        // 执行删除操作
        const { error: deleteError } = await supabaseServiceRole.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (deleteError) {
            console.warn(`Warning: Failed to delete old file at ${filePath}. Error: ${deleteError.message}`);
        }
    } catch (e) {
        console.warn('Warning: Could not parse or delete old URL:', oldUrl);
    }
}


/**
 * POST 请求处理器：更新现有 Prompt 记录，处理多文件上传
 * (在 RESTful 设计中应该是 PUT/PATCH, 但 Next.js API Route 常用 POST 处理表单提交)
 */
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        // 1. 解析文本数据，获取 ID 和所有字段
        const dataJson = formData.get('data') as string;
        const recordData = JSON.parse(dataJson);
        const recordId = recordData.id;

        if (!recordId) {
            return NextResponse.json({ error: '记录 ID 缺失，无法更新' }, { status: 400 });
        }
        
        // 2. 准备更新的数据对象 (只包含非文件和非ID字段)
        const updateData: { [key: string]: any } = {
            title: recordData.title,
            content: recordData.content,
            optimized_prompt: recordData.optimized_prompt || null,
			source_x_account: recordData.source_x_account || null, // 💥 添加
			admin_notes: recordData.admin_notes || null,           // 💥 添加	
            // ... 其他非文件字段
        };

        // 3. 处理文件上传和旧文件删除
        const fileFields = [
            { formField: 'originalImage', dbField: 'original_image_url', oldUrl: recordData.original_image_url, folder: 'original_image' },
            { formField: 'optimizedImage', dbField: 'optimized_image_url', oldUrl: recordData.optimized_image_url, folder: 'optimized_image' },
            { formField: 'portraitImage', dbField: 'user_portrait_url', oldUrl: recordData.user_portrait_url, folder: 'user_portrait' },
            { formField: 'backgroundImage', dbField: 'user_background_url', oldUrl: recordData.user_background_url, folder: 'user_background' },
        ];

        for (const { formField, dbField, oldUrl, folder } of fileFields) {
            const file = formData.get(formField) as File | null;
            
            if (file && file.size > 0) {
                // 如果上传了新文件:
                // a. 上传新文件
                const newUrl = await uploadFile(file, folder);
                updateData[dbField] = newUrl;
                
                // b. 尝试删除旧文件 (可选但推荐)
                await deleteOldFile(oldUrl);
            } else {
                // 如果没有上传新文件，保留旧的 URL
                updateData[dbField] = oldUrl; 
            }
        }
        
        // 4. 执行 Supabase 更新操作
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .update(updateData)
            .eq('id', recordId)
            .select(); // 返回更新后的记录

        if (dbError) {
            console.error('Database update error:', dbError);
            return NextResponse.json({ error: dbError.message || '数据库更新失败' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Record updated successfully', data: data[0] }, { status: 200 });

    } catch (e: any) {
        console.error('API processing error:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}