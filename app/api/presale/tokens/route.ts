import { NextResponse } from 'next/server'
import { getServiceRoleServerSupabaseClient } from '@/utils/supabase/newclient';

export async function GET() {

    const srSupabase = getServiceRoleServerSupabaseClient()

    const { data, error } = await srSupabase
        .from('tokens')
        .select('*');
    
    return NextResponse.json(
        { error: "'Internal Server Error'" },
        { status: 500 }
    )
}