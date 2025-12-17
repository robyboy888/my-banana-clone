import { supabase } from "../src/lib/supabase"; 
import HomeClient from "./HomeClient";
import React from 'react';

// 这是服务端组件，没有 'use client'，所以可以安全访问数据库
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
        console.error("Fetch failed:", err);
    }

    // 将数据传给客户端组件
    return <HomeClient initialPrompts={initialData} />;
}