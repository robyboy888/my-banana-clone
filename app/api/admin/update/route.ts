import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'prompt-assets';

/**
 * 核心辅助函数：处理文件上传
 * 修复点：强制生成安全文件名，解决中文导致的 Invalid Key 报错
 */
async function uploadFile(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 1. 获取后缀名 (例如: .jpg)
    const fileExtension = file.name.split('.').pop() || 'jpg';
    
    // 2. 生成安全文件名：文件夹/时间戳-随机数.后缀
    // 彻底不再使用 file.name，解决中文路径报错问题
    const safeFileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`;
    const filePath = `${folder}/${safeFileName}`;

    const { error } = await supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false, // 设置为 false，即使重名也会生成新路径，防止 CDN 缓存旧图
        });

    if (error) {
        console.error(`更新时上传失败: ${folder}`, error);
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
        
        // 1. 获取 ID（必须有 ID 才能更新）
        const id = formData.get('id') as string;
        if (!id) throw new Error("缺少记录 ID");

        // 2. 解析 JSON 数据
        const dataJson = formData.get('data') as string;
        if (!dataJson) throw new Error("缺少 'data' 表单字段");
        const recordData = JSON.parse(dataJson);

        // 3. 映射文件字段并处理上传
        const uploadedUrls: { [key: string]: string } = {};
        const fileMapping = [
            { key: 'originalImage', dbField: 'original_image_url', folder: 'original' },
            { key: 'optimizedImage', dbField: 'optimized_image_url', folder: 'optimized' },
            { key: 'userPortrait', dbField: 'user_portrait_url', folder: 'portraits' },
            { key: 'userBackground', dbField: 'user_background_url', folder: 'backgrounds' }
        ];

        for (const item of fileMapping) {
            const file = formData.get(item.key) as File | null;
            // 检查是否有新文件上传
            if (file && file instanceof File && file.size > 0) {
                const publicUrl = await uploadFile(file, item.folder);
                uploadedUrls[item.dbField] = publicUrl;
            }
        }

        // 4. 构造最终更新对象
        const finalUpdateData = {
            ...recordData,
            ...uploadedUrls, // 只有新上传的字段会被覆盖
            updated_at: new Date().toISOString()
        };

        // 5. 执行更新操作
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .update(finalUpdateData)
            .eq('id', id)
            .select();

        if (dbError) throw dbError;

        return NextResponse.json({ 
            message: '更新成功', 
            data 
        });

    } catch (e: any) {
        console.error('更新 API 错误:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
// 增加这一行，让 PUT 请求也能运行 POST 的逻辑
export const PUT = POST;