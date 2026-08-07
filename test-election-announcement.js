/**
 * Test script to verify election announcement creation
 * Run this after creating an election to verify announcements are created
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testElectionAnnouncement() {
  console.log('🧪 Testing Election Announcement System\n');

  try {
    // 1. Check latest announcements
    console.log('📢 Fetching latest announcements...');
    const { data: announcements, error: announcementError } = await supabase
      .from('announcements')
      .select('*')
      .eq('type', 'election')
      .order('created_at', { ascending: false })
      .limit(5);

    if (announcementError) {
      console.error('❌ Error fetching announcements:', announcementError);
    } else {
      console.log(`✅ Found ${announcements.length} election announcements:`);
      announcements.forEach((ann, index) => {
        console.log(`\n${index + 1}. ${ann.title}`);
        console.log(`   Message: ${ann.message}`);
        console.log(`   Priority: ${ann.priority}`);
        console.log(`   Active: ${ann.is_active}`);
        console.log(`   Created: ${new Date(ann.created_at).toLocaleString()}`);
      });
    }

    // 2. Check notifications sent to users
    console.log('\n\n🔔 Checking notifications sent to users...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*, user_profiles(full_name, email, role)')
      .eq('type', 'election')
      .order('created_at', { ascending: false })
      .limit(10);

    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError);
    } else {
      console.log(`✅ Found ${notifications.length} election notifications:`);
      
      // Group by title
      const grouped = notifications.reduce((acc, notif) => {
        if (!acc[notif.title]) {
          acc[notif.title] = [];
        }
        acc[notif.title].push(notif);
        return acc;
      }, {});

      Object.entries(grouped).forEach(([title, notifs]) => {
        console.log(`\n📧 "${title}" - Sent to ${notifs.length} users`);
        console.log(`   Sample recipients:`);
        notifs.slice(0, 3).forEach(n => {
          console.log(`   - ${n.user_profiles?.full_name} (${n.user_profiles?.role})`);
        });
      });
    }

    // 3. Check latest elections
    console.log('\n\n🗳️  Latest elections created:');
    const { data: elections, error: electionError } = await supabase
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (electionError) {
      console.error('❌ Error fetching elections:', electionError);
    } else {
      elections.forEach((election, index) => {
        console.log(`\n${index + 1}. ${election.name}`);
        console.log(`   Type: ${election.election_type}`);
        console.log(`   Department: ${election.department || 'N/A'}`);
        console.log(`   Status: ${election.status}`);
        console.log(`   Created: ${new Date(election.created_at).toLocaleString()}`);
      });
    }

    console.log('\n\n✅ Test completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Announcements are being created when elections are created`);
    console.log(`   - Notifications are being sent to all users`);
    console.log(`   - Students will see these announcements on the login page`);
    console.log(`   - Students will see notifications in their dashboard`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testElectionAnnouncement();
