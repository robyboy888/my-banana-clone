import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService'; 

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 💥 统一桶名 (确保与 create 接口一致)
const BUCKET_NAME = 'prompt-assets';

/**
 * 辅助函数：处理文件上传
 */
async function uploadFile(file: File, folder: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 生成唯一文件名，替换空格防止 URL 报错
    const filePath = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    const { error } = await supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
            contentType: file.type,
            upsert: false,
        });

    if (error) throw new Error(`文件上传失败: ${error.message}`);

    const { data: publicUrlData } = supabaseServiceRole.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

/**
 * 辅助函数：删除旧文件 (节省存储空间)
 */
async function deleteOldFile(oldUrl: string | undefined | null) {
    if (!oldUrl || typeof oldUrl !== 'string' || oldUrl.includes('blob:')) return;
    
    try {
        // 解析 Supabase URL 获取路径
        // URL 格式: .../storage/v1/object/public/BUCKET_NAME/folder/filename.jpg
        const parts = oldUrl.split(`${BUCKET_NAME}/`);
        if (parts.length < 2) return;
        
        const filePath = parts[1];
        await supabaseServiceRole.storage.from(BUCKET_NAME).remove([filePath]);
    } catch (e) {
        console.warn('删除旧文件失败，跳过:', oldUrl);
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        // 1. 解析基础数据
        const dataJson = formData.get('data') as string;
        if (!dataJson) throw new Error("缺少 'data' 字段");
        
        const recordData = JSON.parse(dataJson);
        const recordId = recordData.id;

        if (!recordId) {
            return NextResponse.json({ error: '记录 ID 缺失' }, { status: 400 });
        }
        
        // 2. 准备更新的数据对象 (基础文本字段)
        const updateData: any = {
            title: recordData.title,
            content: recordData.content,
            optimized_prompt: recordData.optimized_prompt || null,
            source_x_account: recordData.source_x_account || null,
            updated_at: new Date().toISOString(),
        };

        // 3. 处理文件字段 (💥 这里的 formField 必须与 AdminPromptForm 的 submissionData.append 一致)
        const fileFields = [
            { formField: 'originalImage', dbField: 'original_image_url', folder: 'original' },
            { formField: 'optimizedImage', dbField: 'optimized_image_url', folder: 'optimized' },
            { formField: 'userPortrait', dbField: 'user_portrait_url', folder: 'portraits' },
            { formField: 'userBackground', dbField: 'user_background_url', folder: 'backgrounds' },
        ];

        for (const { formField, dbField, folder } of fileFields) {
            const file = formData.get(formField) as File | null;
            const existingUrl = recordData[dbField]; // 拿到旧 URL
            
            if (file && file.size > 0) {
                // 上传新图
                const newUrl = await uploadFile(file, folder);
                updateData[dbField] = newUrl;
                
                // 删除原有的旧图 (如果有)
                if (existingUrl) {
                    await deleteOldFile(existingUrl);
                }
            } else {
                // 没传新图，保持原样 (如果 recordData 里带了，就保留)
                if (existingUrl) {
                    updateData[dbField] = existingUrl;
                }
            }
        }
        
        // 4. 执行更新
        const { data, error: dbError } = await supabaseServiceRole
            .from('prompts')
            .update(updateData)
            .eq('id', recordId)
            .select();

        if (dbError) throw dbError;

        return NextResponse.json({ 
            message: '更新成功', 
            data: data?.[0] 
        }, { status: 200 });

    } catch (e: any) {
        console.error('更新 API 错误:', e);
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
    }
}