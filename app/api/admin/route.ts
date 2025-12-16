// app/api/admin/route.ts

import { supabaseServiceRole } from '@/lib/supabaseService';
import { NextResponse, NextRequest } from 'next/server';

// 强制动态渲染，防止 Vercel 缓存
export const dynamic = 'force-dynamic'; 

// 新增记录 - 仅处理 POST 请求
export async function POST(request: NextRequest) {
    try {
        // 1. 解析请求数据 (处理表单数据或 JSON)
        // 假设您的表单是 multipart/form-data，需要处理文件
        const formData = await request.formData();
        
        // --- 💥 文件上传和 Supabase 插入逻辑开始 ---
        
        // 示例：获取非文件字段
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const imageFile = formData.get('image') as File | null;
        
        let imageUrl = null;
        
        if (imageFile && imageFile.size > 0) {
            // 假设您有一个处理文件上传的工具函数
            const path = `prompt_images/${Date.now()}-${imageFile.name}`;
            
            const { data: uploadData, error: uploadError } = await supabaseServiceRole.storage
                // 💥 关键点：使用我们新的备用 Bucket 名称
                .from('prompt-assets') 
                .upload(path, imageFile, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: imageFile.type,
                });

            if (uploadError) {
                console.error("SUPABASE_UPLOAD_ERROR:", uploadError);
                // 抛出错误以返回给前端
                throw new Error('文件上传失败: ' + uploadError.message); 
            }
            
            // 获取上传文件的公开 URL
            const { data: urlData } = supabaseServiceRole.storage
                .from('prompt-assets')
                .getPublicUrl(path);

            imageUrl = urlData.publicUrl;
        }

        // 2. 将数据插入到 Supabase
        const { data: newPrompt, error: insertError } = await supabaseServiceRole
            .from('prompts')
            .insert([{
                title: title,
                description: description,
                // 将上传的 URL 存入数据库
                image_url: imageUrl, 
                // ... 其他字段
            }])
            .select()
            .single();

        if (insertError) {
            console.error("SUPABASE_INSERT_ERROR:", insertError);
            return NextResponse.json({ message: 'Database error creating record', details: insertError.message }, { status: 500 });
        }

        // --- 💥 文件上传和 Supabase 插入逻辑结束 ---
        
        return NextResponse.json({ 
            message: 'Prompt created successfully', 
            data: newPrompt 
        }, { status: 201 });

    } catch (e: any) {
        console.error('API processing error:', e.message);
        // 返回明确的错误信息给前端
        return NextResponse.json({ message: 'API processing error: ' + e.message }, { status: 500 });
    }
}