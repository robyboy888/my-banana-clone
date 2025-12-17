// /app/api/admin/delete/route.ts
import { NextResponse } from 'next/server';
import { supabaseServiceRole } from '@/lib/supabaseService';

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: '缺少 ID 参数' }, { status: 400 });
        }

        const { error } = await supabaseServiceRole
            .from('prompts')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ message: '删除成功' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}