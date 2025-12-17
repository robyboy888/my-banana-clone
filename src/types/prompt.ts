// types/prompt.ts

// 这是您应用中 Prompt 数据的完整接口定义，包含所有可能的字段
export interface Prompt {
    id: number;
    title: string;
    content: string; 
    
    // 图片 URL 字段 (来自 Supabase Storage)
    original_image_url: string; 
    optimized_image_url?: string; 
    user_portrait_url?: string;
    user_background_url?: string;
    
    // 优化提示词字段
    optimized_prompt?: string;
    
    // 时间戳 (如果您的数据库包含)
    created_at?: string; 
    updated_at?: string; 
	source_x_account?: string; // 👈 必须在这里加上这个字段
}