// app/api/admin/[id]/route.ts
import { supabaseServiceRole } from '@/lib/supabaseService';
import { NextResponse } from 'next/server';

interface Context {
    params: {
        id: string;
    };
}

// GET 请求：获取单个记录用于编辑
export async function GET(request: Request, context: Context) {
    const promptId = parseInt(context.params.id);

    if (isNaN(promptId)) {
        return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    try {
        const { data: promptData, error } = await supabaseServiceRole
            .from('prompts')
            .select('*')
            .eq('id', promptId)
            .single();

        if (error) {
            console.error('Supabase fetch error:', error);
            return NextResponse.json({ 
                message: 'Database error fetching record', 
                details: error.message 
            }, { status: 500 });
        }

        if (!promptData) {
            return NextResponse.json({ message: 'Record not found' }, { status: 404 });
        }

        return NextResponse.json(promptData);

    } catch (e: any) {
        return NextResponse.json({ message: 'Internal server error', details: e.message }, { status: 500 });
    }
}