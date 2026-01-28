import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, ipAddress, userAgent } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Call the log_user_login function
    const { data, error } = await supabaseAdmin.rpc('log_user_login', {
      p_user_id: userId,
      p_ip_address: ipAddress || null,
      p_user_agent: userAgent || null
    });
    
    if (error) {
      console.error('Error logging user login:', error);
      throw error;
    }
    
    console.log('✅ Login tracked successfully for user:', userId);
    
    return NextResponse.json({
      success: true,
      sessionId: data,
      message: 'Login tracked successfully'
    });
    
  } catch (error: any) {
    console.error('Error tracking login:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to track login',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}
