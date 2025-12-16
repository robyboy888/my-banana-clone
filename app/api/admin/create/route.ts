// app/api/admin/create/route.ts
import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService'; 

// 强制动态渲染，防止 Vercel 缓存
export const dynamic = 'force-dynamic'; 

// 💥 关键修正：使用我们新的、已创建的备用 Bucket 名称
const BUCKET_NAME = 'prompt-assets'; 

/**
 * 辅助函数：处理文件上传到 Supabase Storage
 */
async function uploadFile(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 生成唯一文件名
    const filePath = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    // 💥 使用 BUCKET_NAME 变量
    const { data, error } = await supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
        });

    if (error) {
        // 确保错误信息能被捕获
        throw new Error(`文件上传失败: ${error.message}`);
    }

    // 获取公开 URL
    const { data: publicUrlData } = supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}


// 处理 POST 请求：新增记录
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        // 1. 解析文本数据
        const dataJson = formData.get('data') as string;
        const recordData = JSON.parse(dataJson);
        
        // 2. 处理文件上传，并更新 URL 字段
        const uploadedUrls: { [key: string]: string } = {};
        const fileFields = ['originalImage', 'optimizedImage', 'portraitImage', 'backgroundImage'];

        for (const field of fileFields) {
            const file = formData.get(field) as File | null;
            if (file && file.size > 0) {
                // 根据字段名，确定在数据库中对应的 URL 字段名
                const urlFieldName = field.toLowerCase().replace('image', '_image_url').replace('portrait', 'user_portrait').replace('background', 'user_background');
                const url = await uploadFile(file, urlFieldName.replace('_url', '')); // 上传到对应的文件夹
                uploadedUrls[urlFieldName] = url;
            }
        }
        
        // 3. 构建最终要插入的数据
        const finalData = {
            title: recordData.title,
            content: recordData.content,
            optimized_prompt: recordData.optimized_prompt,
            ...uploadedUrls, // 插入新上传的图片 URL
            // ... 其他字段
        };

        // 4. 插入到 Supabase 数据库 (注意：这里依然是 'prompts' 表名，不需要修改)
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .insert([finalData])
            .select();

        if (dbError) {
            console.error('Database insertion error:', dbError);
            return NextResponse.json({ error: dbError.message || '数据库插入失败' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Record created successfully', data }, { status: 201 });

    } catch (e: any) {
        console.error('API processing error:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}