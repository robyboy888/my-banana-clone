import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService';

export const dynamic = 'force-dynamic';

const BUCKET_NAME = 'prompt-assets';

/**
 * 核心辅助函数：处理文件上传
 * 逻辑：将文件 Buffer 上传至 Supabase Storage，并返回公共访问 URL
 */
async function uploadFile(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 生成安全的文件名，避免中文或特殊字符导致上传失败
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
        throw new Error(`上传文件至 ${folder} 失败: ${error.message}`);
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

        // --- 1. 动态解析逻辑：解决 Content-Type was not one of... 报错 ---
        if (contentType.includes('application/json')) {
            // 兼容来自 Python 脚本 (cron_sync.py) 或前端 JSON 的提交
            recordData = await request.json();
        } 
        else if (contentType.includes('multipart/form-data')) {
            // 兼容来自后台管理页面 AdminPromptForm (带图片) 的提交
            const formData = await request.formData();
            
            // 尝试解析名为 'data' 的 JSON 字符串字段（前端通常会包装一层）
            const dataJson = formData.get('data') as string;
            if (dataJson) {
                recordData = JSON.parse(dataJson);
            } else {
                // 如果前端没包装，直接将 Form 字段转为对象
                formData.forEach((value, key) => {
                    if (typeof value === 'string') recordData[key] = value;
                });
            }

            // --- 2. 自动化文件上传映射 ---
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

        // --- 3. 字段校验与清洗：解决“标题不能为空”报错 ---
        // 此时 recordData 已从 JSON 或 FormData 中获取
        if (!recordData.title) {
            console.error("接收到的无效数据对象:", recordData);
            throw new Error("标题不能为空");
        }

        // --- 4. 字段兼容性翻译：解决 source_link / source_x_account 冲突 ---
        const finalSourceAccount = recordData.source_x_account || recordData.source_link;

        // --- 5. 构造最终入库对象 ---
        const finalData = {
            title: recordData.title,
            content: recordData.content,
            optimized_prompt: recordData.optimized_prompt,
            source_x_account: finalSourceAccount,
            tags: Array.isArray(recordData.tags) ? recordData.tags : (recordData.tags ? [recordData.tags] : []),
            // 优先级：新上传的图片 URL > 传入的图片 URL 字符串
            original_image_url: uploadedUrls.original_image_url || recordData.original_image_url,
            optimized_image_url: uploadedUrls.optimized_image_url || recordData.optimized_image_url,
            user_portrait_url: uploadedUrls.user_portrait_url || recordData.user_portrait_url,
            user_background_url: uploadedUrls.user_background_url || recordData.user_background_url,
            created_at: new Date().toISOString()
        };

        // --- 6. 执行数据库写入 ---
        const { data: dbResult, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .insert([finalData])
            .select();

        if (dbError) throw dbError;

        return NextResponse.json({ message: '记录创建成功', data: dbResult }, { status: 201 });

    } catch (e: any) {
        console.error('新增记录 API 失败详情:', e.message);
        return NextResponse.json(
            { error: e.message || '内部服务器错误' }, 
            { status: 500 }
        );
    }
}