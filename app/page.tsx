import { supabase } from "../src/lib/supabase"; 
import HomeClient from "./HomeClient";
import React from 'react';

// ✨ 加入这一行：禁用缓存，确保每次访问都抓取最新数据
export const revalidate = 0; 

export default async function Page() {
    let initialData = [];
    try {
        const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            initialData = data;
        }
    } catch (err) {
        console.error("数据库抓取失败:", err);
    }

    return <HomeClient initialPrompts={initialData} />;
}