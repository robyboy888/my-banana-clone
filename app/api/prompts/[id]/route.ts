import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const { data, error } = await supabaseServiceRole
            .from('prompts')
            .select('*')
            .eq('id', id)
            .single(); // 只查询单条

        if (error) throw error;
        if (!data) return NextResponse.json({ error: '未找到该记录' }, { status: 404 });

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}