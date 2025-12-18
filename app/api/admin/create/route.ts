import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'prompt-assets';

/**
 * 处理文件上传
 */
async function uploadFile(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExtension = file.name.split('.').pop() || 'jpg';
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
        const contentType = request.headers.get('content-type') || '';
        let recordData: any = {};
        let uploadedUrls: { [key: string]: string } = {};

        // --- 核心修复：根据 Content-Type 动态解析 ---
        if (contentType.includes('application/json')) {
            // 处理来自 Python 脚本或 JSON 请求的提交
            recordData = await request.json();
        } 
        else if (contentType.includes('multipart/form-data')) {
            // 处理来自后台管理页面（带图片）的提交
            const formData = await request.formData();
            
            // 获取基础 JSON 数据
            const dataJson = formData.get('data') as string;
            if (dataJson) {
                recordData = JSON.parse(dataJson);
            }

            // 处理文件上传映射
            const fileMapping = [
                { key: 'originalImage', dbField: 'original_image_url', folder: 'original' },
                { key: 'optimizedImage', dbField: 'optimized_image_url', folder: 'optimized' },
                { key: 'userPortrait', dbField: 'user_portrait_url', folder: 'portraits' },
                { key: 'userBackground', dbField: 'user_background_url', folder: 'backgrounds' }
            ];

            for (const item of fileMapping) {
                const file = formData.get(item.key) as File | null;
                if (file && file instanceof File && file.size > 0) {
                    const publicUrl = await uploadFile(file, item.folder);
                    uploadedUrls[item.dbField] = publicUrl;
                }
            }
        } else {
            throw new Error(`不支持的请求格式: ${contentType}`);
        }

        // --- 字段校验与兼容性处理 ---
        if (!recordData.title) throw new Error("标题不能为空");

        // 解决脚本中 source_link 和数据库 source_x_account 的映射问题
        const finalSourceAccount = recordData.source_x_account || recordData.source_link;

        // 构造最终入库对象
        const finalData = {
            title: recordData.title,
            content: recordData.content,
            optimized_prompt: recordData.optimized_prompt,
            source_x_account: finalSourceAccount,
            tags: recordData.tags || [],
            // 如果是 JSON 提交，url 可能已经在 recordData 里；如果是 FormData，则在 uploadedUrls 里
            original_image_url: uploadedUrls.original_image_url || recordData.original_image_url,
            optimized_image_url: uploadedUrls.optimized_image_url || recordData.optimized_image_url,
            user_portrait_url: uploadedUrls.user_portrait_url || recordData.user_portrait_url,
            user_background_url: uploadedUrls.user_background_url || recordData.user_background_url,
            created_at: new Date().toISOString()
        };

        // 写入数据库
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