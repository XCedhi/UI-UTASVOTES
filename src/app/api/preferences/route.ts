import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRequestUser } from '@/lib/server-auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: valid session required' }, { status: 401 });
    }

    const { data: preferences, error } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching preferences:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return defaults if no preferences exist
    const result = preferences || {
      user_id: user.id,
      theme: 'light',
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      election_reminders: true,
      result_notifications: true,
      campaign_updates: false,
      language: 'en',
      timezone: 'Africa/Accra',
      preferences: {},
    };

    return NextResponse.json({ success: true, preferences: result });
  } catch (error: any) {
    console.error('💥 Error in GET preferences API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: valid session required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      theme,
      notifications_enabled,
      email_notifications,
      sms_notifications,
      push_notifications,
      election_reminders,
      result_notifications,
      campaign_updates,
      language,
      timezone,
      preferences,
    } = body;

    console.log('📝 Updating preferences for user:', user.id);

    const updateData: any = {
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (theme !== undefined) updateData.theme = theme;
    if (notifications_enabled !== undefined) updateData.notifications_enabled = notifications_enabled;
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (sms_notifications !== undefined) updateData.sms_notifications = sms_notifications;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
    if (election_reminders !== undefined) updateData.election_reminders = election_reminders;
    if (result_notifications !== undefined) updateData.result_notifications = result_notifications;
    if (campaign_updates !== undefined) updateData.campaign_updates = campaign_updates;
    if (language !== undefined) updateData.language = language;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (preferences !== undefined) updateData.preferences = preferences;

    const { data: upsertedPreferences, error: upsertError } = await supabaseAdmin
      .from('user_preferences')
      .upsert(updateData, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('❌ Error upserting preferences:', upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    console.log('✅ Preferences updated successfully:', upsertedPreferences);

    return NextResponse.json({
      success: true,
      preferences: upsertedPreferences,
    });
  } catch (error: any) {
    console.error('💥 Error in POST preferences API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}